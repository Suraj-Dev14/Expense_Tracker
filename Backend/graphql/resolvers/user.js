// userResolver.js
import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Transaction from "../../models/transactionModel.js";
import Budget from "../../models/budgetModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import OTP from "../../models/otpModel.js";

dotenv.config();

// Create transporter once
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // 16-char app password
  },
});

// Send OTP asynchronously
const sendOTPEmail = async (email, purpose, password = "") => {
  try {
    await OTP.deleteMany({ email });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = await bcrypt.hash(otp, 12);
    const newOTP = new OTP({ email, purpose, otpHash: hashedOTP });

    if (purpose === "registration" && password) {
      newOTP.password = await bcrypt.hash(password, 12);
    }

    await newOTP.save();

    // Send email asynchronously (non-blocking)
    transporter.sendMail({
      from: '"ExpenseFlow" <Expenseflow@gmail.com>',
      to: gmail,
      subject: "OTP for your ExpenseFlow Account Authenticate",
      html: `<div style="font-family: system-ui, sans-serif, Arial; font-size: 14px;">
              <p>To authenticate, please use the following One Time Password (OTP):</p>
              <p style="font-size: 22px;"><strong>${otp}</strong></p>
              <p>This OTP will be valid for 15 minutes.</p>
              <p>Do not share this OTP with anyone.</p>
            </div>`,
    }).catch(err => console.error("Email send failed:", err));

  } catch (err) {
    console.error("sendOTPEmail Error:", err);
    throw new Error("Failed to send OTP. Please try again later.");
  }
};

// Helper to fetch transactions
const findTransactions = async (transactionIds) => {
  try {
    const transactions = await Transaction.find({ _id: { $in: transactionIds } });
    return transactions.map(tx => ({ ...tx._doc, _id: tx.id, date: new Date(tx._doc.date).toISOString() }));
  } catch {
    throw new Error("Failed to fetch transactions.");
  }
};

// Helper to fetch budgets
const findBudgets = async (budgetIds) => {
  try {
    const budgets = await Budget.find({ _id: { $in: budgetIds } });
    return budgets.map(b => ({ ...b._doc, _id: b.id }));
  } catch {
    throw new Error("Failed to fetch budgets.");
  }
};

const userResolver = {
  registerUser: async ({ user }) => {
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) throw new Error("User with this email already exists.");

    await sendOTPEmail(user.email, "registration", user.password);
    return "OTP sent to email successfully.";
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("No account found with this email.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Incorrect password.");

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return { userId: user.id, token, tokenExpiration: 1 };
  },

  updateNewUser: async ({ user }) => {
    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      { contact: user.contact, address: user.address, name: user.name, profileImage: user.profileImage },
      { new: true }
    );
    if (!updatedUser) throw new Error("User not found.");
    return { ...updatedUser._doc, password: null, _id: updatedUser.id };
  },

  updateUser: async ({ user }, req) => {
    if (!req.userId) throw new Error("Unauthorized access.");

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { contact: user.contact, address: user.address, name: user.name, profileImage: user.profileImage },
      { new: true }
    );
    if (!updatedUser) throw new Error("User not found.");
    return { ...updatedUser._doc, password: null, _id: updatedUser.id };
  },

  getUserinfo: async (_, req) => {
    if (!req.userId) throw new Error("Unauthorized access.");

    const user = await User.findById(req.userId);
    if (!user) throw new Error("User not found.");

    return {
      ...user._doc,
      password: null,
      _id: user.id,
      transactions: findTransactions.bind(this, user._doc.transactions),
      budgets: findBudgets.bind(this, user._doc.budgets),
    };
  },

  sendOTP: async ({ email, purpose }) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("No account found with this email.");

    await sendOTPEmail(email, purpose);
    return "OTP sent to email successfully.";
  },

  verifyOTP: async ({ email, otp }) => {
    const existingOTP = await OTP.findOne({ email });
    if (!existingOTP) throw new Error("Invalid OTP.");

    if (new Date() - existingOTP.createdAt > 15 * 60 * 1000) {
      await OTP.deleteMany({ email });
      throw new Error("OTP has expired.");
    }

    const isMatch = await bcrypt.compare(String(otp), existingOTP.otpHash);
    if (!isMatch) throw new Error("Invalid OTP.");

    if (existingOTP.purpose === "registration") {
      const newUser = new User({ email: existingOTP.email, password: existingOTP.password });
      await newUser.save();
    }

    await OTP.deleteMany({ email });
    return "OTP verified successfully.";
  },

  resetForgotPassword: async ({ email, newPassword }) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("No account found with this email.");

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return "Password reset successfully.";
  },

  resetPassword: async ({ oldPassword, newPassword }, req) => {
    if (!req.isAuth) throw new Error("Unauthorized access.");

    const user = await User.findById(req.userId);
    if (!user) throw new Error("No account found with this email.");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Incorrect old password.");

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return "Password reset successfully.";
  },
};

export default userResolver;
