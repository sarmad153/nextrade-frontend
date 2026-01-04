import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUser,
  FaStore,
  FaUserSlash,
  FaBox,
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartLine,
  FaArrowRight,
  FaExclamationTriangle,
  FaClock,
  FaShoppingBag,
  FaUserCheck,
  FaUserClock,
  FaCheck,
  FaTimes,
  FaDollarSign,
  FaBullhorn,
  FaMoneyCheck,
  FaHourglassHalf,
  FaMousePointer,
  FaCreditCard,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalSellers: 0,
    blockedUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingSellers: 0,
    approvedSellers: 0,
    rejectedSellers: 0,
    advertising: {
      totalAds: 0,
      activeAds: 0,
      pendingAds: 0,
      approvedAds: 0,
      awaitingPaymentCount: 0,
      pendingApprovalCount: 0,
      paidAds: 0,
      revenue: 0,
      monthlyRevenue: 0,
      approvedRevenue: 0,
      pendingRevenue: 0,
      paymentBreakdown: {
        completed: 0,
        processing: 0,
        pending: 0,
        failed: 0,
      },
      impressions: 0,
      clicks: 0,
      avgCTR: 0,
    },
  });

  const [quickStats, setQuickStats] = useState({
    monthlyRevenue: 0,
    totalOrders: 0,
    conversionRate: "0%",
    activeSessions: 0,
  });
  const [recentActivities, setRecentActivities] = useState({
    users: [],
    products: [],
    orders: [],
  });
  const [pendingSellersList, setPendingSellersList] = useState([]);

  // Get user role from JWT token
  const getRoleFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.role;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Seller approval functions
  const handleApproveSeller = async (sellerId) => {
    try {
      await API.put(`/admin/sellers/${sellerId}/approve`);
      toast.success("Seller approved successfully");
      fetchDashboardStats();
    } catch (error) {
      console.error("Error approving seller:", error);
      toast.error("Failed to approve seller");
    }
  };

  const handleRejectSeller = async (sellerId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await API.put(`/admin/sellers/${sellerId}/reject`, {
        rejectedReason: reason,
      });
      toast.success("Seller rejected successfully");
      fetchDashboardStats();
    } catch (error) {
      console.error("Error rejecting seller:", error);
      toast.error("Failed to reject seller");
    }
  };

  // Fetch all dashboard data from APIs
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const [
        statsResponse,
        quickStatsResponse,
        activitiesResponse,
        pendingSellersResponse,
      ] = await Promise.allSettled([
        API.get("/admin/stats"),
        API.get("/admin/quick-stats"),
        API.get("/admin/recent-activities"),
        API.get("/admin/sellers/pending"),
      ]);

      // Handle stats API response
      if (statsResponse.status === "fulfilled") {
        const statsData = statsResponse.value.data;
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalBuyers: statsData.totalBuyers || 0,
          totalSellers: statsData.totalSellers || 0,
          blockedUsers: statsData.blockedUsers || 0,
          totalProducts: statsData.totalProducts || 0,
          totalOrders: statsData.totalOrders || 0,
          pendingSellers: statsData.pendingSellers || 0,
          approvedSellers: statsData.approvedSellers || 0,
          rejectedSellers: statsData.rejectedSellers || 0,
          advertising: {
            totalAds: statsData.advertising?.totalAds || 0,
            activeAds: statsData.advertising?.activeAds || 0,
            pendingAds: statsData.advertising?.pendingAds || 0,
            approvedAds: statsData.advertising?.approvedAds || 0,
            awaitingPaymentCount:
              statsData.advertising?.awaitingPaymentCount || 0,
            pendingApprovalCount:
              statsData.advertising?.pendingApprovalCount || 0,
            paidAds: statsData.advertising?.paidAds || 0,
            revenue: statsData.advertising?.revenue || 0,
            monthlyRevenue: statsData.advertising?.monthlyRevenue || 0,
            approvedRevenue: statsData.advertising?.approvedRevenue || 0,
            pendingRevenue: statsData.advertising?.pendingRevenue || 0,
            paymentBreakdown: statsData.advertising?.paymentBreakdown || {
              completed: 0,
              processing: 0,
              pending: 0,
              failed: 0,
            },
            impressions: statsData.advertising?.impressions || 0,
            clicks: statsData.advertising?.clicks || 0,
            avgCTR: statsData.advertising?.avgCTR || 0,
          },
        });
      } else {
        toast.error("Failed to load statistics");
      }

      // Handle quick stats API response
      if (quickStatsResponse.status === "fulfilled") {
        setQuickStats(quickStatsResponse.value.data);
      } else {
        console.error("Quick stats API failed:", quickStatsResponse.reason);
        setQuickStats({
          monthlyRevenue: 0,
          totalOrders: 0,
          conversionRate: "0%",
          activeSessions: 0,
        });
      }

      // Handle activities API response
      if (activitiesResponse.status === "fulfilled") {
        setRecentActivities(activitiesResponse.value.data);
      } else {
        console.error("Activities API failed:", activitiesResponse.reason);
      }

      // Handle pending sellers API response
      if (pendingSellersResponse.status === "fulfilled") {
        const response = pendingSellersResponse.value;
        let sellersData = [];
        if (response.data?.sellers) {
          sellersData = response.data.sellers;
        } else if (response.sellers) {
          sellersData = response.sellers;
        } else if (response.data && Array.isArray(response.data)) {
          sellersData = response.data;
        } else if (Array.isArray(response)) {
          sellersData = response;
        }
        setPendingSellersList(sellersData);
      } else {
        console.error(
          "Pending sellers API failed:",
          pendingSellersResponse.reason
        );
        setPendingSellersList([]);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Check user role and load dashboard data
  useEffect(() => {
    const checkUserRole = () => {
      const tokenRole = getRoleFromToken();
      const storedRole = localStorage.getItem("userRole");
      const finalRole = tokenRole || storedRole;

      if (!finalRole) {
        toast.error("No user role found. Please login again.");
        setLoading(false);
        return;
      }

      setUserRole(finalRole);

      if (finalRole === "admin") {
        fetchDashboardStats();
      } else {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  // Set loading timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast.error("Dashboard loading timeout. Please check your connection.");
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Format date to relative time
  const formatActivityTime = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      if (diffInMinutes < 1440)
        return `${Math.floor(diffInMinutes / 60)} hours ago`;
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    } catch (error) {
      return "Recently";
    }
  };

  // Get appropriate icon and color for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case "users":
        return { icon: FaUser, color: "text-blue-600 bg-blue-100" };
      case "products":
        return { icon: FaBox, color: "text-purple-600 bg-purple-100" };
      case "orders":
        return { icon: FaShoppingCart, color: "text-green-600 bg-green-100" };
      case "seller":
        return { icon: FaUserClock, color: "text-orange-600 bg-orange-100" };
      default:
        return { icon: FaClock, color: "text-gray-600 bg-gray-100" };
    }
  };

  // Generate recent activities from API data
  const generateRecentActivities = () => {
    const activities = [];

    // Add recent user registrations
    if (Array.isArray(recentActivities.users)) {
      recentActivities.users.slice(0, 2).forEach((user) => {
        activities.push({
          id: user._id,
          type: "user",
          title: "New User Registered",
          description: `${user.name || "Unknown"} (${
            user.email || "No email"
          })`,
          time: formatActivityTime(user.createdAt),
          timestamp: new Date(user.createdAt),
          ...getActivityIcon("users"),
        });
      });
    }

    // Add recent product additions
    if (Array.isArray(recentActivities.products)) {
      recentActivities.products.slice(0, 2).forEach((product) => {
        const categoryName = product.category?.name || "Uncategorized";
        activities.push({
          id: product._id,
          type: "product",
          title: "New Product Added",
          description: `${
            product.name || "Unknown Product"
          } in ${categoryName}`,
          time: formatActivityTime(product.createdAt),
          timestamp: new Date(product.createdAt),
          ...getActivityIcon("products"),
        });
      });
    }

    // Add recent orders
    if (Array.isArray(recentActivities.orders)) {
      recentActivities.orders.slice(0, 2).forEach((order) => {
        const orderId = order._id ? order._id.slice(-6) : "N/A";
        const amount = order.totalAmount || "0";
        activities.push({
          id: order._id,
          type: "order",
          title: "New Order Placed",
          description: `Order #${orderId} - Rs ${amount}`,
          time: formatActivityTime(order.createdAt),
          timestamp: new Date(order.createdAt),
          ...getActivityIcon("orders"),
        });
      });
    }

    // Add pending seller applications
    if (Array.isArray(pendingSellersList)) {
      pendingSellersList.slice(0, 2).forEach((seller) => {
        const businessProfile = seller.businessProfile || {};
        activities.push({
          id: seller._id,
          type: "seller",
          title: "New Seller Application",
          description: `${
            businessProfile.shopName || seller.name
          } - Pending approval`,
          time: formatActivityTime(seller.createdAt),
          timestamp: new Date(seller.createdAt),
          icon: FaUserClock,
          color: "text-orange-600 bg-orange-100",
        });
      });
    }

    // If no activities, show welcome message
    if (activities.length === 0) {
      return [
        {
          id: 1,
          type: "fallback",
          title: "Welcome to Admin Dashboard",
          description: "Start managing your platform",
          time: "Just now",
          icon: FaChartLine,
          color: "text-primary-600 bg-primary-100",
        },
      ];
    }

    // Sort by timestamp and take latest 4 activities
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 4)
      .map(({ timestamp, ...activity }) => activity);
  };

  // Show access denied if user is not admin
  if (userRole && userRole !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-4 text-center bg-white rounded-lg shadow-md md:p-6">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-red-500 md:text-5xl" />
          <h2 className="mb-2 text-xl font-bold text-neutral-800 md:text-2xl">
            Access Denied
          </h2>
          <p className="mb-4 text-neutral-600 md:mb-6">
            You need administrator privileges to access this dashboard.
            <br />
            Current role: <strong>{userRole || "none"}</strong>
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-background-light md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-neutral-800 font-poppins md:text-3xl">
            Admin Dashboard
          </h1>
          <p className="text-neutral-600">
            Platform overview and performance metrics
          </p>
        </div>

        {/* ADVERTISING REVENUE SECTION */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-lg md:mb-8">
          <h3 className="mb-6 text-xl font-bold text-neutral-800">
            Advertising Revenue
          </h3>

          {/* Total Collected Revenue Card */}
          <div className="mb-6 p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-green-50 to-blue-50 border border-green-100">
            <FaMoneyBillWave className="text-3xl text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-700">
              Rs {stats.advertising?.revenue?.toLocaleString() || "0"}
            </div>
            <div className="mt-1 text-lg font-semibold text-neutral-800">
              Total Collected Revenue
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              This Month: Rs{" "}
              {stats.advertising?.monthlyRevenue?.toLocaleString() || "0"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Potential Revenue Card */}
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-purple-50 border border-purple-100">
              <FaBullhorn className="text-2xl text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-700">
                Rs {stats.advertising?.approvedRevenue?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Potential Revenue
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                From approved but unpaid ads
              </div>
              <div className="mt-2 text-xs text-purple-600">
                {stats.advertising?.awaitingPaymentCount || 0} ads awaiting
                payment
              </div>
            </div>

            {/* Pending Approval Card */}
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-orange-50 border border-orange-100">
              <FaHourglassHalf className="text-2xl text-orange-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-orange-700">
                Rs {stats.advertising?.pendingRevenue?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Pending Approval
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                {stats.advertising?.pendingApprovalCount || 0} payments awaiting
                verification
              </div>
            </div>
          </div>

          {/* Advertising Stats Row */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="p-4 text-center rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-lg font-bold text-gray-700">
                {stats.advertising?.totalAds || 0}
              </div>
              <div className="text-sm text-gray-600">Total Ads</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-green-50 border border-green-200">
              <div className="text-lg font-bold text-green-700">
                {stats.advertising?.activeAds || 0}
              </div>
              <div className="text-sm text-green-600">Active Ads</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-lg font-bold text-blue-700">
                {stats.advertising?.approvedAds || 0}
              </div>
              <div className="text-sm text-blue-600">Approved Ads</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="text-lg font-bold text-yellow-700">
                {stats.advertising?.pendingAds || 0}
              </div>
              <div className="text-sm text-yellow-600">Pending Approval</div>
            </div>
          </div>

          {/* Payment Status Section */}
          <div className="p-6 mt-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <h3 className="mb-4 text-lg font-bold text-neutral-800">
              Payment Status Breakdown
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="p-4 text-center rounded-lg bg-emerald-50 border border-emerald-200">
                <FaMoneyCheck className="text-xl text-emerald-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-emerald-700">
                  {stats.advertising?.paymentBreakdown?.completed || 0}
                </div>
                <div className="text-sm font-medium text-emerald-600">
                  Completed
                </div>
                <div className="text-xs text-neutral-500">Paid & Verified</div>
              </div>
              <div className="p-4 text-center rounded-lg bg-amber-50 border border-amber-200">
                <FaHourglassHalf className="text-xl text-amber-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-amber-700">
                  {stats.advertising?.paymentBreakdown?.processing || 0}
                </div>
                <div className="text-sm font-medium text-amber-600">
                  Processing
                </div>
                <div className="text-xs text-neutral-500">
                  Awaiting Verification
                </div>
              </div>
              <div className="p-4 text-center rounded-lg bg-orange-50 border border-orange-200">
                <FaClock className="text-xl text-orange-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-orange-700">
                  {stats.advertising?.paymentBreakdown?.pending || 0}
                </div>
                <div className="text-sm font-medium text-orange-600">
                  Pending
                </div>
                <div className="text-xs text-neutral-500">
                  Payment Not Started
                </div>
              </div>
              <div className="p-4 text-center rounded-lg bg-red-50 border border-red-200">
                <FaTimes className="text-xl text-red-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-red-700">
                  {stats.advertising?.paymentBreakdown?.failed || 0}
                </div>
                <div className="text-sm font-medium text-red-600">Failed</div>
                <div className="text-xs text-neutral-500">Payment Failed</div>
              </div>
            </div>
          </div>

          {/* Ad Performance Metrics */}
          {(stats.advertising?.impressions > 0 ||
            stats.advertising?.clicks > 0) && (
            <div className="p-6 mt-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <h3 className="mb-4 text-lg font-bold text-neutral-800">
                Ad Performance
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="p-4 text-center rounded-lg bg-indigo-50 border border-indigo-200">
                  <FaBullhorn className="text-xl text-indigo-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-indigo-700">
                    {stats.advertising?.impressions?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm font-medium text-indigo-600">
                    Impressions
                  </div>
                </div>
                <div className="p-4 text-center rounded-lg bg-teal-50 border border-teal-200">
                  <FaMousePointer className="text-xl text-teal-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-teal-700">
                    {stats.advertising?.clicks?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm font-medium text-teal-600">
                    Clicks
                  </div>
                </div>
                <div className="p-4 text-center rounded-lg bg-pink-50 border border-pink-200">
                  <FaChartLine className="text-xl text-pink-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-pink-700">
                    {stats.advertising?.avgCTR?.toFixed(2) || "0.00"}%
                  </div>
                  <div className="text-sm font-medium text-pink-600">
                    Avg. CTR
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PLATFORM STATISTICS */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-lg md:mb-8">
          <h3 className="mb-6 text-xl font-bold text-neutral-800">
            Platform Statistics
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-blue-50">
              <FaUsers className="text-2xl text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalUsers?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Total Users
              </div>
            </div>
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-green-50">
              <FaStore className="text-2xl text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600">
                {stats.totalSellers?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Total Sellers
              </div>
            </div>
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-yellow-50">
              <FaShoppingBag className="text-2xl text-yellow-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-yellow-600">
                {stats.totalOrders?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Total Orders
              </div>
            </div>
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-purple-50">
              <FaBox className="text-2xl text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalProducts?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Total Products
              </div>
            </div>
          </div>
        </div>

        {/* USER STATISTICS */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-lg md:mb-8">
          <h3 className="mb-6 text-xl font-bold text-neutral-800">
            User Statistics
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-indigo-50">
              <FaUser className="text-2xl text-indigo-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-indigo-600">
                {stats.totalBuyers?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Total Buyers
              </div>
            </div>
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-teal-50">
              <FaUserCheck className="text-2xl text-teal-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-teal-600">
                {stats.approvedSellers?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Approved Sellers
              </div>
            </div>
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-orange-50">
              <FaUserClock className="text-2xl text-orange-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingSellers?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Pending Sellers
              </div>
            </div>
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-red-50">
              <FaUserSlash className="text-2xl text-red-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-red-600">
                {stats.blockedUsers?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Blocked Users
              </div>
            </div>
          </div>
        </div>

        {/* PERFORMANCE METRICS */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-lg md:mb-8">
          <h3 className="mb-6 text-xl font-bold text-neutral-800">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-emerald-50">
              <FaDollarSign className="text-2xl text-emerald-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-emerald-600">
                Rs {quickStats.monthlyRevenue?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Monthly Revenue
              </div>
            </div>
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-cyan-50">
              <FaChartLine className="text-2xl text-cyan-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-cyan-600">
                {quickStats.conversionRate || "0%"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Conversion Rate
              </div>
            </div>
            <div className="p-6 text-center rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-violet-50">
              <FaUsers className="text-2xl text-violet-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-violet-600">
                {quickStats.activeSessions?.toLocaleString() || "0"}
              </div>
              <div className="mt-1 text-sm font-medium text-neutral-700">
                Active Sessions
              </div>
            </div>
          </div>
        </div>

        {/* PENDING SELLERS SECTION - COMPACT MOBILE DESIGN */}
        {pendingSellersList.length > 0 && (
          <div className="p-4 mb-6 bg-white rounded-lg shadow-lg md:p-6">
            <div className="flex flex-col items-start justify-between mb-4 md:flex-row md:items-center">
              <div className="flex items-center mb-2 md:mb-0">
                <FaUserClock
                  className="mr-2 text-orange-600 flex-shrink-0"
                  size={20}
                />
                <h2 className="text-lg font-bold text-neutral-800 md:text-xl">
                  Pending Seller Approvals
                </h2>
                <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded-full">
                  {pendingSellersList.length}
                </span>
              </div>
              <Link
                to="/admin/manage-users"
                className="inline-flex items-center self-end mt-1 text-sm font-medium text-primary-600 hover:text-primary-700 md:self-center md:mt-0"
              >
                View all
                <FaArrowRight className="ml-1" size={12} />
              </Link>
            </div>

            <div className="space-y-2">
              {pendingSellersList.slice(0, 3).map((seller) => {
                const businessProfile = seller.businessProfile || {};
                return (
                  <div
                    key={seller._id}
                    className="p-3 border rounded-lg border-neutral-200 hover:bg-gray-50"
                  >
                    {/* Mobile Stack Layout */}
                    <div className="flex flex-col space-y-2 md:hidden">
                      {/* Header with shop name and actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 mr-2 bg-orange-100 rounded-full">
                            <FaStore className="text-orange-600" size={14} />
                          </div>
                          <p className="font-medium text-gray-800 truncate">
                            {businessProfile.shopName || seller.name}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleApproveSeller(seller._id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Approve"
                          >
                            <FaCheck size={14} />
                          </button>
                          <button
                            onClick={() => handleRejectSeller(seller._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Reject"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 truncate">
                          {seller.email}
                        </p>
                        <div className="flex flex-wrap gap-x-2 text-xs text-gray-500">
                          <span>
                            <span className="font-medium">Type:</span>{" "}
                            {businessProfile.businessType || "Not specified"}
                          </span>
                          <span>
                            <span className="font-medium">City:</span>{" "}
                            {businessProfile.city || "Not specified"}
                          </span>
                          <span>
                            <span className="font-medium">Applied:</span>{" "}
                            {new Date(seller.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Row Layout */}
                    <div className="hidden md:flex md:items-center md:justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                          <FaStore className="text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {businessProfile.shopName || seller.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {seller.email}
                          </p>
                          <div className="flex space-x-2 text-xs text-gray-500">
                            <span>
                              Business:{" "}
                              {businessProfile.businessType || "Not specified"}
                            </span>
                            <span>|</span>
                            <span>
                              City: {businessProfile.city || "Not specified"}
                            </span>
                            <span>|</span>
                            <span>
                              Applied:{" "}
                              {new Date(seller.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveSeller(seller._id)}
                          className="flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          <FaCheck className="mr-1" size={10} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectSeller(seller._id)}
                          className="flex items-center px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                          <FaTimes className="mr-1" size={10} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RECENT ACTIVITIES */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-4 border-b border-neutral-200 md:p-6">
              <h2 className="flex items-center text-lg font-bold text-neutral-800 md:text-xl">
                <FaClock className="mr-2 text-primary-600" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-neutral-200">
              {generateRecentActivities().map((activity) => (
                <div key={activity.id} className="p-4 md:p-6">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${activity.color}`}>
                      <activity.icon className="text-sm md:text-base" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-neutral-900 md:text-base">
                        {activity.title}
                      </h3>
                      <p className="text-xs text-neutral-600 md:text-sm">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-neutral-200 md:p-6">
              <Link
                to="/admin/manage-orders"
                className="flex items-center justify-center text-primary-600 hover:text-primary-700"
              >
                View all activities <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
