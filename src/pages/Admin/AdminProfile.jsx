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
  FaCog,
  FaBuilding,
  FaLock,
  FaSpinner,
  FaCalendar,
  FaUsers,
  FaStore,
  FaShoppingBag,
  FaChartLine,
} from "react-icons/fa";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Super Administrator",
    department: "Management",
    address: "",
    bio: "",
    joinDate: "",
    profileImage: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [tempData, setTempData] = useState({ ...profileData });
  const fileInputRef = useRef(null);

  // FIXED: Better image URL construction
  const getProfileImageUrl = (imageData) => {
    if (!imageData) return null;

    console.log("Admin profile image data:", imageData);

    // If it's already a full URL
    if (typeof imageData === "string") {
      if (imageData.startsWith("http")) {
        return imageData;
      }
      if (imageData.startsWith("/uploads")) {
        return `${
          process.env.REACT_APP_API_URL?.replace("/api", "") ||
          "https://nextrade-backend-production-a486.up.railway.app"
        }${imageData}`;
      }
      return imageData;
    }

    // If it's an object with url property (from Cloudinary)
    if (imageData && typeof imageData === "object") {
      if (imageData.url) {
        return imageData.url;
      }
      if (imageData.secure_url) {
        return imageData.secure_url;
      }
    }

    return null;
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

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("User not found");
        return;
      }

      const response = await API.get("/profile/me");
      const profile = response.data;
      console.log("Admin profile API response:", profile);

      const transformedData = {
        name: user.name || "Administrator",
        email: user.email || "admin@nextrade.com",
        phone: profile?.phone || "Not provided",
        role: "Super Administrator",
        department: profile?.shopName || user.department || "Management",
        address: profile?.address || "Office address not provided",
        bio: profile?.shopDescription || user.bio || "System Administrator",
        joinDate: formatJoinDate(),
        profileImage: profile?.profileImage || "",
      };

      console.log("Transformed admin data:", transformedData);
      console.log(
        "Admin image URL:",
        getProfileImageUrl(transformedData.profileImage)
      );

      setProfileData(transformedData);
      setTempData(transformedData);
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
      console.error("Error details:", error.response?.data);

      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const basicData = {
          name: user.name || "Administrator",
          email: user.email || "admin@nextrade.com",
          phone: "Not provided",
          role: "Super Administrator",
          department: user.department || "Management",
          address: "Office address not provided",
          bio: user.bio || "System Administrator",
          joinDate: formatJoinDate(),
          profileImage: "",
        };
        setProfileData(basicData);
        setTempData(basicData);
      }
    } finally {
      setLoading(false);
    }
  };

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const fetchAdminStats = async () => {
    try {
      const response = await API.get("/admin/stats");
      setStats({
        totalUsers: response.data.totalUsers || 0,
        totalSellers: response.data.totalSellers || 0,
        totalOrders: response.data.totalOrders || 0,
        totalRevenue: response.data.totalRevenue || 0,
      });
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
    fetchAdminStats();
  }, []);

  const handleEdit = () => {
    setTempData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      const user = JSON.parse(localStorage.getItem("user"));

      const updateData = {
        phone: tempData.phone === "Not provided" ? "" : tempData.phone,
        address:
          tempData.address === "Office address not provided"
            ? ""
            : tempData.address,
        shopName:
          tempData.department === "Management" ? "" : tempData.department,
        shopDescription:
          tempData.bio === "System Administrator" ? "" : tempData.bio,
        profileImage: tempData.profileImage,
      };

      console.log("Admin profile update data:", updateData);

      const response = await API.put("/profile/me", updateData);
      console.log("Admin profile update response:", response.data);

      // Update local storage with new data
      if (response.data.profile) {
        const updatedUser = {
          ...user,
          name: response.data.profile.name || user.name,
          department: tempData.department,
          bio: tempData.bio,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        // Fallback update
        const updatedUser = {
          ...user,
          department: tempData.department,
          bio: tempData.bio,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Update profile data with response
      if (response.data.profile) {
        setProfileData((prev) => ({
          ...prev,
          ...response.data.profile,
          department: tempData.department,
          bio: tempData.bio,
        }));
      } else {
        setProfileData({ ...tempData });
      }

      setIsEditing(false);
      toast.success("Admin profile updated successfully!");
    } catch (error) {
      console.error("Failed to update admin profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
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

  // FIXED: Image upload function
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

      console.log("Attempting admin profile image upload...");

      // Try multiple endpoints
      let response;
      try {
        // First try profile-specific endpoint
        response = await API.post("/profile/image", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(
          "Admin profile image upload via /profile/image:",
          response.data
        );
      } catch (profileError) {
        console.log(
          "Profile endpoint failed, trying /upload/image:",
          profileError
        );

        // Try general upload endpoint
        response = await API.post("/upload/image", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(
          "Admin profile image upload via /upload/image:",
          response.data
        );
      }

      if (response.data.imageUrl) {
        const newImageUrl = response.data.imageUrl;

        // Update tempData if editing, and profileData
        setTempData((prev) => ({
          ...prev,
          profileImage: newImageUrl,
        }));

        setProfileData((prev) => ({
          ...prev,
          profileImage: newImageUrl,
        }));

        setImageVersion((prev) => prev + 1);

        // Also update the profile in backend
        try {
          await API.put("/profile/me", { profileImage: newImageUrl });
        } catch (updateError) {
          console.log("Profile update after image upload failed:", updateError);
        }

        toast.success("Profile image uploaded successfully");

        // Refresh profile to ensure consistency
        await fetchAdminProfile();
      }
    } catch (error) {
      console.error("Failed to upload admin image:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUpdating(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeProfileImage = async () => {
    try {
      setUpdating(true);

      // Update backend
      await API.put("/profile/me", { profileImage: "" });

      // Update local state
      setTempData((prev) => ({
        ...prev,
        profileImage: "",
      }));

      setProfileData((prev) => ({
        ...prev,
        profileImage: "",
      }));

      setImageVersion((prev) => prev + 1);
      toast.success("Profile image removed");
    } catch (error) {
      console.error("Failed to remove profile image:", error);
      toast.error("Failed to remove profile image");
    } finally {
      setUpdating(false);
    }
  };

  // FIXED: Profile image display component
  const ProfileImageDisplay = ({ imageData, isEditing, onRemove, version }) => {
    const [imgError, setImgError] = useState(false);
    const imageUrl = getProfileImageUrl(imageData);

    useEffect(() => {
      setImgError(false);
    }, [imageUrl, version]);

    const handleImageError = () => {
      console.log("Admin profile image failed to load:", imageUrl);
      setImgError(true);
    };

    if (imageUrl && !imgError) {
      return (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Profile"
            className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
            onError={handleImageError}
            loading="lazy"
            key={`${imageUrl}-${version}`}
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

    return (
      <div className="flex items-center justify-center w-32 h-32 border-4 border-white rounded-full shadow-lg bg-secondary-200">
        <FaUser className="text-6xl text-primary-600" />
      </div>
    );
  };

  // Debug image state
  useEffect(() => {
    console.log("Admin profile image state:", {
      profileData: profileData.profileImage,
      tempData: tempData.profileImage,
      currentImageUrl: getProfileImageUrl(profileData.profileImage),
    });
  }, [profileData.profileImage, tempData.profileImage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  // Get current image URL for display
  const currentImageUrl = getProfileImageUrl(
    isEditing ? tempData.profileImage : profileData.profileImage
  );

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-6xl p-6 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">Admin Profile</h1>
          <p className="mt-2 text-neutral-600">
            Manage your administrator account and system settings
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sticky p-6 bg-white rounded-lg shadow-lg top-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <ProfileImageDisplay
                    imageData={
                      isEditing
                        ? tempData.profileImage
                        : profileData.profileImage
                    }
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
                      placeholder="Admin Name"
                      disabled={updating}
                    />
                  ) : (
                    profileData.name
                  )}
                </h2>
                <div className="inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full bg-primary-100">
                  <FaCog className="text-xs text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">
                    {profileData.role}
                  </span>
                </div>
              </div>

              <div className="mb-5 space-y-3">
                <div className="flex items-center text-neutral-700">
                  <FaBuilding className="mr-3 text-primary-600" />
                  <span className="text-sm">
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.department}
                        onChange={(e) =>
                          handleChange("department", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded bg-background-subtle border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Department"
                        disabled={updating}
                      />
                    ) : (
                      profileData.department
                    )}
                  </span>
                </div>
                <div className="flex items-center text-neutral-700">
                  <FaEnvelope className="mr-3 text-primary-600" />
                  <span className="text-sm break-all">{profileData.email}</span>
                </div>
                <div className="flex items-center text-neutral-700">
                  <FaCalendar className="mr-3 text-primary-600" />
                  <span className="text-sm">
                    Admin since {profileData.joinDate}
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

            <div className="p-6 mb-4 bg-white rounded-lg shadow-lg">
              <h3 className="mb-6 text-xl font-bold text-neutral-800">
                Administrator Information
              </h3>

              <div className="space-y-6">
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
                    Administrative email cannot be changed
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
                    Office Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={tempData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      rows="3"
                      className="w-full p-3 bg-white border rounded-lg resize-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your office address..."
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

                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    Administrator Role Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={tempData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      rows="4"
                      className="w-full p-3 bg-white border rounded-lg resize-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Describe your administrative role and responsibilities..."
                    />
                  ) : (
                    <div className="p-3 rounded-lg bg-background-subtle">
                      <p className="leading-relaxed text-neutral-800">
                        {profileData.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="mb-6 text-xl font-bold text-neutral-800">
            Platform Statistics
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Total Users Card */}
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-blue-50">
              <FaUsers className="text-2xl text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalUsers?.toLocaleString() || "1,256"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Total Users
              </div>
            </div>

            {/* Active Sellers Card */}
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-green-50">
              <FaStore className="text-2xl text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600">
                {stats.totalSellers?.toLocaleString() || "89"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Active Sellers
              </div>
            </div>

            {/* Total Orders Card */}
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-yellow-50">
              <FaShoppingBag className="text-2xl text-yellow-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-yellow-600">
                {stats.totalOrders?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Total Orders
              </div>
            </div>

            {/* Platform Revenue Card */}
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-purple-50">
              <FaChartLine className="text-2xl text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-600">
                Rs {stats.totalRevenue?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Platform Revenue
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
