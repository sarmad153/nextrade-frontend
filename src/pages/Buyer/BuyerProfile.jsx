import React, { useState, useRef, useEffect, useCallback } from "react";
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
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";

const BuyerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);

  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    cancelled: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

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

  // Simple image URL construction
  const getProfileImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    } else if (imagePath.startsWith("/uploads")) {
      return `https://nextrade-backend-production-a486.up.railway.app/${imagePath}`;
    } else {
      // Default case
      return `https://nextrade-backend-production-a486.up.railway.app//uploads/profiles/${imagePath}`;
    }
  }, []);

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

  // validateForm to check if all the entery are valid
  const validateForm = () => {
    const errors = [];

    if (!tempData.name.trim()) {
      errors.push("Name is required");
    }

    if (tempData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(tempData.phone)) {
      errors.push("Invalid phone number format");
    }

    return errors;
  };

  // handleChange
  const handleChange = (field, value) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // handlePasswordChange
  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // handleCancel
  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  // triggerFileInput
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.role && !["buyer", "admin"].includes(user.role)) {
        toast.error("This page is for buyers only");
        window.location.href = "/seller/dashboard";
        return;
      }

      if (!user) {
        toast.error("User not found");
        return;
      }

      const response = await API.get("/profile/me");
      const profile = response.data;

      const transformedData = {
        name: user.name || "Buyer Name",
        email: user.email || "No email",
        phone: profile?.phone || "Not provided",
        city: profile?.city || "Not provided",
        address: profile?.address || "Address not provided",
        profileImage: profile?.profileImage || "",
      };

      setProfileData(transformedData);
      setTempData(transformedData);
      setImageLoadError(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
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
        setImageLoadError(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      setStatsLoading(true);
      const response = await API.get("/orders/buyer/stats");
      setOrderStats(response.data);
    } catch (error) {
      console.error("Failed to fetch order stats:", error);
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
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        window.location.href = "/login";
        return;
      }

      await fetchProfile();
      if (!isMounted) return;
      await fetchOrderStats();
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEdit = () => {
    setTempData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      setUpdating(true);

      const profileUpdateData = {
        name: tempData.name,
        phone: tempData.phone === "Not provided" ? "" : tempData.phone,
        city: tempData.city === "Not provided" ? "" : tempData.city,
        address:
          tempData.address === "Address not provided" ? "" : tempData.address,
        profileImage: tempData.profileImage,
      };

      const { data } = await API.put("/profile/me", profileUpdateData);

      // Update local storage
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && tempData.name !== user.name) {
        const updatedUser = {
          ...user,
          name: tempData.name,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      const updatedProfile = {
        name: data.name || tempData.name,
        email: profileData.email,
        phone: data.phone || tempData.phone,
        city: data.city || tempData.city,
        address: data.address || tempData.address,
        profileImage: data.profileImage || tempData.profileImage,
      };

      setProfileData(updatedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      if (error.response?.status === 400) {
        toast.error(
          error.response.data.message ||
            "Validation error. Please check your input."
        );
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      }
    } finally {
      setUpdating(false);
    }
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
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const response = await API.post("/upload/profile", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.imageUrl) {
        const newImageUrl = response.data.imageUrl;

        setProfileData((prev) => ({
          ...prev,
          profileImage: newImageUrl,
        }));

        setTempData((prev) => ({
          ...prev,
          profileImage: newImageUrl,
        }));

        setImageVersion((prev) => prev + 1);
        toast.success("Profile image uploaded successfully");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUpdating(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeProfileImage = async () => {
    try {
      setProfileData((prev) => ({
        ...prev,
        profileImage: "",
      }));

      setTempData((prev) => ({
        ...prev,
        profileImage: "",
      }));

      setImageLoadError(false);
      await API.put("/profile/me", { profileImage: "" });
      toast.success("Profile image removed");
    } catch (error) {
      console.error("Failed to remove profile image:", error);
      toast.error("Failed to remove profile image");
    }
  };

  // rofileImageDisplay component
  const ProfileImageDisplay = React.memo(
    ({ imageUrl, isEditing, onRemove, version }) => {
      const [imgError, setImgError] = useState(false);

      // Only reset error when imageUrl actually changes
      useEffect(() => {
        setImgError(false);
      }, [imageUrl]);

      if (imageUrl && !imgError) {
        return (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Profile"
              className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
              onError={() => setImgError(true)}
              loading="lazy"
              key={version} // Use version as key to control re-renders
            />
            {isEditing && (
              <button
                onClick={onRemove}
                className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                type="button"
                aria-label="Remove profile image"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center w-32 h-32 border-4 border-white rounded-full shadow-lg bg-secondary-200">
          <FaUser className="text-6xl text-primary-600" />
        </div>
      );
    }
  );

  ProfileImageDisplay.displayName = "ProfileImageDisplay";

  const currentImageUrl = getProfileImageUrl(
    isEditing ? tempData.profileImage : profileData.profileImage
  );

  // StatsCards
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
          <div className="lg:col-span-1">
            <div className="sticky p-6 bg-white rounded-lg shadow-lg top-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <ProfileImageDisplay
                    key={`${currentImageUrl}-${imageVersion}`}
                    imageUrl={currentImageUrl}
                    isEditing={isEditing}
                    onRemove={removeProfileImage}
                    version={imageVersion}
                  />

                  {isEditing && (
                    <>
                      <button
                        onClick={triggerFileInput}
                        className="absolute p-2 text-white transition-colors rounded-full shadow-lg bottom-2 right-2 bg-primary-600 hover:bg-primary-700"
                        disabled={updating}
                        type="button"
                        aria-label="Change profile picture"
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
                        id="profile-image-input"
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

              {!isEditing ? (
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
              ) : (
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
              )}
            </div>
          </div>

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
                      disabled={resettingPassword}
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
};

export default BuyerProfile;
