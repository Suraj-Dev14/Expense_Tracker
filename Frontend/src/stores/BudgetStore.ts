import { create } from "zustand";
import type { budget } from "../types";

interface budgetStore {
  budgets: budget[];
  setBudgets: (budgets: budget[]) => void;
  addBudget: (budget: budget) => void;
  removeBudget: (id: string) => void;
  updateBudget: (id: string, updatedBudget: budget) => void;
}

export const useBudget = create<budgetStore>((set) => ({
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  addBudget: (budget) => {
    set((state) => ({ budgets: [...state.budgets, budget] }));
  },
  removeBudget: (id) => {
    set((state) => ({
      budgets: state.budgets.filter((budget) => budget._id !== id),
    }));
  },
  updateBudget: (id, updatedBudget) => {
    set((state) => ({
      budgets: state.budgets.map((budget) =>
        budget._id === id ? updatedBudget : budget
      ),
    }));
  },
}));
