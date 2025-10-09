import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
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
} from "@/components/ui/select.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Progress } from "@/components/ui/progress.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useBudget } from "@/stores/BudgetStore";
import type { budget } from "../types";

export default function BudgetPage() {

  const expenseFlowToken = localStorage.getItem("expenseFlowToken")
  const {budgets, setBudgets, addBudget, removeBudget, updateBudget} = useBudget();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState<string>("");
  const [editingBudget, setEditingBudget] = useState<budget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const getBudgets = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
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
            Authorization: `Bearer ${expenseFlowToken}`,
          },
        }
      );
      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message);
        return
      }
      setBudgets(res.data.data.getUserinfo.budgets);
    } catch (error) {
      toast.error("Failed to fetch budgets.");
    }
  };

  useEffect(() => {
    if (!expenseFlowToken) {
      window.location.href = "/auth"; // Redirect to login if no token
    }else{
      getBudgets();
    }
  }, []);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpend = budgets.reduce((sum, b) => sum + b.spend, 0);
  const overallProgress =
    totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

  const handleAddBudget = async () => {
    if (!newCategory || !newLimit) {
      toast.error("Please enter a category and limit.");
      return;
    }
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          query: `
            mutation addBudget($budget: budgetInput!) {
              addBudget(budget: $budget) {
                _id
                category
                limit
                spend
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
            Authorization: `Bearer ${expenseFlowToken}`,
          },
        }
      );
      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message);
        return
      }
      toast.success("Budget added successfully!");
      setShowAddDialog(false);
      setNewCategory("");
      setNewLimit("");
      addBudget(res.data.data.addBudget);
    } catch (error: any) {
      toast.error("Failed to add budget: " + error.message);
    } finally {
      await getBudgets();
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          query: `
            mutation deleteBudget($budgetId: ID!) {
              deleteBudget(budgetId: $budgetId) {
                _id
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
            Authorization: `Bearer ${expenseFlowToken}`,
          },
        }
      );
      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message);
        return
      }
      toast.success("Budget deleted successfully!");
      removeBudget(id);
    } catch (error: any) {
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
        import.meta.env.VITE_BACKEND_URL,
        {
          query: `
            mutation updateBudget($budgetId: ID!, $budget: budgetInput!) {
              updateBudget(budgetId: $budgetId, budget: $budget) {
                _id
                category
                limit
                spend
              }
            }
          `,
          variables: {
            budgetId: editingBudget ? editingBudget._id : "",
            budget: {
              category: newCategory,
              limit: Number.parseFloat(newLimit),
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
        toast.error(res.data.errors[0]?.message);
        return
      }
      toast.success("Budget updated successfully!");
      setEditingBudget(null);
      setNewCategory("");
      setNewLimit("");
      updateBudget(editingBudget?._id || "", res.data.data.updateBudget);
    } catch (error: any) {
      toast.error("Failed to update budget: " + error.message);
    } finally {
      await getBudgets();
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Budget Management
          </h1>
          <p className="text-slate-600 mt-1">
            Set and track your spending limits by category
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              size="lg"
            >
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
                <Label className="mb-2" htmlFor="category">
                  Category
                </Label>
                <Select
                  onValueChange={(value) => setNewCategory(value)}
                >
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
                <Label className="mb-2" htmlFor="limit">
                  Monthly Limit ($)
                </Label>
                <Input
                  id="limit"
                  type="number"
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="500"
                />
              </div>
              <Button onClick={handleAddBudget} className="w-full">
                Add Budget
              </Button>
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
                <p className="text-2xl font-bold text-blue-800">
                  ${totalSpend.toLocaleString()} / $
                  {totalBudget.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">
                  {overallProgress.toFixed(1)}% of total budget used
                </p>
              </div>
              <Badge
                variant={
                  overallProgress > 90
                    ? "destructive"
                    : overallProgress > 75
                    ? "secondary"
                    : "default"
                }
                className="text-sm"
              >
                {overallProgress > 90
                  ? "Over Budget"
                  : overallProgress > 75
                  ? "Near Limit"
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
          const progress =
            budget.limit > 0 ? (budget.spend / budget.limit) * 100 : 0;
          const remaining = budget.limit - budget.spend;

          return (
            <Card key={budget.category} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{budget.category}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingBudget(budget);
                        setNewCategory(budget.category);
                        setNewLimit(budget.limit.toString());
                      }}
                      className="text-slate-500 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBudget(budget._id)}
                      className="text-slate-500 hover:text-red-600"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">
                        ${budget.spend.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-500">
                        of ${budget.limit.toLocaleString()} budget
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          remaining >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
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
                        {progress > 90 ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                            <span className="text-red-600">Over limit</span>
                          </>
                        ) : progress > 75 ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                            <span className="text-yellow-600">Near limit</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-green-600">On track</span>
                          </>
                        )}
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
      <Dialog
        open={!!editingBudget}
        onOpenChange={() => setEditingBudget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="category">
                Category
              </Label>
              <Select
                value={newCategory}
                onValueChange={(value) => setNewCategory(value)}
              >
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
              <Label className="mb-2" htmlFor="edit-limit">
                Monthly Limit ($)
              </Label>
              <Input
                id="edit-limit"
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="500"
              />
            </div>
            <Button onClick={handleEditBudget} className="w-full">
              Update Budget
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};