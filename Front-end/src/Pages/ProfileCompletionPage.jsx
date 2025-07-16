import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { User, Camera, ArrowRight } from "lucide-react";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const ProfileCompletionPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      navigate("/auth");
    }
  }, []);

  const [profileData, setProfileData] = useState({
    name: "",
    profilePicture: "",
    address: "",
    contact: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setUploading] = useState(false);

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
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
              name: profileData.name,
              profileImage: profileData.profilePicture,
              address: profileData.address,
              contact: profileData.contact,
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
      localStorage.removeItem("userId");
      navigate("/auth");
    } catch (error) {
      toast.error(error.message || "Failed to complete profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = () => {
    if (!profileData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!profileData.contact.trim()) {
      toast.error("Contact is required");
      return false;
    }
    if (!profileData.address.trim()) {
      toast.error("Address is required");
      return false;
    }
    return true;
  };

  const handleFileUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const base64 = await convertToBase64(file);
      setProfileData({ ...profileData, profilePicture: base64 });
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="font-bold text-2xl text-slate-800">
              ExpenseFlow
            </span>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Basic Information
              </Badge>
            </div>
            <p className="text-slate-600">Tell us about yourself</p>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Welcome to ExpenseFlow!
                </h2>
                <p className="text-slate-600">
                  Let's set up your profile to get started
                </p>
              </div>

              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={profileData.profilePicture || "/placeholder.svg"}
                      className={"object-cover"}
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {profileData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      <div className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-colors">
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
                  Click the camera icon to upload a profile picture
                  <br />
                  <span className="text-xs">
                    JPG, PNG or JPEG Max size 2MB.
                  </span>
                </p>
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter your full name"
                  className="h-12"
                />
              </div>

              {/* Contact Input */}
              <div className="space-y-2">
                <Label htmlFor="Contact" className="text-slate-700">
                  Contact *
                </Label>
                <Input
                  id="contact"
                  value={profileData.contact}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      contact: e.target.value,
                    }))
                  }
                  placeholder="Enter your contact number"
                  className="h-12"
                />
              </div>

              {/* Address Input */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-700">
                  Address *
                </Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter your address"
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end mt-6">
          <Button
            onClick={handleComplete}
            disabled={isUploading || isSubmitting}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2"
          >
            Complete
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ProfileCompletionPage;
