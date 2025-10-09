import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import {
  Plus,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import TransactionCard from "@/ProjectComponents/TransactionCard";
import axios from "axios";
import { toast } from "react-toastify";
import { useTransaction } from "@/stores/TransactionStore";
import type { transaction } from "@/types";

export default function TransactionPage() {
  const expenseFlowToken = localStorage.getItem("expenseFlowToken");
  const {transactions, removeTransaction, setTransactions} = useTransaction();
  const [addTransaction, setAddTransaction] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [editTransaction, setEditTransaction] = useState<transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

   const getTransactions = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          query: `
            query getUserinfo {
              getUserinfo {
                transactions {
                  _id
                  transactionType
                  category
                  description
                  amount
                  date
                }
              }
            }
          `,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${expenseFlowToken}`,
          },
        }
      );

      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message || "Something went wrong");
        return
      }

      setTransactions(res.data.data.getUserinfo.transactions);
    } catch (error: any) {
      toast.error(error || "Failed to load transactions");
    }
  };

  useEffect(() => {
    if (!expenseFlowToken) {
      window.location.href = "/auth"; // Redirect to login if no token
    } else{
      getTransactions();
    }
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          query: `
            mutation deleteTransaction($transactionId: ID!) {
              deleteTransaction(transactionId: $transactionId) {
                _id
              }
            }
          `,
          variables: { transactionId: id },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${expenseFlowToken}`,
          },
        }
      );

      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message || "Something went wrong");
        return
      }
      toast.success("Transaction deleted");
      removeTransaction(id);
    } catch (error: any) {
      toast.error(error || "Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || t.category === filterCategory;
    const matchesType =
      filterType === "all" || t.transactionType === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Transactions</h1>
          <p className="text-slate-600 mt-1">
            Manage all your income and expenses
          </p>
        </div>
        <Button
          onClick={() => setAddTransaction(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </Button>
        {addTransaction && (
          <TransactionCard
            transaction={null}
            setTransaction={() => setAddTransaction(false)}
          />
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {/* Left */}
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.transactionType === "income"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {transaction.transactionType === "income" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-slate-800 truncate">
                          {transaction.description}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-xs whitespace-nowrap"
                        >
                          {transaction.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {new Date(transaction.date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex sm:flex-col sm:items-end items-center gap-3 sm:gap-2">
                    <p
                      className={`font-semibold text-lg ${
                        transaction.transactionType === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.transactionType === "income" ? "+" : "-"}$
                      {transaction.amount.toLocaleString()}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTransaction(transaction)}
                        className="text-slate-500 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction._id)}
                        className="text-slate-500 hover:text-red-600"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium mb-2">
                  No transactions found
                </p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Drawer */}
      {editTransaction && (
        <TransactionCard
          transaction={editTransaction}
          setTransaction={setEditTransaction}
        />
      )}
    </div>
  );
};