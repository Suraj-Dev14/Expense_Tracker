import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card.jsx";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Camera,
  Shield,
  Download,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Input } from "@/components/ui/input.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import type { transaction, userProfile } from "@/types";

function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string); // ✅ Force type as string
    reader.onerror = (error) => reject(error);
  });
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<userProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
  });
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const expenseFlowToken = localStorage.getItem("expenseFlowToken");

  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.removeItem("expenseFlowToken");
    navigate("/");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          query: `
          mutation resetPassword($oldPassword: String!, $newPassword: String!) {
            resetPassword(oldPassword: $oldPassword, newPassword: $newPassword)
          }
        `,
          variables: { oldPassword, newPassword },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${expenseFlowToken}`,
          },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (res.data.errors) {
        toast.error(res.data.errors[0]?.message);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Password changed successfully!");
      setShowAddDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. Please try again.");
    }
  };

  const handleExportData = async () => {
    try {

      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          query: `
          query getUserinfo {
            getUserinfo {
              transactions {
                transactionType
                category
                amount
                description
                date
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
        return;
      }

      const transactions = res.data.data.getUserinfo.transactions;

      if (transactions.length === 0) {
        toast.error("No transactions found");
        return;
      }

      const header: string[] = [
        "Transaction Type",
        "Category",
        "Amount",
        "Description",
        "Date",
      ];
      const rows: (string | number)[][] = (transactions as transaction[]).map(
        (t) => [
          t.transactionType,
          t.category,
          t.amount,
          t.description,
          new Date(t.date).toLocaleDateString(),
        ]
      );

      const csvContent: string = [header, ...rows]
        .map((row: (string | number)[]) =>
          row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transactions.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      toast.error("Failed to export data: " + error.message);
    }
  };

  const validateStep = () => {
    if (!profile?.name?.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!profile?.contact?.trim()) {
      toast.error("Contact is required");
      return false;
    }
    if (!profile?.address?.trim()) {
      toast.error("Address is required");
      return false;
    }
    return true;
  };

  interface FileUploadEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleFileUpload = async (e: FileUploadEvent): Promise<void> => {
    try {
      setIsUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 50 * 1024) {
        toast.error("Image size should be less than 50kb");
        return;
      }

      const base64 = await convertToBase64(file); // ✅ Now always a string

      setProfile((prev) => (prev ? { ...prev, profileImage: base64 } : prev));
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  interface UpdateUserInput {
    name?: string;
    profileImage?: string | ArrayBuffer | null;
    address?: string;
    contact?: string;
  }

  interface UpdateUserResponse {
    data: {
      updateUser: {
        email: string;
      };
    };
    errors?: { message: string }[];
  }

  const handleProfileUpdate = async (
    e: React.FormEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);

    if (!validateStep()) {
      setSubmitting(false);
      return;
    }

    try {
      const res: UpdateUserResponse = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          query: `
            mutation update($user: updateUserInput) {
              updateUser(user: $user){
                email
              }
            }`,
          variables: {
            user: {
              email: profile?.email,
              name: profile?.name,
              profileImage: profile?.profileImage,
              address: profile?.address,
              contact: profile?.contact,
            } as UpdateUserInput,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${expenseFlowToken}`,
          },
        }
      );

      if (res.errors) {
        toast.error(res.errors[0]?.message || "Something went wrong");
        return;
      }

      toast.success("Profile updated successfully!");
      getUserData();
    } catch (error: any) {
      toast.error("Error updating profile: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getUserData = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          query: `
            query getUser {
              getUserinfo {
                _id
                name
                email
                address
                contact
                profileImage
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

      let userInfo = res.data.data.getUserinfo;

      if (!userInfo.name) userInfo.name = "User";
      if (!userInfo.address) userInfo.address = "India";
      if (!userInfo.contact) userInfo.contact = "+91 1234567890";

      setProfile(userInfo);
    } catch (error) {
      toast.error("Error fetching user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Profile & Settings
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onLogout}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="w-10 h-10" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={profile?.profileImage || "/placeholder.svg"}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      <div className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-500 text-center">
                  Click the camera icon to upload a profile picture <br />
                  <span className="text-xs">
                    JPG, PNG or JPEG Max size 50kb.
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="mb-2" htmlFor="name">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((prev) =>
                        prev ? { ...prev, name: e.target.value } : prev
                      )
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2" htmlFor="email">
                    Email Address
                  </Label>
                  <Input id="email" value={profile.email} disabled />
                </div>

                <div>
                  <Label className="mb-2" htmlFor="address">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) =>
                      setProfile((prev) =>
                        prev ? { ...prev, address: e.target.value } : prev
                      )
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="contact" className="mb-2">
                    Contact
                  </Label>
                  <Input
                    id="contact"
                    value={profile.contact}
                    onChange={(e) =>
                      setProfile((prev) =>
                        prev ? { ...prev, contact: e.target.value } : prev
                      )
                    }
                    placeholder="Enter your contact number"
                  />
                </div>
              </div>

              <Button
                onClick={handleProfileUpdate}
                className="w-full md:w-auto"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="old-password"
                        className="text-slate-700 mb-2"
                      >
                        Old Password
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="old-password"
                          type={showPassword.oldPassword ? "text" : "password"}
                          value={formData.oldPassword}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              oldPassword: e.target.value,
                            }))
                          }
                          className="pl-10 pr-10 h-12"
                          placeholder="Enter your old password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              oldPassword: !prev.oldPassword,
                            }))
                          }
                        >
                          {showPassword.oldPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="new-password"
                        className="text-slate-700 mb-2"
                      >
                        New Password
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="new-password"
                          type={showPassword.newPassword ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="pl-10 pr-10 h-12"
                          placeholder="Enter your new password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              newPassword: !prev.newPassword,
                            }))
                          }
                        >
                          {showPassword.newPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mt-2">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Password Requirements:
                        </p>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <li
                            className={`flex items-center gap-2 ${
                              formData.newPassword.length >= 8
                                ? "text-green-600 dark:text-green-400"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                formData.newPassword.length >= 8
                                  ? "bg-green-500"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            At least 8 characters long
                          </li>
                          <li
                            className={`flex items-center gap-2 ${
                              /[A-Z]/.test(formData.newPassword)
                                ? "text-green-600 dark:text-green-400"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                /[A-Z]/.test(formData.newPassword)
                                  ? "bg-green-500"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            Contains uppercase letter
                          </li>
                          <li
                            className={`flex items-center gap-2 ${
                              /[a-z]/.test(formData.newPassword)
                                ? "text-green-600 dark:text-green-400"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                /[a-z]/.test(formData.newPassword)
                                  ? "bg-green-500"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            Contains lowercase letter
                          </li>
                          <li
                            className={`flex items-center gap-2 ${
                              /\d/.test(formData.newPassword)
                                ? "text-green-600 dark:text-green-400"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                /\d/.test(formData.newPassword)
                                  ? "bg-green-500"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            Contains number
                          </li>
                        </ul>
                      </div>
                      <Label
                        htmlFor="confirm-Password"
                        className="text-slate-700 mb-2 mt-2"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="confirm-Password"
                          type={showPassword.newPassword ? "text" : "password"}
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
                    <Button onClick={handlePasswordChange} className="w-full">
                      Change Password
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data (CSV)
              </Button>
              <p className="text-sm text-slate-500">
                Export your transaction data to a CSV file.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
