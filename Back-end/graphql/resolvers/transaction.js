import User from "../../models/userModel.js";
import Transaction from "../../models/transactionModel.js";
import Budget from "../../models/budgetModel.js";

const transactionResolver = {
  addTransaction: async ({ transaction }, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated. Please log in.");
      }

      const newTransaction = new Transaction({
        transactionType: transaction.transactionType,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: new Date(transaction.date),
      });

      const savedTransaction = await newTransaction.save();

      const user = await User.findById(req.userId);
      if (!user) {
        throw new Error("User not found.");
      }

      user.transactions.push(savedTransaction._id);

      const budget = await Budget.findOne({ category: transaction.category });
      if (budget) {
        budget.spend += transaction.amount;
        await budget.save();
      }

      await user.save();

      return {
        ...savedTransaction._doc,
        _id: savedTransaction.id,
        date: savedTransaction.date.toISOString(),
      };
    } catch (error) {
      console.error("Error in addTransaction:", error.message);
      throw new Error("Failed to add transaction. Please try again later.");
    }
  },

  deleteTransaction: async ({ transactionId }, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated. Please log in.");
      }

      const transaction = await Transaction.findByIdAndDelete(transactionId);
      if (!transaction) {
        throw new Error("Transaction not found.");
      }

      const user = await User.findById(req.userId);
      if (!user) {
        throw new Error("User not found.");
      }

      user.transactions.pull(transaction._id);

      const budget = await Budget.findOne({ category: transaction.category });
      if (budget) {
        budget.spend -= transaction.amount;
        await budget.save();
      }

      await user.save();

      return {
        ...transaction._doc,
        _id: transaction.id,
        date: transaction.date.toISOString(),
      };
    } catch (error) {
      console.error("Error in deleteTransaction:", error.message);
      throw new Error("Failed to delete transaction. Please try again later.");
    }
  },

  updateTransaction: async ({ transactionId, transaction }, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated. Please log in.");
      }

      const existingTransaction = await Transaction.findById(transactionId);
      if (!existingTransaction) {
        throw new Error("Transaction not found.");
      }

      const oldCategory = existingTransaction.category;
      const oldAmount = existingTransaction.amount;
      const newCategory = transaction.category;
      const newAmount = transaction.amount;

      const oldBudget = await Budget.findOne({ category: oldCategory });
      const newBudget = await Budget.findOne({ category: newCategory });

      if (oldCategory !== newCategory) {
        if (oldBudget) {
          oldBudget.spend -= oldAmount;
          await oldBudget.save();
        }
        if (newBudget) {
          newBudget.spend += newAmount;
          await newBudget.save();
        }
      } else if (oldBudget) {
        oldBudget.spend = oldBudget.spend - oldAmount + newAmount;
        await oldBudget.save();
      }

      const updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionId,
        {
          ...transaction,
          date: new Date(transaction.date),
        },
        { new: true }
      );

      return {
        ...updatedTransaction._doc,
        _id: updatedTransaction.id,
        date: updatedTransaction.date.toISOString(),
      };
    } catch (error) {
      console.error("Error in updateTransaction:", error.message);
      throw new Error("Failed to update transaction. Please try again later.");
    }
  },
};

export default transactionResolver;
