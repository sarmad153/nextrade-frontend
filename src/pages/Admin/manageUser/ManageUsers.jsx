import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaTrash,
  FaUser,
  FaEye,
  FaTimes,
  FaCheck,
  FaUserCheck,
  FaKey,
  FaUserTag,
  FaSync,
  FaIdCard,
  FaFileAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../../api/axiosInstance";

// Import extracted components
import UserDetailModal from "./UserDetailModel";
import UserActionsModal from "./UseractionModel";
import UserAvatar from "./UserAvatar";
import { getStatusBadge, getRoleBadge, formatDate } from "./utils";

const ManageUsers = () => {
  // State Management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewUser, setViewUser] = useState(null);
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState("");
  const [reason, setReason] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [activeTab, setActiveTab] = useState("allUsers");
  const [sellerDetailModal, setSellerDetailModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const roles = ["all", "buyer", "seller_approved", "seller_pending", "admin"];
  const statusOptions = ["all", "active", "blocked"];

  // Fetch users from API
  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);

      const response = await API.get("/admin/users", {
        params: {
          page,
          limit: 10,
          role: selectedRole !== "all" ? selectedRole : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          search: searchTerm || undefined,
        },
      });

      // Create users with basic data and load profiles
      const usersWithProfiles = await Promise.all(
        response.data.users.map(async (user) => {
          let profileData = null;

          try {
            const profileResponse = await API.get(`/profile/${user._id}`);
            profileData = profileResponse.data;
          } catch (profileError) {
            if (profileError.response?.status === 404) {
              // No profile found
            } else {
              console.error(
                `Error fetching profile for user ${user._id}:`,
                profileError.message
              );
            }
            profileData = null;
          }

          return {
            id: user._id,
            userId: `USR${user._id.slice(-6).toUpperCase()}`,
            name: user.name,
            email: user.email,
            phone: profileData?.phone || "Not provided",
            address: profileData?.address || "Not provided",
            role: user.role,
            status: user.isBlocked ? "blocked" : "active",
            registrationDate: user.createdAt,
            lastLogin: user.updatedAt,
            profileImage: profileData?.profileImage || null,
            avatar: user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase(),
            isBlocked: user.isBlocked,
            storeName:
              profileData?.shopName || user.storeName || "Not provided",
            storeDescription:
              profileData?.shopDescription ||
              user.storeDescription ||
              "Not provided",
            profileData: profileData,
            profileLoaded: !!profileData,
          };
        })
      );

      setUsers(usersWithProfiles);
      setFilteredUsers(usersWithProfiles);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalUsers(response.data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedStatus, searchTerm]);

  // Set loading timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        toast.error("Users loading timeout. Please check your connection.");
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Filter users locally for instant search
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.storeName &&
            user.storeName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((user) => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus]);

  // User Management Functions
  const blockUser = async (userId, reason) => {
    try {
      await API.put(`/admin/users/${userId}/block`, { isBlocked: true });
      const blockReason = reason || "Account blocked by admin";
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, status: "blocked", blockReason, isBlocked: true }
            : user
        )
      );
      toast.success("User blocked successfully");
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    }
  };

  const unblockUser = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/block`, { isBlocked: false });
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, status: "active", blockReason: "", isBlocked: false }
            : user
        )
      );
      toast.success("User unblocked successfully");
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user");
    }
  };

  // Fetch pending sellers
  const fetchPendingSellers = async () => {
    try {
      const response = await API.get("/admin/sellers/pending");

      // Handle different response structures
      let sellersData = [];
      if (Array.isArray(response.data)) {
        sellersData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        sellersData = response.data.data;
      } else if (response.data && Array.isArray(response.data.sellers)) {
        sellersData = response.data.sellers;
      }

      // Enhance sellers with profile data
      const sellersWithProfiles = await Promise.all(
        sellersData.map(async (seller) => {
          let profileData = null;
          try {
            const profileResponse = await API.get(`/profile/${seller._id}`);
            profileData = profileResponse.data;
          } catch (error) {
            console.error(
              `Error fetching profile for seller ${seller._id}:`,
              error
            );
          }

          return {
            id: seller._id,
            userId: `SELL${seller._id?.slice(-6)?.toUpperCase() || "000000"}`,
            name: seller.name,
            email: seller.email,
            phone: profileData?.phone || "Not provided",
            address: profileData?.address || "Not provided",
            businessName:
              profileData?.businessName ||
              profileData?.shopName ||
              "Not provided",
            businessType: profileData?.businessType || "Not specified",
            cnicNumber: profileData?.cnicNumber || "Not provided",
            cnicFront: profileData?.cnicFront,
            cnicBack: profileData?.cnicBack,
            businessRegistration: profileData?.businessRegistration,
            taxNumber: profileData?.taxNumber || "Not provided",
            applicationDate: seller.createdAt || seller.applicationDate,
            profileData: profileData,
            profileImage: profileData?.profileImage || null,
            avatar:
              seller.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "S",
          };
        })
      );

      setPendingSellers(sellersWithProfiles);
    } catch (error) {
      console.error("Error fetching pending sellers:", error);
      toast.error("Failed to load pending seller applications");
      setPendingSellers([]);
    }
  };

  // Approve seller
  const handleApproveSeller = async (sellerId) => {
    try {
      await API.put(`/admin/sellers/${sellerId}/approve`);
      toast.success("Seller approved successfully");

      // Remove from pending list and refresh users
      setPendingSellers(
        pendingSellers.filter((seller) => seller.id !== sellerId)
      );
      fetchUsers(currentPage);
    } catch (error) {
      console.error("Error approving seller:", error);
      toast.error("Failed to approve seller");
    }
  };

  // Reject seller
  const handleRejectSeller = async (sellerId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await API.put(`/admin/sellers/${sellerId}/reject`, { reason });
      toast.success("Seller rejected successfully");

      // Remove from pending list
      setPendingSellers(
        pendingSellers.filter((seller) => seller.id !== sellerId)
      );
    } catch (error) {
      console.error("Error rejecting seller:", error);
      toast.error("Failed to reject seller");
    }
  };

  // Bulk approve sellers
  const handleBulkApproveSellers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await Promise.all(
        selectedUsers.map((sellerId) =>
          API.put(`/admin/sellers/${sellerId}/approve`)
        )
      );
      toast.success(`${selectedUsers.length} sellers approved successfully`);

      // Refresh both lists
      setPendingSellers(
        pendingSellers.filter((seller) => !selectedUsers.includes(seller.id))
      );
      fetchUsers(currentPage);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error bulk approving sellers:", error);
      toast.error("Failed to approve sellers");
    }
  };

  useEffect(() => {
    if (activeTab === "sellerApprovals") {
      fetchPendingSellers();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const changeUserRole = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success(`User role changed to ${newRole}`);
    } catch (error) {
      console.error("Error changing user role:", error);
      toast.error("Failed to change user role");
    }
  };

  const deleteUser = async (userId) => {
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const resetPassword = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        toast.error("User not found");
        return;
      }

      await API.post("/auth/forgot-password", {
        email: user.email,
      });

      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error("Error resetting password:", error);

      if (error.response?.status === 404) {
        toast.error("User email not found");
      } else if (error.response?.status === 500) {
        toast.error("Failed to send reset email - server error");
      } else {
        toast.error("Failed to reset password");
      }
    }
  };

  // Handle viewing user
  const handleViewUser = async (user) => {
    setViewUser(user);
  };

  // Bulk Operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    try {
      const backendActionMap = {
        activate: "activate",
        block: "block",
        approve_sellers: "approve_sellers",
        delete: "delete",
      };

      const backendAction = backendActionMap[bulkAction];

      const response = await API.post("/admin/users/bulk-actions", {
        userIds: selectedUsers,
        action: backendAction,
      });

      toast.success(
        response.data.message || "Bulk action completed successfully"
      );

      fetchUsers(currentPage);
      setSelectedUsers([]);
      setBulkAction("");
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast.error("Failed to perform bulk action");
    }
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedStatus("all");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchUsers(currentPage);
    toast.info("Users list refreshed");
  };

  // Show loading screen until all data is loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light font-inter">
      <div className="p-4 md:p-6">
        {/* Header with Refresh */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage platform users and their permissions
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 text-sm font-medium transition bg-white border rounded-lg text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              <FaSync className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex border-b border-neutral-300 mb-6">
          <button
            className={`flex items-center px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "allUsers"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-neutral-600 hover:text-neutral-800"
            }`}
            onClick={() => setActiveTab("allUsers")}
          >
            <FaUser className="mr-2" />
            All Users
            <span className="ml-2 px-2 py-1 text-xs bg-neutral-200 text-neutral-700 rounded-full">
              {totalUsers}
            </span>
          </button>

          <button
            className={`flex items-center px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "sellerApprovals"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-neutral-600 hover:text-neutral-800"
            }`}
            onClick={() => setActiveTab("sellerApprovals")}
          >
            <FaUserCheck className="mr-2" />
            Seller Approvals
            {pendingSellers.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
                {pendingSellers.length} Pending
              </span>
            )}
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="p-3 mb-4 border border-primary-600 rounded-xl bg-secondary-200 md:p-4 md:mb-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-primary-700 md:text-base">
                  {selectedUsers.length}{" "}
                  {activeTab === "sellerApprovals" ? "seller(s)" : "user(s)"}{" "}
                  selected
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 md:px-4"
                >
                  <option value="">Choose bulk action...</option>
                  {activeTab === "allUsers" ? (
                    <>
                      <option value="activate">Activate Selected</option>
                      <option value="block">Block Selected</option>
                      <option value="delete">Delete Selected</option>
                    </>
                  ) : (
                    <>
                      <option value="approve">Approve Selected</option>
                      <option value="reject">Reject Selected</option>
                    </>
                  )}
                </select>
                <button
                  onClick={() => {
                    if (
                      activeTab === "sellerApprovals" &&
                      bulkAction === "approve"
                    ) {
                      handleBulkApproveSellers();
                    } else {
                      handleBulkAction();
                    }
                  }}
                  disabled={!bulkAction}
                  className="px-3 py-2 text-sm text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 md:px-4"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-3 py-2 text-sm bg-white border rounded-lg text-primary-600 border-primary-600 hover:bg-secondary-200 md:px-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="p-4 mb-4 bg-white border shadow-sm rounded-xl border-neutral-300 md:p-6 md:mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="relative max-w-md">
                <FaSearch className="absolute transform -translate-y-1/2 text-neutral-400 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, user ID, store, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent md:py-2.5"
                />
              </div>
            </div>

            {/* RESPONSIVE FILTERS*/}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              {/* Role Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 sm:w-auto"
                >
                  <option value="all">All Roles</option>
                  <option value="buyer">Buyers</option>
                  <option value="seller_approved">Approved Sellers</option>
                  <option value="seller_pending">Pending Sellers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 sm:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={clearFilters}
                className="flex items-center justify-center w-full px-4 py-2.5 text-sm text-neutral-700 rounded-lg bg-background-subtle hover:bg-neutral-200 sm:w-auto"
              >
                <FaTimes className="mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {activeTab === "allUsers" ? (
          /* Original Users Table */
          <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-neutral-300">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center md:p-12">
                <FaUser className="mx-auto text-4xl text-gray-400" />
                <p className="mt-3 text-gray-600">
                  No users found matching your criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-neutral-300 bg-background-subtle">
                    <tr>
                      <th className="w-12 px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        <input
                          type="checkbox"
                          checked={
                            selectedUsers.length === filteredUsers.length
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        User
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:table-cell md:px-6 md:py-4">
                        Role
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 sm:table-cell md:px-6 md:py-4">
                        Status
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 lg:table-cell md:px-6 md:py-4">
                        Registration
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-300">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-background-subtle"
                      >
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          <div className="flex items-center">
                            <UserAvatar user={user} size="md" />
                            <div className="ml-3 md:ml-4">
                              <div className="text-sm font-medium text-neutral-800">
                                {user.name}
                              </div>
                              <div className="text-xs text-neutral-600 md:text-sm">
                                {user.email}
                              </div>
                              <div className="text-xs text-neutral-500 md:hidden">
                                {user.role === "seller"
                                  ? "Seller"
                                  : user.role === "admin"
                                  ? "Admin"
                                  : "Buyer"}{" "}
                                • {user.status}
                              </div>
                              <div className="mt-1 text-xs text-neutral-500 lg:hidden">
                                Reg: {formatDate(user.registrationDate)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 whitespace-nowrap md:table-cell md:px-6 md:py-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="hidden px-4 py-3 whitespace-nowrap sm:table-cell md:px-6 md:py-4">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-neutral-800 whitespace-nowrap lg:table-cell md:px-6 md:py-4">
                          {formatDate(user.registrationDate)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap md:px-6 md:py-4">
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-1.5 transition rounded-lg text-primary-600 hover:text-primary-800 hover:bg-secondary-200 md:p-2"
                              title="View Profile"
                            >
                              <FaEye size={12} className="md:size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setActionUser(user);
                                setActionType("role");
                              }}
                              className="p-1.5 text-purple-600 transition rounded-lg hover:text-purple-800 hover:bg-purple-100 md:p-2"
                              title="Change Role"
                            >
                              <FaUserTag size={12} className="md:size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setActionUser(user);
                                setActionType("reset_password");
                              }}
                              className="p-1.5 text-orange-600 transition rounded-lg hover:text-orange-800 hover:bg-orange-100 md:p-2"
                              title="Reset Password"
                            >
                              <FaKey size={12} className="md:size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setActionUser(user);
                                setActionType("delete");
                              }}
                              className="p-1.5 text-red-600 transition rounded-lg hover:text-red-800 hover:bg-red-100 md:p-2"
                              title="Delete User"
                            >
                              <FaTrash size={12} className="md:size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Seller Approvals Table */
          <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-neutral-300">
            {pendingSellers.length === 0 ? (
              <div className="p-8 text-center md:p-12">
                <FaUserCheck className="mx-auto text-4xl text-gray-400" />
                <p className="mt-3 text-gray-600">
                  No pending seller applications
                </p>
                <p className="text-sm text-gray-500">
                  All seller applications have been processed
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-neutral-300 bg-background-subtle">
                    <tr>
                      <th className="w-12 px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        <input
                          type="checkbox"
                          checked={
                            selectedUsers.length === pendingSellers.length
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Seller
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:table-cell md:px-6 md:py-4">
                        Business
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 sm:table-cell md:px-6 md:py-4">
                        Contact
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 lg:table-cell md:px-6 md:py-4">
                        Applied
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-300">
                    {pendingSellers.map((seller) => (
                      <tr
                        key={seller.id}
                        className="transition hover:bg-background-subtle"
                      >
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(seller.id)}
                            onChange={() => toggleUserSelection(seller.id)}
                            className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          <div className="flex items-center">
                            <UserAvatar user={seller} size="md" />
                            <div className="ml-3 md:ml-4">
                              <div className="text-sm font-medium text-neutral-800">
                                {seller.name}
                              </div>
                              <div className="text-xs text-neutral-600 md:text-sm">
                                {seller.email}
                              </div>
                              <div className="text-xs text-neutral-500 md:hidden">
                                {seller.businessName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 whitespace-nowrap md:table-cell md:px-6 md:py-4">
                          <div>
                            <div className="text-sm font-medium text-neutral-800">
                              {seller.businessName}
                            </div>
                            <div className="text-xs text-neutral-600">
                              {seller.businessType}
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 whitespace-nowrap sm:table-cell md:px-6 md:py-4">
                          <div className="text-sm text-neutral-800">
                            {seller.phone}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-neutral-800 whitespace-nowrap lg:table-cell md:px-6 md:py-4">
                          {formatDate(seller.applicationDate)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap md:px-6 md:py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedSeller(seller);
                                setSellerDetailModal(true);
                              }}
                              className="p-1.5 transition rounded-lg text-primary-600 hover:text-primary-800 hover:bg-secondary-200 md:p-2"
                              title="View Details"
                            >
                              <FaEye size={12} className="md:size-3.5" />
                            </button>
                            <button
                              onClick={() => handleApproveSeller(seller.id)}
                              className="p-1.5 text-green-600 transition rounded-lg hover:text-green-800 hover:bg-green-100 md:p-2"
                              title="Approve Seller"
                            >
                              <FaCheck size={12} className="md:size-3.5" />
                            </button>
                            <button
                              onClick={() => handleRejectSeller(seller.id)}
                              className="p-1.5 text-red-600 transition rounded-lg hover:text-red-800 hover:bg-red-100 md:p-2"
                              title="Reject Seller"
                            >
                              <FaTimes size={12} className="md:size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {totalUsers} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 border-neutral-300 hover:bg-neutral-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchUsers(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 border-neutral-300 hover:bg-neutral-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Seller Detail Modal */}
      {sellerDetailModal && selectedSeller && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000c7]">
          <div className="bg-white rounded-xl shadow-2xl w-4/5 mx-4 max-h-[90vh] overflow-y-auto border border-neutral-300 z-[101]">
            {/* Fixed: Added higher z-index to header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-300 md:p-6 sticky top-0 bg-white z-[102]">
              <h2 className="text-lg font-semibold text-neutral-800 md:text-xl">
                Seller Application - {selectedSeller.name}
              </h2>
              <button
                onClick={() => {
                  setSellerDetailModal(false);
                  setSelectedSeller(null);
                }}
                className="p-2 transition text-neutral-500 hover:text-neutral-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="flex items-start mb-6 space-x-4">
                    <UserAvatar user={selectedSeller} size="lg" />
                    <div>
                      <h3 className="text-base font-medium text-neutral-800 md:text-lg">
                        {selectedSeller.name}
                      </h3>
                      <p className="text-sm text-neutral-600 md:text-base">
                        {selectedSeller.email}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <FaUserCheck className="mr-1" size={10} />
                          Pending Approval
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">
                          Seller ID
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {selectedSeller.userId}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">
                          Phone
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {selectedSeller.phone}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">
                          Business Name
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {selectedSeller.businessName}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">
                          Application Date
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {formatDate(selectedSeller.applicationDate)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">
                          Business Type
                        </label>
                        <p className="mt-1 text-sm text-neutral-800 capitalize">
                          {selectedSeller.businessType}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">
                          Tax Number
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {selectedSeller.taxNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="mt-6">
                    <h4 className="mb-4 text-base font-medium text-neutral-800 md:text-lg">
                      Business Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">
                          CNIC Number
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {selectedSeller.cnicNumber}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">
                          Address
                        </label>
                        <p className="mt-1 text-sm text-neutral-800">
                          {selectedSeller.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Links */}
                  {(selectedSeller.cnicFront ||
                    selectedSeller.cnicBack ||
                    selectedSeller.businessRegistration) && (
                    <div className="mt-6">
                      <h4 className="mb-4 text-base font-medium text-neutral-800 md:text-lg">
                        Documents
                      </h4>
                      <div className="space-y-2">
                        {selectedSeller.cnicFront && (
                          <a
                            href={`http://localhost:5000${selectedSeller.cnicFront}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                          >
                            <FaIdCard className="mr-2" />
                            View CNIC Front
                          </a>
                        )}
                        {selectedSeller.cnicBack && (
                          <a
                            href={`http://localhost:5000${selectedSeller.cnicBack}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                          >
                            <FaIdCard className="mr-2" />
                            View CNIC Back
                          </a>
                        )}
                        {selectedSeller.businessRegistration && (
                          <a
                            href={`http://localhost:5000${selectedSeller.businessRegistration}`}
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

                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-background-subtle md:p-4">
                    <h4 className="mb-3 text-sm font-medium text-neutral-800 md:text-base">
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleApproveSeller(selectedSeller.id);
                          setSellerDetailModal(false);
                        }}
                        className="flex items-center justify-center w-full px-3 py-2 text-xs text-white rounded-lg bg-green-600 hover:bg-green-700 md:text-sm"
                      >
                        <FaCheck className="mr-2" />
                        Approve Seller
                      </button>
                      <button
                        onClick={() => {
                          handleRejectSeller(selectedSeller.id);
                          setSellerDetailModal(false);
                        }}
                        className="flex items-center justify-center w-full px-3 py-2 text-xs text-white rounded-lg bg-red-600 hover:bg-red-700 md:text-sm"
                      >
                        <FaTimes className="mr-2" />
                        Reject Seller
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserActionsModal
        actionUser={actionUser}
        setActionUser={setActionUser}
        actionType={actionType}
        reason={reason}
        setReason={setReason}
        blockUser={blockUser}
        unblockUser={unblockUser}
        deleteUser={deleteUser}
        changeUserRole={changeUserRole}
        resetPassword={resetPassword}
      />

      <UserDetailModal
        viewUser={viewUser}
        setViewUser={setViewUser}
        setActionUser={setActionUser}
        setActionType={setActionType}
      />
    </div>
  );
};

export default ManageUsers;
