import Budget from "../../models/budgetModel.js";
import User from "../../models/userModel.js";
import Transaction from "../../models/transactionModel.js";

// Helper: Calculate spend amount for a category from a list of transaction IDs
const previousTransactionsAmount = async (transactionIds, category) => {
  try {
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
    });

    return transactions.reduce(
      (sum, txn) => (txn.category === category ? sum + txn.amount : sum),
      0
    );
  } catch (error) {
    console.error("Error calculating previousTransactionsAmount:", error.message);
    throw new Error("Could not calculate spend amount for the budget.");
  }
};

const budgetResolver = {
  addBudget: async ({ budget }, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated. Please log in.");
      }

      const existingBudget = await Budget.findOne({ category: budget.category });
      if (existingBudget) {
        throw new Error("Budget for this category already exists.");
      }

      const user = await User.findById(req.userId);
      if (!user) {
        throw new Error("User not found.");
      }

      const totalSpent = await previousTransactionsAmount(
        user.transactions,
        budget.category
      );

      const newBudget = new Budget({
        category: budget.category,
        limit: budget.limit,
        spend: totalSpent,
      });

      const savedBudget = await newBudget.save();
      user.budgets.push(savedBudget._id);
      await user.save();

      return {
        ...savedBudget._doc,
        _id: savedBudget.id,
      };
    } catch (error) {
      console.error("Error in addBudget:", error.message);
      throw new Error("Failed to add budget. Please try again later.");
    }
  },

  deleteBudget: async ({ budgetId }, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated. Please log in.");
      }

      const deletedBudget = await Budget.findByIdAndDelete(budgetId);
      if (!deletedBudget) {
        throw new Error("Budget not found.");
      }

      const user = await User.findById(req.userId);
      if (!user) {
        throw new Error("User not found.");
      }

      user.budgets.pull(deletedBudget._id);
      await user.save();

      return {
        ...deletedBudget._doc,
        _id: deletedBudget.id,
      };
    } catch (error) {
      console.error("Error in deleteBudget:", error.message);
      throw new Error("Failed to delete budget. Please try again later.");
    }
  },

  updateBudget: async ({ budgetId, budget }, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated. Please log in.");
      }

      const existingBudget = await Budget.findOne({
        category: budget.category,
        _id: { $ne: budgetId },
      });

      if (existingBudget) {
        throw new Error("Budget for the selected category already exists.");
      }

      const budgetToUpdate = await Budget.findById(budgetId);
      if (!budgetToUpdate) {
        throw new Error("Budget not found.");
      }

      if (budgetToUpdate.category !== budget.category) {
        const user = await User.findById(req.userId);
        if (!user) {
          throw new Error("User not found.");
        }

        const newSpent = await previousTransactionsAmount(
          user.transactions,
          budget.category
        );

        budgetToUpdate.spend = newSpent;
        budgetToUpdate.category = budget.category;
      }

      budgetToUpdate.limit = budget.limit;
      const updatedBudget = await budgetToUpdate.save();

      return {
        ...updatedBudget._doc,
        _id: updatedBudget.id,
      };
    } catch (error) {
      console.error("Error in updateBudget:", error.message);
      throw new Error("Failed to update budget. Please try again later.");
    }
  },
};

export default budgetResolver;