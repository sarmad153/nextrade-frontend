import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing login when app loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // If we have both token and user data, restore the session
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Make sure all required user info is in localStorage
      if (!localStorage.getItem("userId")) {
        localStorage.setItem("userId", parsedUser._id || parsedUser.id);
      }
      if (!localStorage.getItem("userRole")) {
        localStorage.setItem("userRole", parsedUser.role);
      }
    }
    setLoading(false);
  }, []);

  // Handle user login
  const login = (userData, token) => {
    // Check if user account is blocked
    if (userData.isBlocked) {
      toast.error("Your account has been blocked. Please contact admin.");
      clearLocalStorage();
      return;
    }

    // Save user data to localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", userData.role);
    localStorage.setItem("userId", userData._id || userData.id);
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("userName", userData.name || userData.email);

    // Update state
    setUser(userData);

    // Redirect user based on their role
    redirectBasedOnRole(userData.role, userData.approvalStatus);
  };

  // Redirect user to appropriate page based on role
  const redirectBasedOnRole = (role, approvalStatus) => {
    switch (role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "seller_approved":
        navigate("/seller/dashboard");
        break;
      case "seller_pending":
        // Pending sellers need to complete their profile
        navigate("/seller/profile");
        toast.info("Please complete your business profile for approval");
        break;
      case "buyer":
      default:
        navigate("/");
        break;
    }
  };

  // Clear all user data from localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
  };

  // Handle user logout
  const logout = () => {
    clearLocalStorage();
    setUser(null);
    navigate("/login");
  };

  // Check if user is logged in
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  // Check if user is a seller (approved or pending)
  const isSeller = () => {
    return user?.role === "seller_approved" || user?.role === "seller_pending";
  };

  // Check if seller is approved
  const isSellerApproved = () => {
    return user?.role === "seller_approved";
  };

  // Check if seller is pending approval
  const isSellerPending = () => {
    return user?.role === "seller_pending";
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === "admin";
  };

  // Check if user is buyer
  const isBuyer = () => {
    return user?.role === "buyer";
  };

  // Check if user can sell products
  const canSell = () => {
    return user?.role === "seller_approved" || user?.role === "admin";
  };

  // Get current user role
  const getCurrentRole = () => {
    return user?.role;
  };

  // Get approval status for sellers
  const getApprovalStatus = () => {
    return user?.approvalStatus;
  };

  // All values and functions available through context
  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isSeller,
    isSellerApproved,
    isSellerPending,
    isAdmin,
    isBuyer,
    canSell,
    getCurrentRole,
    getApprovalStatus,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
