import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<"email" | "otp" | "reset" | "success">("email");
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState<boolean>(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const expenseFlowToken = localStorage.getItem("expenseFlowToken");
    if (expenseFlowToken) {
      navigate("/app/");
    }
  }, []);

  // Start countdown timer for OTP resend
  const startOtpTimer = () => {
    setOtpTimer(60);
    setCanResendOtp(false);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResendOtp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error("Please enter your email address");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Send email with OTP

    try {
      const res = await axios.post(import.meta.env.VITE_BACKEND_URL, {
        query: `
                    query sendOTP($email: String!, $purpose: String!) {
                      sendOTP(email: $email, purpose: $purpose)
                    }
                  `,
        variables: { email, purpose: "forgotPassword" },
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message);
        return
      }

      toast.success("OTP sent successfully to your email!");
      setCurrentStep("otp");
      startOtpTimer();
    } catch (error: any) {
      toast.error(error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(import.meta.env.VITE_BACKEND_URL, {
        query: `
                    query verifyOTP($email: String!, $otp: String!) {
                      verifyOTP(email: $email, otp: $otp)
                    }
                  `,
        variables: { email, otp: otpCode },
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message);
        return
      }

      toast.success("OTP verified successfully!");
      
      setCurrentStep("reset");
    } catch (error: any) {
      toast.error(error || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(import.meta.env.VITE_BACKEND_URL, {
        query: `
                    mutation resetForgotPassword($email: String!, $newPassword: String!) {
                      resetForgotPassword(email: $email, newPassword: $newPassword)
                    }
                  `,
        variables: { email, newPassword },
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message);
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCurrentStep("success");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    setLoading(true);

    try {
      const res = await axios.post(import.meta.env.VITE_BACKEND_URL, {
        query: `
                    query sendOTP($email: String!, $purpose: String!) {
                      sendOTP(email: $email, purpose: $purpose)
                    }
                  `,
        variables: { email, purpose: "forgotPassword" },
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message);
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("New OTP sent to your email!");
      setOtp(["", "", "", "", "", ""]);
      startOtpTimer();
    } catch (error: any) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Forgot Password?
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          No worries! Enter your email address and we'll send you a verification
          code to reset your password.
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
            Email Address
          </Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending OTP...
            </div>
          ) : (
            "Send Verification Code"
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Remember your password?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-blue-600 dark:text-blue-400"
            onClick={() => navigate("/auth")}
          >
            Back to Sign In
          </Button>
        </p>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Enter Verification Code
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          We've sent a 6-digit verification code to
          <br />
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {email}
          </span>
        </p>
      </div>

      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div>
          <Label className="text-slate-700 dark:text-slate-300 text-center block mb-4">
            Enter 6-digit verification code
          </Label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !digit && index > 0) {
                    const prevInput = document.getElementById(
                      `otp-${index - 1}`
                    );
                    prevInput?.focus();
                  }
                }}
                className="w-12 h-12 text-center text-lg font-semibold"
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </div>
          ) : (
            "Verify Code"
          )}
        </Button>
      </form>

      <div className="text-center space-y-2">
        {otpTimer > 0 ? (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            Resend code in {otpTimer}s
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Didn't receive the code?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 dark:text-blue-400"
              onClick={handleResendOtp}
              disabled={loading || !canResendOtp}
            >
              Resend Code
            </Button>
          </p>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Wrong email?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-blue-600 dark:text-blue-400"
            onClick={() => setCurrentStep("email")}
          >
            Change Email
          </Button>
        </p>
      </div>
    </div>
  );

  const renderResetStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Create New Password
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Your identity has been verified. Please create a new secure password
          for your account.
        </p>
      </div>

      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <Label
            htmlFor="newPassword"
            className="text-slate-700 dark:text-slate-300"
          >
            New Password
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
              placeholder="Enter new password"
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

        <div>
          <Label
            htmlFor="confirmPassword"
            className="text-slate-700 dark:text-slate-300"
          >
            Confirm New Password
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
              placeholder="Confirm new password"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Password Requirements:
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li
              className={`flex items-center gap-2 ${
                newPassword.length >= 8
                  ? "text-green-600 dark:text-green-400"
                  : ""
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  newPassword.length >= 8
                    ? "bg-green-500"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
              At least 8 characters long
            </li>
            <li
              className={`flex items-center gap-2 ${
                /[A-Z]/.test(newPassword)
                  ? "text-green-600 dark:text-green-400"
                  : ""
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  /[A-Z]/.test(newPassword)
                    ? "bg-green-500"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
              Contains uppercase letter
            </li>
            <li
              className={`flex items-center gap-2 ${
                /[a-z]/.test(newPassword)
                  ? "text-green-600 dark:text-green-400"
                  : ""
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  /[a-z]/.test(newPassword)
                    ? "bg-green-500"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
              Contains lowercase letter
            </li>
            <li
              className={`flex items-center gap-2 ${
                /\d/.test(newPassword)
                  ? "text-green-600 dark:text-green-400"
                  : ""
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  /\d/.test(newPassword)
                    ? "bg-green-500"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
              Contains number
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Resetting Password...
            </div>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Password Reset Successful!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Your password has been successfully reset. You can now sign in with
          your new password.
        </p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p className="text-sm text-green-700 dark:text-green-300">
          🔒 For your security, you've been logged out of all devices. Please
          sign in again with your new password.
        </p>
      </div>

      <Button
        onClick={() => navigate("/auth")}
        className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
      >
        Continue to Sign In
      </Button>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case "email":
        return renderEmailStep();
      case "otp":
        return renderOtpStep();
      case "reset":
        return renderResetStep();
      case "success":
        return renderSuccessStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button - Hide on success step */}
        {currentStep !== "success" && (
          <Button
            variant="ghost"
            onClick={() => navigate("/auth")}
            className="mb-6 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        )}

        {/* Main Card */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="font-bold text-2xl text-slate-800 dark:text-slate-100">
                ExpenseFlow
              </span>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6">{renderStepContent()}</CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            🔒 This is a secure process. Your data is protected with bank-level
            encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
