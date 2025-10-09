import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const expenseFlowUserEmail = localStorage.getItem("expenseFlowUserEmail");

  useEffect(() => {
    // Simulate OTP being sent on mount
    if (!expenseFlowUserEmail) {
      navigate("/auth");
      return;
    }
    const expenseFlowToken = localStorage.getItem("expenseFlowToken");
    if (expenseFlowToken) {
      navigate("/app/");
      return;
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return; // only digits

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      const nextInput = document.getElementById(`signup-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(import.meta.env.VITE_BACKEND_URL, {
        query: `
          query VerifyOTP($email: String!, $otp: String!) {
            verifyOTP(email: $email, otp: $otp)
          }
        `,
        variables: {
          email: expenseFlowUserEmail,
          otp: otpCode,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message);
        return;
      }

      if (otpCode === "000000") {
        toast.error("The code you entered is invalid. Please try again.");
        setLoading(false);
        return;
      }
      toast.success("Email verified successfully!");

      navigate("/profile-completion");
    } catch (error) {
      toast.error("Could not verify the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    localStorage.removeItem("expenseFlowUserEmail");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                Verify your email
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {expenseFlowUserEmail}
              </span>
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-slate-700 dark:text-slate-300 text-center block mb-4">
                  Enter 6-digit verification code
                </Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`signup-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && index > 0) {
                          const prevInput = document.getElementById(
                            `signup-otp-${index - 1}`
                          );
                          prevInput?.focus();
                        }
                      }}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      aria-label={`OTP digit ${index + 1}`}
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
                  "Verify Email"
                )}
              </Button>
            </form>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-2">
                Troubleshooting
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 text-left">
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Check your spam folder if you don't see the email.
                </li>
                <li>Codes expire after a short time for your security.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
