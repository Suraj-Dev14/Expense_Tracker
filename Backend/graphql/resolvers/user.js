import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Transaction from "../../models/transactionModel.js";
import Budget from "../../models/budgetModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import OTP from "../../models/otpModel.js";

dotenv.config();

const sendOTPEmail = async (email, purpose, password = "") => {
  await OTP.deleteMany({ email });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const info = await transporter.sendMail({
    from: '"ExpenseFlow" <Expenseflow@gmail.com>',
    to: email,
    subject: "OTP for your ExpenseFlow Account Authenticate",
    html: `<div style="font-family: system-ui, sans-serif, Arial; font-size: 14px;"><br>
                <p style="padding-top: 14px; border-top: 1px solid #eaeaea;">To authenticate, please use the following One Time Password (OTP):</p>
                <p style="font-size: 22px;"><strong>${otp}</strong></p>
                <p>This OTP will be valid for 15 minutes.</p>
                <p>Do not share this OTP with anyone. If you didn't make this request, you can safely ignore this email.<br>ExpenseFlow will never contact you about this email or ask for any login codes or links. Beware of phishing scams.</p>
                <p>Thanks for visiting ExpenseFlow!</p>
                </div>`,
  });
  const hashedOTP = await bcrypt.hash(otp, 12);
  const newOTP = new OTP({
    email,
    purpose: purpose,
    otpHash: hashedOTP,
  });
  if (purpose === "registration") {
    const hashedPassword = await bcrypt.hash(password, 12);
    newOTP.password = hashedPassword;
  }
  await newOTP.save();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // 16-char app password
  },
});

const findTransactions = async (transactionIds) => {
  try {
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
    });

    return transactions.map((transaction) => ({
      ...transaction._doc,
      _id: transaction.id,
      date: new Date(transaction._doc.date).toISOString(),
    }));
  } catch (error) {
    throw new Error("Failed to fetch transactions. Please try again later.");
  }
};

const findBudgets = async (budgetIds) => {
  try {
    const budgets = await Budget.find({
      _id: { $in: budgetIds },
    });

    return budgets.map((budget) => ({
      ...budget._doc,
      _id: budget.id,
    }));
  } catch (error) {
    throw new Error("Failed to fetch budgets. Please try again later.");
  }
};

const userResolver = {
  registerUser: async ({ user }) => {
    try {
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        throw new Error("User with this email already exists.");
      }

      await sendOTPEmail(user.email, "registration", user.password);
      return "OTP sent to email successfully.";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("No account found with this email.");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Incorrect password.");
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return {
        userId: user.id,
        token,
        tokenExpiration: 1,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateNewUser: async ({ user }) => {
    try {
      const updatedUser = await User.findOneAndUpdate(
       { email: user.email },
        {
          contact: user.contact,
          address: user.address,
          name: user.name,
          profileImage: user.profileImage,
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("User not found.");
      }

      return { ...updatedUser._doc, password: null, _id: updatedUser.id };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateUser: async ({ user }, req) => {
    try {
      if (!req.userId) {
        throw new Error("Unauthorized access.");
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        {
          contact: user.contact,
          address: user.address,
          name: user.name,
          profileImage: user.profileImage,
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("User not found.");
      }

      return { ...updatedUser._doc, password: null, _id: updatedUser.id };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUserinfo: async (args, req) => {
    try {
      if (!req.userId) {
        throw new Error("Unauthorized access.");
      }

      const user = await User.findById(req.userId);
      if (!user) {
        throw new Error("User not found.");
      }

      return {
        ...user._doc,
        password: null,
        _id: user.id,
        transactions: findTransactions.bind(this, user._doc.transactions),
        budgets: findBudgets.bind(this, user._doc.budgets),
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  sendOTP: async ({ email, purpose }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("No account found with this email.");
      }
      await sendOTPEmail(email, purpose);
      return "OTP sent to email successfully.";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  verifyOTP: async ({ email, otp }) => {
    try {
      const Existingotp = await OTP.findOne({ email });
      if (!Existingotp) {
        throw new Error("Invalid OTP.");
      }

      if (new Date() - Existingotp.createdAt > 15 * 60 * 1000) {
        await OTP.deleteMany({ email });
        throw new Error("OTP has expired. Please request a new one.");
      }

      const isMatch = await bcrypt.compare(String(otp), Existingotp.otpHash);
      if (!isMatch) {
        throw new Error("Invalid OTP.");
      }

      if (Existingotp.purpose === "registration") {
        const newUser = new User({
          email: Existingotp.email,
          password: Existingotp.password,
        });
        await newUser.save();
      }

      await OTP.deleteMany({ email });
      return "OTP verified successfully.";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  resetForgotPassword: async ({ email, newPassword }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("No account found with this email.");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();
      return "Password reset successfully.";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  resetPassword: async ({ oldPassword, newPassword }, req) => {
    try {
      console.log(req);
      if (!req.isAuth) {
        throw new Error("Unauthorized access.");
      }
      const user = await User.findById(req.userId);
      if (!user) {
        throw new Error("No account found with this email.");
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new Error("Incorrect old password.");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();
      return "Password reset successfully.";
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

export default userResolver;
