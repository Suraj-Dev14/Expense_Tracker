import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  PieChartIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
];

const AnalyticsPage = () => {
  const [transactions, setTransactions] = useState([]);

  const getTransactions = async () => {
    try {
      const res = await axios.post(
        `https://expense-tracker-y9ar.onrender.com/expensetracker`,
        {
          query: `
            query getUserinfo {
              getUserinfo {
                transactions {
                  _id
                  transactionType
                  category
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
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );

      if (res.data.errors) {
        throw new Error(res.data.errors[0]?.message || "Something went wrong");
      }

      setTransactions(res.data.data.getUserinfo.transactions);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load transactions");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("Token")) {
      getTransactions();
    }
  }, []);

  const monthlyData = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[monthKey]) acc[monthKey] = { month: monthKey, income: 0, expenses: 0 };
    if (t.transactionType === "income") acc[monthKey].income += t.amount;
    else acc[monthKey].expenses += t.amount;
    return acc;
  }, {});

  const trendData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const categoryData = transactions
    .filter((t) => t.transactionType === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(categoryData).map(([category, value]) => ({ name: category, value }));

  const topCategories = Object.entries(categoryData).sort(([, a], [, b]) => b - a).slice(0, 5);

  const totalIncome = transactions
    .filter((t) => t.transactionType === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.transactionType === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-white">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-600 mt-1">Insights and trends from your financial data</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Savings Rate</CardTitle>
            <Target className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{savingsRate.toFixed(1)}%</div>
            <div className="text-xs text-blue-600 mt-1 flex items-center">
              {savingsRate > 20 ? (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" /> Excellent savings rate!
                </>
              ) : savingsRate > 10 ? (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" /> Good savings rate
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 mr-1" /> Consider saving more
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Avg Monthly Income</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              ${(totalIncome / Math.max(1, trendData.length)).toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Based on {trendData.length} months
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Top Category</CardTitle>
            <PieChartIcon className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {topCategories[0]?.[0] || "N/A"}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              ${topCategories[0]?.[1]?.toLocaleString() || "0"} spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-600">No transactions available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={80} labelLine={false}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-600">No transactions available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map(([cat, amt], i) => (
                <div key={cat} className="flex justify-between items-center bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-medium">{cat}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${amt.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">
                      {((amt / totalExpenses) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-blue-800 font-semibold mb-2">💡 Spending Pattern</h4>
                <p className="text-sm text-blue-700">
                  Your highest spending category is {topCategories[0]?.[0] || "N/A"}. Consider setting a budget for it.
                </p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-green-800 font-semibold mb-2">📈 Savings Goal</h4>
                <p className="text-sm text-green-700">
                  {savingsRate > 20
                    ? "Great job! You're saving over 20% of your income."
                    : "Try to save at least 20% for long-term stability."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
