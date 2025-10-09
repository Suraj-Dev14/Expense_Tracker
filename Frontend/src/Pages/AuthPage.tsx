import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
} from "@/components/ui/card.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import {toast } from "react-toastify";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const token = localStorage.getItem("expenseFlowToken");
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("expenseFlowToken");
    } else {
      navigate("/app/");
    }
  }
}, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      setLoading(false);
      return;
    }

    const email = formData.email;
    const password = formData.password;

    try {
      if (isLogin) {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL,
          {
            query: `
              query Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                  token
                }
              }
            `,
            variables: { email, password },
          },
          { headers: { "Content-Type": "application/json" } }
        );
        if (res.data.errors) {
          toast.error(res.data.errors[0]?.message || "Login failed");
          return
        }

        localStorage.setItem("expenseFlowToken", res.data.data.login.token);
        toast.success("Login successful!");
        navigate("/app");
      } else {

        if (password.length < 8) {
          toast.error("Password must be at least 8 characters long");
          return;
        }
        if (!/[A-Z]/.test(password)) {
          toast.error(
            "Password must contain at least one uppercase letter"
          );
          return;
        }
        if (!/[a-z]/.test(password)) {
          toast.error(
            "Password must contain at least one lowercase letter"
          );
          return;
        }
        if (!/\d/.test(password)) {
          toast.error("Password must contain at least one number");
          return;
        }
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL,
          {
            query: `
              mutation Register($user: userInput!) {
                registerUser(user: $user)
              }
            `,
            variables: {
              user: { email, password },
            },
          },
          { headers: { "Content-Type": "application/json" } }
        );
        if (res.data.errors) {
          toast.error(res.data.errors[0]?.message);
          return
        }
        localStorage.setItem("expenseFlowUserEmail", email);
        toast.success("An OTP has been sent to your email");

        navigate("/otp-verification");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="font-bold text-2xl text-slate-800">
                ExpenseFlow
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {isLogin
                ? "Sign in to access your financial dashboard"
                : "Join thousands of users managing their finances smarter"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-slate-700">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="pl-10 h-12"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="pl-10 pr-10 h-12"
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  {/* Password Requirements */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password Requirements:
                    </p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <li
                        className={`flex items-center gap-2 ${
                          formData.password.length >= 8
                            ? "text-green-600 dark:text-green-400"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            formData.password.length >= 8
                              ? "bg-green-500"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                        At least 8 characters long
                      </li>
                      <li
                        className={`flex items-center gap-2 ${
                          /[A-Z]/.test(formData.password)
                            ? "text-green-600 dark:text-green-400"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            /[A-Z]/.test(formData.password)
                              ? "bg-green-500"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                        Contains uppercase letter
                      </li>
                      <li
                        className={`flex items-center gap-2 ${
                          /[a-z]/.test(formData.password)
                            ? "text-green-600 dark:text-green-400"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            /[a-z]/.test(formData.password)
                              ? "bg-green-500"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                        Contains lowercase letter
                      </li>
                      <li
                        className={`flex items-center gap-2 ${
                          /\d/.test(formData.password)
                            ? "text-green-600 dark:text-green-400"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            /\d/.test(formData.password)
                              ? "bg-green-500"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                        Contains number
                      </li>
                    </ul>
                  </div>
                  <Label htmlFor="confirmPassword" className="text-slate-700">
                    Confirm Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="pl-10 h-12"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreeToTerms: checked === true,
                      }))
                    }
                  />
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-sm text-slate-600"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>

              
            </form>
            {isLogin && (
                <div className="text-center">
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-slate-600">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-blue-600 hover:underline"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({
                      email: "",
                      password: "",
                      confirmPassword: "",
                      agreeToTerms: false,
                    });
                  }}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            🔒 Your data is protected with bank-level encryption and security
            measures
          </p>
        </div>
      </div>

    </div>
  );
};