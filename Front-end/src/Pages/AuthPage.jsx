import { useNavigate } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardTitle, CardHeader } from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useState } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthPage = () => {
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

  const handleSubmit = async (e) => {
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
          `${import.meta.env.VITE_API_URL}expensetracker`,
          {
            query: `
              query Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                  userId
                  token
                }
              }
            `,
            variables: { email, password },
          },
          { headers: { "Content-Type": "application/json" } }
        );
        if (res.data.errors) {
          throw new Error(res.data.errors[0]?.message || "Login failed");
        }

        localStorage.setItem("Token", res.data.data.login.token);
        localStorage.setItem("userId", res.data.data.login.userId);
        toast.success("Login successful!");
        navigate("/app/dashboard");
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}expensetracker`,
          {
            query: `
              mutation Register($user: userInput!) {
                registerUser(user: $user) {
                  _id
                }
              }
            `,
            variables: {
              user: { email, password },
            },
          },
          { headers: { "Content-Type": "application/json" } }
        );
        if (res.data.errors) {
          throw new Error(res.data.errors[0]?.message || "Signup failed");
        }

        localStorage.setItem("userId", res.data.data.registerUser._id);
        toast.success("Account created successfully!");
        navigate("/profile-completion");
      }
    } catch (err) {
      console.error(err);
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

              {isLogin && (
                <div className="text-center">
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot your password?
                  </a>
                </div>
              )}
            </form>

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

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default AuthPage;
