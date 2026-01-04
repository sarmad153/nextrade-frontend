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
  FaStore,
  FaLock,
  FaSpinner,
  FaCalendar,
  FaUserClock,
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaIdCard,
  FaShoppingBag,
  FaMoneyBillWave,
} from "react-icons/fa";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";

export default function SellerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [imageError, setImageError] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
    businessType: "",
    businessAddress: "",
    city: "",
    cnicNumber: "",
    businessPhone: "",
    yearsInBusiness: 0,
    mainProducts: [],
    businessDescription: "",
    shopName: "",
    shopDescription: "",
    isProfileComplete: false,
    userRole: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [tempData, setTempData] = useState({ ...profileData });
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // image URL construction
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads")) {
      return `https://nextrade-backend-production-a486.up.railway.app${imagePath}`;
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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("User not found");
        return;
      }

      setUserRole(user.role);
      setApprovalStatus(user.approvalStatus);

      const response = await API.get("/profile/me");
      const profile = response.data;

      console.log("Fetched profile:", profile);

      const transformedData = {
        name: profile.name || user.name || "Seller Name",
        email: profile.email || user.email || "No email",
        phone: profile.phone || "Not provided",
        address: profile.address || "Address not provided",
        profileImage: profile.profileImage || "",
        businessType: profile.businessType || "",
        businessAddress: profile.businessAddress || "",
        city: profile.city || "",
        cnicNumber: profile.cnicNumber || "",
        businessPhone: profile.businessPhone || "",
        yearsInBusiness: profile.yearsInBusiness || 0,
        mainProducts: profile.mainProducts || [],
        businessDescription:
          profile.businessDescription ||
          "Tell customers about your business...",
        shopName: profile.shopName || user.storeName || "My Store",
        shopDescription:
          profile.shopDescription ||
          user.storeDescription ||
          "Tell customers about your business...",
        isProfileComplete: profile.isProfileComplete || false,
        userRole: user.role,
      };

      setProfileData(transformedData);
      setTempData(transformedData);
      setImageError(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      console.error("Fetch error details:", error.response?.data);

      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const basicData = {
          name: user.name || "Seller Name",
          email: user.email || "No email",
          phone: "Not provided",
          address: "Address not provided",
          profileImage: "",
          shopName: user.storeName || "My Store",
          shopDescription:
            user.storeDescription || "Tell customers about your business...",
          userRole: user.role,
        };
        setProfileData(basicData);
        setTempData(basicData);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerStats = async () => {
    if (userRole !== "seller_approved") return;
    try {
      const response = await API.get("/admin/seller/stats");
      setStats({
        totalProducts: response.data.totalProducts || 0,
        totalOrders: response.data.totalOrders || 0,
        totalRevenue: response.data.totalRevenue || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userRole === "seller_approved") {
      fetchSellerStats();
    }
  }, [userRole]);

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
        address:
          tempData.address === "Address not provided" ? "" : tempData.address,
        shopName: tempData.shopName === "My Store" ? "" : tempData.shopName,
        shopDescription:
          tempData.shopDescription === "Tell customers about your business..."
            ? ""
            : tempData.shopDescription,
        profileImage: tempData.profileImage,
        businessType: tempData.businessType,
        businessAddress: tempData.businessAddress,
        city: tempData.city,
        cnicNumber: tempData.cnicNumber,
        businessPhone: tempData.businessPhone,
        yearsInBusiness: tempData.yearsInBusiness,
        mainProducts: tempData.mainProducts,
        businessDescription: tempData.businessDescription,
      };

      console.log("Saving profile data:", updateData);

      const isBusinessComplete =
        updateData.businessType && updateData.cnicNumber && updateData.city;
      if (isBusinessComplete) {
        updateData.isProfileComplete = true;
      }

      const response = await API.put("/profile/me", updateData);
      console.log("Save response:", response.data);

      // Update profile data with the response
      if (response.data.profile) {
        setProfileData((prev) => ({
          ...prev,
          ...response.data.profile,
        }));
      }

      setIsEditing(false);
      toast.success(
        isBusinessComplete
          ? "Business profile completed successfully!"
          : "Profile updated successfully!"
      );
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

      let response;
      try {
        //  profile image upload endpoint
        response = await API.post("/upload/profile", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (uploadError) {
        console.log(
          "Profile image upload failed, trying upload route:",
          uploadError
        );
      }

      console.log("Image upload response:", response.data);

      if (response.data.imageUrl) {
        const imageUrl = response.data.imageUrl;

        // Update both tempData and profileData immediately
        setTempData((prev) => ({ ...prev, profileImage: imageUrl }));
        setProfileData((prev) => ({ ...prev, profileImage: imageUrl }));
        setImageError(false);

        toast.success("Profile image uploaded successfully");

        // If not in edit mode, refresh the profile to get updated data
        if (!isEditing) {
          await fetchProfile();
        }
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeProfileImage = async () => {
    try {
      // Set profile image to empty string in both states
      setTempData((prev) => ({ ...prev, profileImage: "" }));
      setProfileData((prev) => ({ ...prev, profileImage: "" }));

      if (isEditing) {
        await API.put("/profile/me", { profileImage: "" });
      }

      toast.success("Profile image removed");
    } catch (error) {
      console.error("Failed to remove profile image:", error);
      toast.error("Failed to remove profile image");
    }
  };

  // Improved ProfileImageDisplay component
  const ProfileImageDisplay = ({ imageData, isEditing, onRemove }) => {
    const [imgError, setImgError] = useState(false);

    // Compute imageUrl locally
    const imageUrl = getProfileImageUrl(imageData);

    const handleImageError = () => {
      console.log("Image failed to load:", imageUrl);
      setImgError(true);
    };

    const handleImageLoad = () => {
      setImgError(false);
    };

    if (imageUrl && !imgError) {
      return (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Profile"
            className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {isEditing && (
            <button
              onClick={onRemove}
              className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
              type="button"
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
  const completeBusinessProfile = async () => {
    try {
      setUpdating(true);
      const businessData = {
        phone: profileData.phone === "Not provided" ? "" : profileData.phone,
        address:
          profileData.address === "Address not provided"
            ? ""
            : profileData.address,
        businessType: "individual",
        city: "Lahore",
        cnicNumber: "",
        businessPhone:
          profileData.phone === "Not provided" ? "" : profileData.phone,
        yearsInBusiness: 1,
        mainProducts: ["General Products"],
        businessDescription:
          profileData.shopDescription ===
          "Tell customers about your business..."
            ? ""
            : profileData.shopDescription,
        shopName:
          profileData.shopName === "My Store" ? "" : profileData.shopName,
        shopDescription:
          profileData.shopDescription ===
          "Tell customers about your business..."
            ? ""
            : profileData.shopDescription,
      };

      await API.post("/profile/business-profile", businessData);
      toast.success("Business profile submitted for approval!");
      fetchProfile();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to complete business profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  const renderApprovalStatus = () => {
    switch (userRole) {
      case "seller_approved":
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full bg-green-100">
            <FaCheckCircle className="text-xs text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Approved Seller
            </span>
          </div>
        );
      case "seller_pending":
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full bg-blue-100">
            <FaUserClock className="text-xs text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Pending Approval
            </span>
          </div>
        );
      case "buyer":
        if (approvalStatus === "rejected") {
          return (
            <div className="inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full bg-red-100">
              <FaTimesCircle className="text-xs text-red-600" />
              <span className="text-sm font-medium text-red-700">
                Application Rejected
              </span>
            </div>
          );
        }
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full bg-gray-100">
            <FaUser className="text-xs text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Buyer</span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderActionButtons = () => {
    if (isEditing) {
      return (
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={updating}
            className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {updating ? <FaSpinner className="animate-spin" /> : <FaSave />}
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
      );
    }

    return (
      <div className="space-y-3">
        <button
          onClick={handleEdit}
          className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <FaEdit />
          Edit Profile
        </button>

        {userRole === "seller_pending" && !profileData.isProfileComplete && (
          <button
            onClick={completeBusinessProfile}
            disabled={updating}
            className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-colors rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {updating ? <FaSpinner className="animate-spin" /> : <FaFileAlt />}
            {updating ? "Submitting..." : "Complete Business Profile"}
          </button>
        )}

        <button
          onClick={() => setShowPasswordReset(true)}
          className="flex items-center justify-center w-full gap-2 py-3 font-medium transition-colors border rounded-lg text-primary-600 border-primary-600 hover:bg-primary-50"
        >
          <FaLock />
          Change Password
        </button>
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
          <h1 className="text-3xl font-bold text-neutral-800">
            {userRole === "seller_approved" || userRole === "seller_pending"
              ? "Seller Profile"
              : "User Profile"}
          </h1>
          <p className="mt-2 text-neutral-600">
            {userRole === "seller_approved"
              ? "Manage your seller account and store information"
              : userRole === "seller_pending"
              ? "Complete your business profile for approval"
              : "Manage your account information"}
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
                {renderApprovalStatus()}
              </div>

              <div className="mb-5 space-y-3">
                <div className="flex items-center text-neutral-700">
                  <FaStore className="mr-3 text-primary-600" />
                  <span className="text-sm">
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.shopName}
                        onChange={(e) =>
                          handleChange("shopName", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded bg-background-subtle border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Store Name"
                      />
                    ) : (
                      profileData.shopName
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
                    Member since {formatJoinDate()}
                  </span>
                </div>
              </div>

              {renderActionButtons()}
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
                Store Information
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
                    Store Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={tempData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      rows="3"
                      className="w-full p-3 bg-white border rounded-lg resize-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your store address..."
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
                    About Your Business
                  </label>
                  {isEditing ? (
                    <textarea
                      value={tempData.shopDescription}
                      onChange={(e) =>
                        handleChange("shopDescription", e.target.value)
                      }
                      rows="4"
                      className="w-full p-3 bg-white border rounded-lg resize-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Tell customers about your business..."
                    />
                  ) : (
                    <div className="p-3 rounded-lg bg-background-subtle">
                      <p className="leading-relaxed text-neutral-800">
                        {profileData.shopDescription}
                      </p>
                    </div>
                  )}
                </div>

                {(userRole === "seller_pending" ||
                  userRole === "seller_approved") && (
                  <>
                    <div className="pt-6 mt-6 border-t border-neutral-200">
                      <h4 className="mb-4 text-lg font-semibold text-neutral-800">
                        Business Verification Details
                      </h4>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-neutral-700">
                            Business Type
                          </label>
                          {isEditing ? (
                            <select
                              value={tempData.businessType}
                              onChange={(e) =>
                                handleChange("businessType", e.target.value)
                              }
                              className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">Select Business Type</option>
                              <option value="individual">Individual</option>
                              <option value="wholesaler">Wholesaler</option>
                              <option value="retailer">Retailer</option>
                              <option value="manufacturer">Manufacturer</option>
                              <option value="distributor">Distributor</option>
                            </select>
                          ) : (
                            <div className="p-3 rounded-lg bg-background-subtle">
                              <span className="text-neutral-800">
                                {profileData.businessType || "Not provided"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-neutral-700">
                            CNIC Number
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={tempData.cnicNumber}
                              onChange={(e) =>
                                handleChange("cnicNumber", e.target.value)
                              }
                              className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter CNIC number"
                            />
                          ) : (
                            <div className="flex items-center p-3 rounded-lg bg-background-subtle">
                              <FaIdCard className="mr-3 text-primary-600" />
                              <span className="text-neutral-800">
                                {profileData.cnicNumber || "Not provided"}
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
                              onChange={(e) =>
                                handleChange("city", e.target.value)
                              }
                              className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter city"
                            />
                          ) : (
                            <div className="p-3 rounded-lg bg-background-subtle">
                              <span className="text-neutral-800">
                                {profileData.city || "Not provided"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-neutral-700">
                            Years in Business
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={tempData.yearsInBusiness}
                              onChange={(e) =>
                                handleChange("yearsInBusiness", e.target.value)
                              }
                              className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="0"
                            />
                          ) : (
                            <div className="p-3 rounded-lg bg-background-subtle">
                              <span className="text-neutral-800">
                                {profileData.yearsInBusiness || "0"} years
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {userRole === "seller_approved" && (
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="mb-6 text-xl font-bold text-neutral-800">
              Store Statistics
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Total Products Card */}
              <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-blue-50">
                <FaShoppingBag className="text-2xl text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalProducts}
                </div>
                <div className="mt-1 text-sm font-medium text-neutral-700">
                  Total Products
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-green-50">
                <FaCheckCircle className="text-2xl text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalOrders}
                </div>
                <div className="mt-1 text-sm font-medium text-neutral-700">
                  Orders Completed
                </div>
              </div>

              {/* Total Revenue Card */}
              <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-yellow-50">
                <FaMoneyBillWave className="text-2xl text-yellow-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-yellow-600">
                  Rs {stats.totalRevenue?.toLocaleString() || "0"}
                </div>
                <div className="mt-1 text-sm font-medium text-neutral-700">
                  Total Revenue
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
