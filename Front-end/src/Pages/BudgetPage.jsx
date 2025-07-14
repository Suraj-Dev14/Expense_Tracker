import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
  Plus,
  Target,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Progress } from "@/Components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [editingBudget, setEditingBudget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = [
    "Food & Dining", "Transportation", "Shopping", "Entertainment",
    "Bills & Utilities", "Healthcare", "Education", "Travel",
    "Groceries", "Salary", "Freelance", "Investment", "Gift", "Other",
  ];

  const getBudgets = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}expensetracker`,
        {
          query: `
            query getUserinfo {
              getUserinfo {
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
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );
      if (res.data.errors) {
        throw new Error(res.data.errors[0]?.message || "Something went wrong");
      }
      setBudgets(res.data.data.getUserinfo.budgets);
    } catch (error) {
      toast.error("Failed to fetch budgets.");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("Token")) {
      getBudgets();
    }
  }, []);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpend = budgets.reduce((sum, b) => sum + b.spend, 0);
  const overallProgress = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

  const handleAddBudget = async () => {
    if (!newCategory || !newLimit) {
      toast.error("Please enter a category and limit.");
      return;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}expensetracker`,
        {
          query: `
            mutation addBudget($budget: budgetInput!) {
              addBudget(budget: $budget) {
                category
                limit
              }
            }
          `,
          variables: {
            budget: {
              category: newCategory,
              limit: Number.parseFloat(newLimit),
            },
          },
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
      toast.success("Budget added successfully!");
      setShowAddDialog(false);
      setNewCategory("");
      setNewLimit("");
    } catch (error) {
      toast.error("Failed to add budget: " + error.message);
    } finally {
      await getBudgets();
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      setIsDeleting(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}expensetracker`,
        {
          query: `
            mutation deleteBudget($budgetId: ID!) {
              deleteBudget(budgetId: $budgetId) {
                category
                limit
              }
            }
          `,
          variables: { budgetId: id },
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
      toast.success("Budget deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete budget: " + error.message);
    } finally {
      await getBudgets();
      setIsDeleting(false);
    }
  };

  const handleEditBudget = async () => {
    if (!newCategory || !newLimit) {
      toast.error("Please enter a category and limit.");
      return;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}expensetracker`,
        {
          query: `
            mutation updateBudget($budgetId: ID!, $budget: budgetInput!) {
              updateBudget(budgetId: $budgetId, budget: $budget) {
                category
                limit
              }
            }
          `,
          variables: {
            budgetId: editingBudget._id,
            budget: {
              category: newCategory,
              limit: Number.parseFloat(newLimit),
            },
          },
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
      toast.success("Budget updated successfully!");
      setEditingBudget(null);
      setNewCategory("");
      setNewLimit("");
    } catch (error) {
      toast.error("Failed to update budget: " + error.message);
    } finally {
      await getBudgets();
    }
  };

  return (
    <div className="space-y-6 text-white">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Budget Management</h1>
          <p className="text-slate-600 mt-1">Set and track your spending limits by category</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-2" htmlFor="category">Category</Label>
                <Select id="category" onValueChange={(value) => setNewCategory(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2" htmlFor="limit">Monthly Limit ($)</Label>
                <Input id="limit" type="number" onChange={(e) => setNewLimit(e.target.value)} placeholder="500" />
              </div>
              <Button onClick={handleAddBudget} className="w-full">Add Budget</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Target className="w-5 h-5" />
            Overall Budget Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-blue-800">${totalSpend.toLocaleString()} / ${totalBudget.toLocaleString()}</p>
                <p className="text-sm text-blue-600">{overallProgress.toFixed(1)}% of total budget used</p>
              </div>
              <Badge
                variant={
                  overallProgress > 90 ? "destructive"
                    : overallProgress > 75 ? "secondary"
                    : "default"
                }
                className="text-sm"
              >
                {overallProgress > 90 ? "Over Budget"
                  : overallProgress > 75 ? "Near Limit"
                  : "On Track"}
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const progress = budget.limit > 0 ? (budget.spend / budget.limit) * 100 : 0;
          const remaining = budget.limit - budget.spend;

          return (
            <Card key={budget.category} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{budget.category}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingBudget(budget);
                      setNewCategory(budget.category);
                      setNewLimit(Number(budget.limit.toString()));
                    }} className="text-slate-500 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteBudget(budget._id)} className="text-slate-500 hover:text-red-600" disabled={isDeleting}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">${budget.spend.toLocaleString()}</p>
                      <p className="text-sm text-slate-500">of ${budget.limit.toLocaleString()} budget</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${Math.abs(remaining).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-500">
                        {remaining >= 0 ? "remaining" : "over budget"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{progress.toFixed(1)}% used</span>
                      <span className="flex items-center gap-1">
                        {progress > 90 ? <><AlertTriangle className="w-3 h-3 text-red-500" /><span className="text-red-600">Over limit</span></>
                          : progress > 75 ? <><AlertTriangle className="w-3 h-3 text-yellow-500" /><span className="text-yellow-600">Near limit</span></>
                            : <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-green-600">On track</span></>}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="category">Category</Label>
              <Select id="category" value={newCategory} onValueChange={(value) => setNewCategory(value)}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2" htmlFor="edit-limit">Monthly Limit ($)</Label>
              <Input id="edit-limit" type="number" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} placeholder="500" />
            </div>
            <Button onClick={handleEditBudget} className="w-full">Update Budget</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetPage;
