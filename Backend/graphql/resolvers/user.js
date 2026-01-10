import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Transaction from "../../models/transactionModel.js";
import Budget from "../../models/budgetModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import OTP from "../../models/otpModel.js";

dotenv.config();

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

      const hashedPassword = await bcrypt.hash(user.password, 12);
      const newUser = new User({
        email: user.email,
        password: hashedPassword,
        name: user.name,
        address: user.address,
        contact: user.contact,
        profileImage: user.profileImage,
      });
      await newUser.save();
      return "User registered successfully.";
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
