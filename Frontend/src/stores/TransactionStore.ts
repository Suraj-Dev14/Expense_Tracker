import { create } from "zustand";
import type { transaction } from "../types";

interface transactionStore {
  transactions: transaction[];
  setTransactions: (transactions: transaction[]) => void;
  addTransaction: (transaction: transaction) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, updatedTransaction: transaction) => void;
}

export const useTransaction = create<transactionStore>((set) => ({
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => {
    set((state) => ({ transactions: [...state.transactions, transaction] }));
  },
  removeTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((expense) => expense._id !== id),
    }));
  },
  updateTransaction: (id, updatedTransaction) => {
    set((state) => ({
      transactions: state.transactions.map((transaction) =>
        transaction._id === id ? updatedTransaction : transaction
      ),
    }));
  },
}));
