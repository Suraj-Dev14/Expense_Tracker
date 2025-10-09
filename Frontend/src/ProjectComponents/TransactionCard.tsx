import { Button } from "@/components/ui/button.jsx";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.jsx";
import { Calendar } from "@/components/ui/calendar.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.jsx";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label.jsx";
import { Input } from "@/components/ui/input.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Other",
];

import type { transaction } from "@/types";
import { useTransaction } from "@/stores/TransactionStore";

interface TransactionCardProps {
  transaction: transaction | null;
  setTransaction: (transaction: transaction | null) => void;
}

export default function TransactionCard({
  transaction,
  setTransaction,
}: TransactionCardProps) {
  const expenseFlowToken = localStorage.getItem("expenseFlowToken")
  const { addTransaction, updateTransaction } = useTransaction();
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date(),
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.transactionType,
        category: transaction.category,
        amount: transaction.amount.toLocaleString(),
        description: transaction.description,
        date: new Date(transaction.date),
      });
    } else {
      setFormData({
        type: "expense",
        category: "",
        amount: "",
        description: "",
        date: new Date(),
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (transaction) {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL,
          {
            query: `
              mutation updateTransaction($transactionId: ID!,$transaction: transactionInput!) {
                updateTransaction(transactionId: $transactionId,transaction: $transaction) {
                  _id
                  transactionType
                  category
                  amount
                  description
                  date
                }
              }
            `,
            variables: {
              transactionId: transaction._id,
              transaction: {
                transactionType: formData.type,
                category: formData.category,
                amount: parseFloat(formData.amount),
                description: formData.description,
                date: formData.date,
              },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${expenseFlowToken}`,
            },
          }
        );
        if (res.data.errors) {
          toast.error(res.data.errors[0]?.message || "Update failed");
          return;
        }
        toast.success("Transaction updated successfully!");
        updateTransaction(transaction._id, res.data.data.updateTransaction);
      } else {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL,
          {
            query: `
              mutation addTransaction($transaction: transactionInput!) {
                addTransaction(transaction: $transaction) {
                  _id
                  transactionType
                  category
                  amount
                  description
                  date
                }
              }
            `,
            variables: {
              transaction: {
                transactionType: formData.type,
                category: formData.category,
                amount: parseFloat(formData.amount),
                description: formData.description,
                date: formData.date,
              },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${expenseFlowToken}`,
            },
          }
        );
        if (res.data.errors) {
          toast.error(res.data.errors[0]?.message || "Add failed");
          return;
        }
        toast.success("Transaction added successfully!");
        addTransaction(res.data.data.addTransaction);
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      type: "expense",
      category: "",
      amount: "",
      description: "",
      date: new Date(),
    });
    setTransaction(null);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {transaction ? "Edit Transaction" : "Add New Transaction"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-base font-medium">Transaction Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="cursor-pointer">
                    💸 Expense
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="cursor-pointer">
                    💰 Income
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="mb-2" htmlFor="category">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2" htmlFor="amount">
                Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="description">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="What was this transaction for?"
                required
              />
            </div>

            <div>
              <Label className="mb-2">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) =>
                      date && setFormData((prev) => ({ ...prev, date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {transaction ? "Update" : "Add"} Transaction
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
