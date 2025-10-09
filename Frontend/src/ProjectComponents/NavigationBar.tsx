import {
  Home,
  Receipt,
  BarChart3,
  PiggyBank,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/app/" },
  {
    id: "transactions",
    label: "Transactions",
    icon: Receipt,
    path: "/app/transactions",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/app/analytics",
  },
  { id: "budget", label: "Budget", icon: PiggyBank, path: "/app/budgets" },
  { id: "profile", label: "Profile", icon: User, path: "/app/profile" },
];

const NavigationBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [activeTab, setActiveTab] = useState(
    navItems.find((item) => item.path === currentPath)?.id || "dashboard"
  );

  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.removeItem("expenseFlowToken");
    navigate("/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-slate-200 min-h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-xl text-slate-800">
              ExpenseFlow
            </span>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const classes = `
                w-full justify-start gap-3 h-12 
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-800"
                }
              `;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={classes}
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(item.path);
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              );
            })}
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full justify-start gap-3 h-12 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const classes = `
              flex flex-col gap-1 h-auto py-2 px-3 
              ${isActive ? "text-blue-600" : "text-slate-500"}
            `;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={classes}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(item.path);
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
          <Button
            variant="outline"
            onClick={onLogout}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>
    </>
  );
};

export default NavigationBar;
