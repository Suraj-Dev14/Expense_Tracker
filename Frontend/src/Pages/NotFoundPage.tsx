import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Home, Search, ArrowLeft, FileQuestion, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const expenseFlowToken = localStorage.getItem("expenseFlowToken");

  const handleViewDashboard = () => {
    if (expenseFlowToken) {
      navigate("/app");
    } else {
      toast.info("Please log in to access the dashboard.");
      navigate("/");
    }
  };

  const handleGoToLanding = () => {
    navigate("/");
  };

  const handleViewTransactions = () => {
    if (expenseFlowToken) {
      navigate("/app/transactions");
    } else {
      toast.info("Please log in to view your transactions.");
      navigate("/");
    }
  };

  const handleViewAnalytics = () => {
    if (expenseFlowToken) {
      navigate("/app/analytics");
    } else {
      toast.info("Please log in to view your analytics.");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="font-bold text-3xl text-slate-800 dark:text-slate-100">
            ExpenseFlow
          </span>
        </div>

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl md:text-9xl font-bold text-slate-200 dark:text-slate-700 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <FileQuestion className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl mb-8">
          <CardContent className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              The page you're looking for seems to have wandered off. Don't
              worry, even the best expense trackers sometimes lose track of
              things!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                onClick={handleViewDashboard}
              >
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Go to Dashboard
                </div>
              </Button>

              <Button variant="outline" size="lg" onClick={handleGoToLanding}>
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Go to Landing Page
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick as */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Home className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Dashboard
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                View your financial overview and recent transactions
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700"
                onClick={handleViewDashboard}
              >
                Visit Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Transactions
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Manage and search through all your transactions
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
                onClick={handleViewTransactions}
              >
                View Transactions
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Compass className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Explore insights and trends in your spending
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
                onClick={handleViewAnalytics}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
