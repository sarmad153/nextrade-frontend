import React, { useState, useRef, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaLock,
  FaSpinner,
  FaCalendar,
  FaShoppingBag,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../api/axiosInstance";

export default function BuyerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    cancelled: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    profileImage: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [tempData, setTempData] = useState({ ...profileData });
  const fileInputRef = useRef(null);

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // NEW: Clean URL helper that handles both old and new formats
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Check if it's already a valid URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Check if it's a Cloudinary URL without protocol
    if (imagePath.startsWith("//res.cloudinary.com")) {
      return `https:${imagePath}`;
    }

    // Check if it's a Cloudinary public ID or partial URL
    if (
      imagePath.includes("cloudinary.com") ||
      imagePath.includes("/image/upload/")
    ) {
      // Try to construct full Cloudinary URL
      if (!imagePath.startsWith("http")) {
        return `https://res.cloudinary.com/${imagePath
          .replace(/^\/\//, "")
          .replace(/^res\.cloudinary\.com\//, "")}`;
      }
    }

    // If it's an old local path (which doesn't exist), return null
    if (imagePath.startsWith("/uploads")) {
      console.warn("Old local path detected, ignoring:", imagePath);
      return null;
    }

    return imagePath;
  };

  const formatJoinDate = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.createdAt) return "Unknown";
    try {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Unknown";
    }
  };

  const fetchOrderStats = async () => {
    try {
      setStatsLoading(true);
      const response = await API.get("/orders/buyer/stats");
      setOrderStats({
        total: response.data.total || 0,
        completed: response.data.completed || 0,
        pending: response.data.pending || 0,
        processing: response.data.processing || 0,
        shipped: response.data.shipped || 0,
        cancelled: response.data.cancelled || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setOrderStats({
        total: 0,
        completed: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        cancelled: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const handleEdit = () => {
    setTempData({ ...profileData });
    setIsEditing(true);
    setImageError(false);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);

      const updateData = {
        phone: tempData.phone === "Not provided" ? "" : tempData.phone,
        city: tempData.city === "Not provided" ? "" : tempData.city,
        address:
          tempData.address === "Address not provided" ? "" : tempData.address,
      };

      console.log("Saving profile data:", updateData);

      const response = await API.put("/profile/me", updateData);
      console.log("Save response:", response.data);

      if (response.data.profile) {
        const updatedProfile = {
          ...profileData,
          ...response.data.profile,
        };
        setProfileData(updatedProfile);
        setTempData(updatedProfile);
      }

      // Update name separately if changed
      if (tempData.name !== profileData.name) {
        const user = JSON.parse(localStorage.getItem("user"));
        const nameUpdateResponse = await API.put("/auth/update-profile", {
          name: tempData.name,
        });

        if (nameUpdateResponse.data) {
          const updatedUser = { ...user, name: tempData.name };
          localStorage.setItem("user", JSON.stringify(updatedUser));

          setProfileData((prev) => ({ ...prev, name: tempData.name }));
          setTempData((prev) => ({ ...prev, name: tempData.name }));
        }
      }

      setIsEditing(false);
      toast.success("Profile updated successfully!");

      await fetchProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
    setImageError(false);
  };

  const handleChange = (field, value) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordReset = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    try {
      setResettingPassword(true);
      await API.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordReset(false);
      toast.success("Password updated successfully!");
    } catch (error) {
      console.error("Failed to change password:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error("Current password is incorrect");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update password"
        );
      }
    } finally {
      setResettingPassword(false);
    }
  };

  // FIXED: Simple image upload using /upload/profile
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("image", file);

      console.log("Uploading image...");

      // Just upload to Cloudinary
      const uploadResponse = await API.post("/upload/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", uploadResponse.data);

      if (uploadResponse.data.imageUrl) {
        const cloudinaryUrl = uploadResponse.data.imageUrl;
        console.log("Cloudinary URL:", cloudinaryUrl);

        // Now update the profile with the Cloudinary URL
        const updateResponse = await API.put("/profile/me", {
          profileImage: cloudinaryUrl,
        });

        console.log("Profile update response:", updateResponse.data);

        // Update local state with the Cloudinary URL
        const newProfileData = {
          ...profileData,
          profileImage: cloudinaryUrl,
        };

        setProfileData(newProfileData);
        setTempData(newProfileData);

        setImageError(false);
        toast.success("Profile image uploaded successfully!");

        // Force refresh to get updated data
        setTimeout(() => {
          fetchProfile();
        }, 500);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUpdating(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // FIXED: Remove profile image
  const removeProfileImage = async () => {
    try {
      setUpdating(true);

      // Clear the profile image
      const response = await API.put("/profile/me", {
        profileImage: "",
      });

      // Update local state
      setProfileData((prev) => ({
        ...prev,
        profileImage: "",
      }));
      setTempData((prev) => ({
        ...prev,
        profileImage: "",
      }));

      toast.success("Profile image removed");
    } catch (error) {
      console.error("Failed to remove profile image:", error);
      toast.error("Failed to remove profile image");
    } finally {
      setUpdating(false);
    }
  };

  // FIXED: fetchProfile function
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("User not found");
        return;
      }

      const response = await API.get("/profile/me");
      const profile = response.data;

      console.log("Raw profile data:", profile);

      // Extract profile image - handle different formats
      let profileImage = "";

      // Check if profileImage exists in response
      if (profile.profileImage) {
        console.log("profileImage found:", profile.profileImage);
        console.log("Type:", typeof profile.profileImage);

        if (typeof profile.profileImage === "string") {
          profileImage = profile.profileImage;
        } else if (
          profile.profileImage &&
          typeof profile.profileImage === "object"
        ) {
          // Handle object format
          if (profile.profileImage.url) {
            profileImage = profile.profileImage.url;
          } else if (profile.profileImage.secure_url) {
            profileImage = profile.profileImage.secure_url;
          }
        }
      }

      console.log("Extracted profileImage:", profileImage);

      const transformedData = {
        name: profile.name || user.name || "Buyer Name",
        email: profile.email || user.email || "No email",
        phone: profile.phone || "Not provided",
        city: profile.city || "Not provided",
        address: profile.address || "Address not provided",
        profileImage: profileImage, // This should be Cloudinary URL or empty
      };

      console.log("Transformed data:", transformedData);

      setProfileData(transformedData);
      setTempData(transformedData);
      setImageError(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      console.error("Fetch error details:", error.response?.data);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to load profile data");
      }

      // Set basic data from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const basicData = {
          name: user.name || "Buyer Name",
          email: user.email || "No email",
          phone: "Not provided",
          city: "Not provided",
          address: "Address not provided",
          profileImage: "",
        };
        setProfileData(basicData);
        setTempData(basicData);
      }
    } finally {
      setLoading(false);
    }
  };

  // SIMPLE ProfileImageDisplay component
  const ProfileImageDisplay = ({ imageUrl, isEditing, onRemove }) => {
    const [imgError, setImgError] = useState(false);

    console.log("ProfileImageDisplay - imageUrl:", imageUrl);

    // Get cleaned image URL
    const displayUrl = getImageUrl(imageUrl);
    console.log("ProfileImageDisplay - displayUrl:", displayUrl);

    // If we have a valid URL and no error, show the image
    if (displayUrl && !imgError) {
      return (
        <div className="relative">
          <img
            src={displayUrl}
            alt="Profile"
            className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
            onError={() => {
              console.error("Image failed to load:", displayUrl);
              setImgError(true);
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", displayUrl);
              setImgError(false);
            }}
            loading="lazy"
          />
          {isEditing && (
            <button
              onClick={onRemove}
              className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
              type="button"
              disabled={updating}
            >
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
      );
    }

    // Default avatar (no image or error)
    return (
      <div className="flex items-center justify-center w-32 h-32 border-4 border-white rounded-full shadow-lg bg-secondary-200">
        <FaUser className="text-6xl text-primary-600" />
        {isEditing && onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
            type="button"
            disabled={updating}
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>
    );
  };

  // StatsCards component
  const StatsCards = () => {
    if (statsLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="p-6 text-center bg-white rounded-lg shadow-lg animate-pulse"
            >
              <div className="h-8 bg-neutral-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>
      );
    }

    const mainStats = [
      {
        key: "total",
        label: "Total Orders",
        value: orderStats.total,
        icon: FaShoppingBag,
        color: "text-primary-600",
        bgColor: "bg-blue-50",
      },
      {
        key: "completed",
        label: "Completed",
        value: orderStats.completed,
        icon: FaCheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        key: "pending",
        label: "Pending",
        value: orderStats.pending + orderStats.processing + orderStats.shipped,
        icon: FaClock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      },
    ];

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {mainStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.key}
              className={`p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 ${stat.bgColor}`}
            >
              <IconComponent
                className={`text-2xl ${stat.color} mx-auto mb-3`}
              />
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-6xl p-6 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">My Profile</h1>
          <p className="mt-2 text-neutral-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="sticky p-6 bg-white rounded-lg shadow-lg top-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <ProfileImageDisplay
                    imageUrl={
                      isEditing
                        ? tempData.profileImage
                        : profileData.profileImage
                    }
                    isEditing={isEditing}
                    onRemove={removeProfileImage}
                  />

                  {isEditing && (
                    <>
                      <button
                        onClick={triggerFileInput}
                        className="absolute p-2 text-white transition-colors rounded-full shadow-lg bottom-2 right-2 bg-primary-600 hover:bg-primary-700"
                        disabled={updating}
                        type="button"
                      >
                        {updating ? (
                          <FaSpinner className="text-sm animate-spin" />
                        ) : (
                          <FaCamera className="text-sm" />
                        )}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                        disabled={updating}
                      />
                    </>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-bold text-neutral-800 text-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="px-2 py-1 text-center border rounded bg-background-subtle border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your Name"
                    />
                  ) : (
                    profileData.name
                  )}
                </h2>
                <div className="inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full bg-gray-100">
                  <FaUser className="text-xs text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Buyer
                  </span>
                </div>
              </div>

              <div className="mb-5 space-y-3">
                <div className="flex items-center text-neutral-700">
                  <FaEnvelope className="mr-3 text-primary-600" />
                  <span className="text-sm break-all">{profileData.email}</span>
                </div>
                <div className="flex items-center text-neutral-700">
                  <FaCalendar className="mr-3 text-primary-600" />
                  <span className="text-sm">
                    Member since {formatJoinDate()}
                  </span>
                </div>
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {updating ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaSave />
                    )}
                    {updating ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    <FaEdit />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordReset(true)}
                    className="flex items-center justify-center w-full gap-2 py-3 font-medium transition-colors border rounded-lg text-primary-600 border-primary-600 hover:bg-primary-50"
                  >
                    <FaLock />
                    Change Password
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Form and Stats */}
          <div className="lg:col-span-2">
            {showPasswordReset && (
              <div className="p-6 mb-6 bg-white rounded-lg shadow-lg">
                <h3 className="mb-6 text-xl font-bold text-neutral-800">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange("currentPassword", e.target.value)
                      }
                      className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handlePasswordChange("newPassword", e.target.value)
                      }
                      className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter new password"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange("confirmPassword", e.target.value)
                      }
                      className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handlePasswordReset}
                      disabled={resettingPassword}
                      className="flex items-center justify-center px-6 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {resettingPassword ? (
                        <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {resettingPassword
                        ? "Changing Password..."
                        : "Update Password"}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordReset(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="px-6 py-3 transition-colors border rounded-lg text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 mb-6 bg-white rounded-lg shadow-lg">
              <h3 className="mb-6 text-xl font-bold text-neutral-800">
                Personal Information
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your full name"
                      disabled={updating}
                    />
                  ) : (
                    <div className="flex items-center p-3 rounded-lg bg-background-subtle">
                      <FaUser className="mr-3 text-primary-600" />
                      <span className="text-neutral-800">
                        {profileData.name}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    Email Address
                  </label>
                  <div className="flex items-center p-3 rounded-lg bg-background-subtle">
                    <FaEnvelope className="mr-3 text-primary-600" />
                    <span className="text-neutral-800 break-all">
                      {profileData.email}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="flex items-center p-3 rounded-lg bg-background-subtle">
                      <FaPhone className="mr-3 text-primary-600" />
                      <span className="text-neutral-800">
                        {profileData.phone}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your city"
                    />
                  ) : (
                    <div className="flex items-center p-3 rounded-lg bg-background-subtle">
                      <FaMapMarkerAlt className="mr-3 text-primary-600" />
                      <span className="text-neutral-800">
                        {profileData.city}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    Shipping Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={tempData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      rows="3"
                      className="w-full p-3 bg-white border rounded-lg resize-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your shipping address..."
                    />
                  ) : (
                    <div className="flex items-start p-3 rounded-lg bg-background-subtle">
                      <FaMapMarkerAlt className="mt-1 mr-3 text-primary-600" />
                      <span className="text-neutral-800">
                        {profileData.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="mb-6 text-xl font-bold text-neutral-800">
                Order Statistics
              </h3>
              <StatsCards />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
