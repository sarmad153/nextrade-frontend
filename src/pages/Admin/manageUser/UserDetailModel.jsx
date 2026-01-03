import React from "react";
import {
  FaTimes,
  FaKey,
  FaUserTag,
  FaLock,
  FaUnlock,
  FaStore,
  FaBuilding,
  FaMapMarkerAlt,
  FaIdCard,
  FaPhone,
  FaCalendar,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import UserAvatar from "./UserAvatar";
import { getRoleBadge, getStatusBadge, formatDate } from "./utils";

const UserDetailModal = ({
  viewUser,
  setViewUser,
  setActionUser,
  setActionType,
}) => {
  if (!viewUser) return null;

  // Extract business information from profile data
  const profileData = viewUser.profileData || {};
  const isSeller = viewUser.role.includes("seller");
  const isPendingSeller = viewUser.role === "seller_pending";
  const isApprovedSeller = viewUser.role === "seller_approved";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000c7]">
      <div className="bg-white rounded-xl shadow-2xl w-4/5 mx-4 max-h-[90vh] overflow-y-auto border border-neutral-300 z-[101]">
        <div className="flex items-center justify-between p-4 border-b border-neutral-300 md:p-6 sticky top-0 bg-white z-[102]">
          <h2 className="text-lg font-semibold text-neutral-800 md:text-xl">
            User Profile - {viewUser.name}
            {isSeller && (
              <span className="ml-2 text-sm font-normal text-neutral-600">
                ({isPendingSeller ? "Pending Seller" : "Approved Seller"})
              </span>
            )}
          </h2>
          <button
            onClick={() => setViewUser(null)}
            className="p-2 transition text-neutral-500 hover:text-neutral-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-start mb-6 space-x-4">
                <div className="flex-shrink-0">
                  <UserAvatar user={viewUser} size="lg" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-neutral-800 md:text-lg">
                    {viewUser.name}
                  </h3>
                  <p className="text-sm text-neutral-600 md:text-base">
                    {viewUser.email}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    {getRoleBadge(viewUser.role)}
                    {getStatusBadge(viewUser.status)}
                    {isPendingSeller && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <FaClock className="mr-1" size={10} />
                        Pending Approval
                      </span>
                    )}
                    {isApprovedSeller && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1" size={10} />
                        Approved Seller
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      User ID
                    </label>
                    <p className="mt-1 text-sm text-neutral-800">
                      {viewUser.userId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Phone
                    </label>
                    <p className="mt-1 text-sm text-neutral-800">
                      {viewUser.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Role
                    </label>
                    <p className="mt-1 text-sm text-neutral-800 capitalize">
                      {viewUser.role}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Registration Date
                    </label>
                    <p className="mt-1 text-sm text-neutral-800">
                      {formatDate(viewUser.registrationDate)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Last Login
                    </label>
                    <p className="mt-1 text-sm text-neutral-800">
                      {formatDate(viewUser.lastLogin)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Account Status
                    </label>
                    <p className="mt-1 text-sm text-neutral-800 capitalize">
                      {viewUser.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mt-6">
                <h4 className="mb-4 text-base font-medium text-neutral-800 md:text-lg">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Address
                    </label>
                    <p className="mt-1 text-sm text-neutral-800">
                      {viewUser.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seller Business Information */}
              {isSeller && (
                <div className="mt-6">
                  <h4 className="mb-4 text-base font-medium text-neutral-800 md:text-lg">
                    Business Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 flex items-center">
                          <FaStore className="mr-2 text-blue-600" />
                          Store Name
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {profileData.shopName ||
                            viewUser.storeName ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 flex items-center">
                          <FaBuilding className="mr-2 text-blue-600" />
                          Business Type
                        </label>
                        <p className="mt-1 text-sm text-neutral-800 capitalize">
                          {profileData.businessType || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-blue-600" />
                          Business City
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {profileData.city || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 flex items-center">
                          <FaIdCard className="mr-2 text-blue-600" />
                          CNIC Number
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {profileData.cnicNumber || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 flex items-center">
                          <FaPhone className="mr-2 text-blue-600" />
                          Business Phone
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {profileData.businessPhone ||
                            viewUser.phone ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 flex items-center">
                          <FaCalendar className="mr-2 text-blue-600" />
                          Years in Business
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {profileData.yearsInBusiness || "0"} years
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Business Address */}
                  {profileData.businessAddress && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-neutral-700">
                        Business Address
                      </label>
                      <p className="mt-1 text-sm text-neutral-800">
                        {profileData.businessAddress}
                      </p>
                    </div>
                  )}

                  {/* Main Products */}
                  {profileData.mainProducts &&
                    profileData.mainProducts.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-neutral-700">
                          Main Products
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profileData.mainProducts.map((product, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600"
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Business Description */}
                  {(profileData.businessDescription ||
                    profileData.shopDescription) && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-neutral-700">
                        Business Description
                      </label>
                      <p className="mt-1 text-sm text-neutral-800">
                        {profileData.businessDescription ||
                          profileData.shopDescription}
                      </p>
                    </div>
                  )}

                  {/* Profile Completion Status */}
                  <div className="mt-4 p-3 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-neutral-700">
                      Profile Completion
                    </label>
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: profileData.isProfileComplete
                              ? "100%"
                              : "50%",
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-neutral-600">
                        {profileData.isProfileComplete
                          ? "Complete"
                          : "Incomplete"}
                      </span>
                    </div>
                  </div>

                  {/* Document Links */}
                  {(profileData.cnicFront ||
                    profileData.cnicBack ||
                    profileData.businessRegistration) && (
                    <div className="mt-4">
                      <h5 className="mb-2 text-sm font-medium text-neutral-700">
                        Verification Documents
                      </h5>
                      <div className="space-y-2">
                        {profileData.cnicFront && (
                          <a
                            href={`https://nextrade-backend-production-a486.up.railway.app/${profileData.cnicFront}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                          >
                            <FaFileAlt className="mr-2" />
                            View CNIC Front
                          </a>
                        )}
                        {profileData.cnicBack && (
                          <a
                            href={`https://nextrade-backend-production-a486.up.railway.app/${profileData.cnicBack}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                          >
                            <FaFileAlt className="mr-2" />
                            View CNIC Back
                          </a>
                        )}
                        {profileData.businessRegistration && (
                          <a
                            href={`https://nextrade-backend-production-a486.up.railway.app/${profileData.businessRegistration}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                          >
                            <FaFileAlt className="mr-2" />
                            View Business Registration
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-background-subtle md:p-4">
                <h4 className="mb-3 text-sm font-medium text-neutral-800 md:text-base">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActionUser(viewUser);
                      setActionType("reset_password");
                    }}
                    className="flex items-center justify-center w-full px-3 py-2 text-xs text-white rounded-lg bg-primary-600 hover:bg-primary-700 md:text-sm"
                  >
                    <FaKey className="mr-2" />
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      setActionUser(viewUser);
                      setActionType("role");
                    }}
                    className="flex items-center justify-center w-full px-3 py-2 text-xs text-white rounded-lg bg-primary-600 hover:bg-primary-700 md:text-sm"
                  >
                    <FaUserTag className="mr-2" />
                    Change Role
                  </button>
                </div>
              </div>

              {/* Seller Specific Actions */}
              {isPendingSeller && (
                <div className="p-3 rounded-lg bg-orange-50 md:p-4">
                  <h4 className="mb-3 text-sm font-medium text-orange-800 md:text-base">
                    Seller Approval
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActionUser(viewUser);
                        setActionType("approve_seller");
                      }}
                      className="flex items-center justify-center w-full px-3 py-2 text-xs text-white rounded-lg bg-green-600 hover:bg-green-700 md:text-sm"
                    >
                      <FaCheckCircle className="mr-2" />
                      Approve Seller
                    </button>
                    <button
                      onClick={() => {
                        setActionUser(viewUser);
                        setActionType("reject_seller");
                      }}
                      className="flex items-center justify-center w-full px-3 py-2 text-xs text-white rounded-lg bg-red-600 hover:bg-red-700 md:text-sm"
                    >
                      <FaTimes className="mr-2" />
                      Reject Seller
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-background-subtle md:p-4">
                <h4 className="mb-3 text-sm font-medium text-neutral-800 md:text-base">
                  Account Status
                </h4>
                <div className="space-y-2">
                  {viewUser.status === "active" && (
                    <button
                      onClick={() => {
                        setActionUser(viewUser);
                        setActionType("block");
                      }}
                      className="flex items-center justify-center w-full px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 md:text-sm"
                    >
                      <FaLock className="mr-2" />
                      Block User
                    </button>
                  )}
                  {viewUser.status === "blocked" && (
                    <button
                      onClick={() => {
                        setActionUser(viewUser);
                        setActionType("unblock");
                      }}
                      className="flex items-center justify-center w-full px-3 py-2 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 md:text-sm"
                    >
                      <FaUnlock className="mr-2" />
                      Unblock User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
