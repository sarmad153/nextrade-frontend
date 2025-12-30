import React from "react";
import { Link } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaUserClock,
  FaStore,
  FaUserShield,
  FaHome,
  FaSignInAlt,
} from "react-icons/fa";

const Unauthorized = () => {
  const userRole = localStorage.getItem("userRole");

  const getRoleBasedContent = () => {
    switch (userRole) {
      case "seller_pending":
        return {
          icon: FaUserClock,
          title: "Profile Access Active",
          message:
            "You can update your profile while waiting for seller approval",
          buttonText: "Continue to Profile",
          buttonLink: "/seller/profile",
          bgColor: "bg-blue-50",
          textColor: "text-blue-800",
          iconColor: "text-blue-600",
        };
      case "buyer":
        return {
          icon: FaStore,
          title: "Seller Access Required",
          message: "You need to register as a seller to access this section",
          buttonText: "Apply as Seller",
          buttonLink: "/register/seller",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-800",
          iconColor: "text-yellow-600",
        };
      case "admin":
        return {
          icon: FaUserShield,
          title: "Admin Access Detected",
          message:
            "This section is for sellers only. Redirecting to admin dashboard...",
          buttonText: "Go to Admin Dashboard",
          buttonLink: "/admin",
          bgColor: "bg-purple-50",
          textColor: "text-purple-800",
          iconColor: "text-purple-600",
        };
      default:
        return {
          icon: FaExclamationTriangle,
          title: "Access Denied",
          message: "You don't have permission to access this page",
          buttonText: "Go to Login",
          buttonLink: "/login",
          bgColor: "bg-secondary-200",
          textColor: "text-red-800",
          iconColor: "text-red-600",
        };
    }
  };

  const content = getRoleBasedContent();
  const IconComponent = content.icon;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light">
      <div className="max-w-md mx-4">
        <div className={`p-8 rounded-lg shadow-lg ${content.bgColor}`}>
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full ${content.bgColor}`}>
              <IconComponent className={`text-4xl ${content.iconColor}`} />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-800">
              {content.title}
            </h1>

            <p className={`mt-4 text-lg font-medium ${content.textColor}`}>
              {content.message}
            </p>

            {userRole === "seller_pending" && (
              <div className="p-4 mt-4 bg-white rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> You can update your business
                  information, contact details, and profile picture while your
                  seller application is being reviewed by our admin team.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-8 w-full">
              <Link
                to={content.buttonLink}
                className={`flex items-center justify-center gap-2 px-6 py-3 font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors`}
              >
                {content.buttonText}
              </Link>

              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-6 py-3 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaHome className="text-sm" />
                Go to Homepage
              </Link>

              {!userRole && (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-6 py-3 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaSignInAlt className="text-sm" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Current role:{" "}
            <span className="font-medium">{userRole || "Not logged in"}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
