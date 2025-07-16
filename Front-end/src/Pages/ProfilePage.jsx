import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Camera, Shield, Download } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/Avatar";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/Components/ui/input";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("Token");

      const res = await axios.post(
        `https://expense-tracker-y9ar.onrender.com/expensetracker`,
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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.errors) {
        throw new Error(res.data.errors[0]?.message || "Something went wrong");
      }

      const transactions = res.data.data.getUserinfo.transactions;

      if(transactions.length === 0) {
        toast.error("No transactions found");
        return;
      }

      const header = [
        "Transaction Type",
        "Category",
        "Amount",
        "Description",
        "Date",
      ];
      const rows = transactions.map((t) => [
        t.transactionType,
        t.category,
        t.amount,
        t.description,
        new Date(t.date).toLocaleDateString(),
      ]);

      const csvContent = [header, ...rows]
        .map((row) =>
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
    } catch (error) {
      toast.error("Failed to export data: " + error.message);
      console.error("Export error:", error);
    }
  };

  const validateStep = () => {
    if (!profile.name?.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!profile.contact?.trim()) {
      toast.error("Contact is required");
      return false;
    }
    if (!profile.address?.trim()) {
      toast.error("Address is required");
      return false;
    }
    return true;
  };

  const handleFileUpload = async (e) => {
    try {
      setIsUploading(true);
      const file = e.target.files[0];
      if(file.size > 2 * 1024 * 1024){
        toast.error("Image size should be less than 2MB");
        return;
      }
      const base64 = await convertToBase64(file);
      setProfile((prev) => ({ ...prev, profileImage: base64 }));
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!validateStep()) {
      setSubmitting(false);
      return;
    }

    try {
      const res = await axios.post(
        `https://expense-tracker-y9ar.onrender.com/expensetracker`,
        {
          query: `
            mutation update($user: updateUserInput) {
              updateUser(user: $user){
                email
              }
            }`,
          variables: {
            user: {
              userId: localStorage.getItem("userId"),
              name: profile.name,
              profileImage: profile.profileImage,
              address: profile.address,
              contact: profile.contact,
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.errors) {
        throw new Error(res.data.errors[0]?.message || "Something went wrong");
      }

      toast.success("Profile updated successfully!");
      getUserData();
    } catch (error) {
      toast.error("Error updating profile: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getUserData = async () => {
    try {
      const token = localStorage.getItem("Token");
      const res = await axios.post(
        `https://expense-tracker-y9ar.onrender.com/expensetracker`,
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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(res.data.data.getUserinfo);
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
          <h1 className="text-3xl font-bold text-slate-800">Profile & Settings</h1>
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
                      src={profile.profileImage || "/placeholder.svg"}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {(profile.name || "U")
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
                  <span className="text-xs">JPG, PNG or JPEG Max size 2MB.</span>
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
                      setProfile((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
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
                      setProfile((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="contact" className="text-slate-700">
                    Contact
                  </Label>
                  <Input
                    id="contact"
                    value={profile.contact}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        contact: e.target.value,
                      }))
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
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Change Password
              </Button>
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProfilePage;
