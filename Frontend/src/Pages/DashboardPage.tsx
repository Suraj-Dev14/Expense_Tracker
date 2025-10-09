import { Button } from "@/components/ui/button.jsx";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import TransactionCard from "@/ProjectComponents/TransactionCard.js";
import RecentTransactions from "@/ProjectComponents/RecentTransaction.js";
import ExpenseChart from "@/ProjectComponents/ExpenseChart";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTransaction } from "@/stores/TransactionStore";

export default function DashboardPage() {
  const expenseFlowToken = localStorage.getItem("expenseFlowToken")
  const { transactions, setTransactions } = useTransaction();
  const [addTransaction, setAddTransaction] = useState(false);
  const navigate = useNavigate();

  const getTransactionsandBudgets = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          query: `
            query getUserinfo {
              getUserinfo {
                transactions{
                  _id
                  transactionType
                  category
                  amount
                  description
                  date
                }
                budgets{
                  _id
                  category
                  limit
                  spend
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
      toast.error(error.message || "Failed to load dashboard data");
    }
  };

  useEffect(() => {
  if (!expenseFlowToken) {
    navigate("/auth");
  } else {
    try {
      const payload = JSON.parse(atob(expenseFlowToken.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        toast.error("Session expired, please log in again");
        localStorage.removeItem("expenseFlowToken");
        navigate("/auth");
        return;
      }
      getTransactionsandBudgets();
    } catch {
      navigate("/auth");
    }
  }
}, []);


  // Calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  const totalIncome = monthlyTransactions
    .filter((t) => t.transactionType === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter((t) => t.transactionType === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = totalIncome - totalExpenses;

  const todayTransactions = transactions.filter((t) => {
    const today = new Date().toISOString().split("T")[0];
    return t.date.split("T")[0] === today;
  });

  const todayExpenses = todayTransactions
    .filter((t) => t.transactionType === "expense")
    .reduce((sum, t) => sum + t.amount, 0);


  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome back! 👋
          </h1>
          <p className="text-slate-600 mt-1">
            Here's your financial overview for{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
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
            setTransaction={(transaction) => setAddTransaction(transaction !== null)}
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Total Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              ${totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              ${totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Net Savings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              ${totalSavings.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Today's Expenses
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              ${todayExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800">Expense Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseChart />
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg h-[450px]">
          <CardHeader>
            <CardTitle className="text-slate-800">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[95%]">
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};