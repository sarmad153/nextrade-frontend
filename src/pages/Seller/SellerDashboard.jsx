import React, { useState, useEffect } from "react";
import {
  FaBox,
  FaMoneyBillWave,
  FaShoppingCart,
  FaTruck,
  FaExclamationTriangle,
  FaArrowRight,
  FaPlus,
  FaEdit,
  FaChartLine,
  FaUserClock,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";

const SellerDashboard = () => {
  const [userRole, setUserRole] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);

        const user = JSON.parse(localStorage.getItem("user"));
        const currentRole = user?.role;
        setUserRole(currentRole);

        try {
          const profileResponse = await API.get("/profile/me");
          const profileData = profileResponse.data;

          if (currentRole === "seller_approved") {
            setApprovalStatus("approved");
          } else if (currentRole === "seller_pending") {
            setApprovalStatus("pending");
          } else {
            setApprovalStatus("");
          }

          if (["seller_pending", "seller_approved"].includes(currentRole)) {
            setProfileComplete(profileData.isProfileComplete || false);
          }
        } catch (profileError) {
          console.error("Profile fetch error:", profileError);
        }

        if (currentRole !== "seller_approved" || !profileComplete) {
          setLoading(false);
          return;
        }

        await Promise.allSettled([
          fetchStats(),
          fetchRecentOrders(),
          fetchLowStockProducts(),
        ]);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const statsResponse = await API.get("/admin/seller/stats");
        if (statsResponse.data) {
          setStats(statsResponse.data);
        }
      } catch (statsError) {
        console.error("Stats fetch error:", statsError);
        toast.error("Failed to load statistics");
      }
    };

    const fetchRecentOrders = async () => {
      try {
        const ordersResponse = await API.get("/orders/seller/orders");
        if (ordersResponse.data) {
          const orders = Array.isArray(ordersResponse.data)
            ? ordersResponse.data
            : ordersResponse.data.orders || [];
          setRecentOrders(orders.slice(0, 4));
        }
      } catch (ordersError) {
        console.error("Orders fetch error:", ordersError);
      }
    };

    const fetchLowStockProducts = async () => {
      try {
        const productsResponse = await API.get("/products/seller/products");
        if (productsResponse.data) {
          const products = Array.isArray(productsResponse.data)
            ? productsResponse.data
            : productsResponse.data.products || [];

          const lowStock = products
            .filter((product) => product.stock > 0 && product.stock < 10)
            .slice(0, 3);
          setLowStockProducts(lowStock);
        }
      } catch (productsError) {
        console.error("Products fetch error:", productsError);
      }
    };

    fetchSellerData();
  }, [profileComplete]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast.error("Dashboard loading timeout. Please check your connection.");
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  if (userRole === "seller_pending") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-lg md:p-8">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full">
            <FaUserClock className="text-3xl text-blue-600" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-neutral-800">
            Approval Pending
          </h2>
          <p className="mb-5 text-neutral-600">
            Your seller application is under review. Our admin team will verify
            your business details and approve your account soon.
          </p>
          <div className="p-4 mb-5 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Status:</strong> Pending Review
            </p>
            {!profileComplete && (
              <p className="mt-2 text-sm text-orange-700">
                <strong>Note:</strong> Complete your business profile for faster
                approval
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/seller/profile"
              className="inline-flex items-center justify-center px-5 py-2.5 text-white rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              {profileComplete
                ? "View Business Profile"
                : "Complete Business Profile"}
            </Link>
            {profileComplete && (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-5 py-2.5 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Check Approval Status
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (userRole === "seller_approved" && !profileComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-lg md:p-8">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full">
            <FaExclamationTriangle className="text-3xl text-orange-500" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-neutral-800">
            Complete Your Business Profile
          </h2>
          <p className="mb-5 text-neutral-600">
            Your seller account is approved! Please complete your business
            profile to start selling and access all seller features.
          </p>
          <div className="p-4 mb-5 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              <strong>Required:</strong> Business details, CNIC verification,
              and contact information
            </p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-5 py-2.5 text-white rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Complete Business Profile
          </Link>
        </div>
      </div>
    );
  }

  if (userRole !== "seller_approved") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-lg md:p-8">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full">
            <FaExclamationTriangle className="text-3xl text-red-500" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-neutral-800">
            Access Denied
          </h2>
          <p className="mb-5 text-neutral-600">
            You need approved seller privileges to access this dashboard.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-5 py-2.5 text-white rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Apply as Seller
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-background-light md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-800 md:text-3xl">
            Seller Dashboard
          </h1>
          <p className="text-neutral-600">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        <div className="mb-8">
          {/* First Row - Main Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 text-center bg-white rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                <FaBox className="text-2xl text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalProducts?.toLocaleString() || "0"}
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-700">
                Total Products
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                Across all categories
              </div>
            </div>

            <div className="p-6 text-center bg-white rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                <FaShoppingCart className="text-2xl text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">
                {stats.totalOrders?.toLocaleString() || "0"}
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-700">
                Total Orders
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                All time orders
              </div>
            </div>

            <div className="p-6 text-center bg-white rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full">
                <FaMoneyBillWave className="text-2xl text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600">
                Rs {stats.totalRevenue?.toLocaleString() || "0"}
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-700">
                Total Revenue
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                Lifetime earnings
              </div>
            </div>

            <div className="p-6 text-center bg-white rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
                <FaTruck className="text-2xl text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pendingOrders?.toLocaleString() || "0"}
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-700">
                Pending Orders
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                Require attention
              </div>
            </div>
          </div>

          {/* Second Row - Product Status Stats */}
          <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3 lg:gap-6">
            <div className="p-6 bg-white rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center md:justify-start">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <FaCheckCircle className="text-2xl text-green-600" />
                </div>
                <div className="ml-4 text-center md:text-left">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.activeProducts?.toLocaleString() || "0"}
                  </div>
                  <div className="mt-1 text-sm font-medium text-neutral-700">
                    Active Products
                  </div>
                  <div className="text-xs text-neutral-500">
                    Available for purchase
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center md:justify-start">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100">
                  <FaExclamationTriangle className="text-2xl text-yellow-600" />
                </div>
                <div className="ml-4 text-center md:text-left">
                  <div className="text-3xl font-bold text-yellow-600">
                    {stats.lowStockProducts?.toLocaleString() || "0"}
                  </div>
                  <div className="mt-1 text-sm font-medium text-neutral-700">
                    Low Stock Items
                  </div>
                  <div className="text-xs text-neutral-500">
                    Need replenishment
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center md:justify-start">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <FaBox className="text-2xl text-red-600" />
                </div>
                <div className="ml-4 text-center md:text-left">
                  <div className="text-3xl font-bold text-red-600">
                    {stats.outOfStockProducts?.toLocaleString() || "0"}
                  </div>
                  <div className="mt-1 text-sm font-medium text-neutral-700">
                    Out of Stock
                  </div>
                  <div className="text-xs text-neutral-500">
                    Require restocking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          {/* Recent Orders Card */}
          <div className="overflow-hidden bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-primary-100 text-primary-600">
                    <FaShoppingCart className="text-lg" />
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-bold text-neutral-800">
                      Recent Orders
                    </h2>
                    <p className="text-sm text-neutral-600">
                      Latest customer orders
                    </p>
                  </div>
                </div>
                <Link
                  to="/seller/orders"
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  View All <FaArrowRight className="ml-1" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-neutral-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-neutral-900">
                          ORD-{order._id?.slice(-6).toUpperCase() || "N/A"}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {order.user?.name || "Customer"} •{" "}
                          {order.items?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">
                          Rs {order.totalAmount || 0}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 mt-1 text-xs rounded-full font-medium ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "Processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-neutral-100 text-neutral-800"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  <FaShoppingCart className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                  <p>No recent orders found</p>
                  <p className="text-sm mt-1">
                    Start selling to see orders here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert Card */}
          <div className="overflow-hidden bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                    <FaExclamationTriangle className="text-lg" />
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-bold text-neutral-800">
                      Low Stock Alert
                    </h2>
                    <p className="text-sm text-neutral-600">
                      Products running low
                    </p>
                  </div>
                </div>
                <Link
                  to="/seller/manage-products?status=Low Stock"
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  Manage <FaArrowRight className="ml-1" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-neutral-200">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="p-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Only {product.stock} left in stock
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                        Restock needed
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-200">
                      <div
                        className="h-2 bg-red-500 rounded-full"
                        style={{ width: `${(product.stock / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  <FaCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p>All products are well stocked</p>
                  <p className="text-sm mt-1">Great inventory management!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-100 text-primary-600">
                <FaChartLine className="text-lg" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold text-neutral-800">
                  Quick Actions
                </h2>
                <p className="text-sm text-neutral-600">
                  Manage your store efficiently
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Link
                to="/seller/add-product"
                className="group p-5 transition-all duration-200 border rounded-lg border-neutral-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-secondary-100 text-primary-600 group-hover:bg-secondary-200 transition-colors">
                    <FaPlus className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-neutral-900 group-hover:text-primary-600">
                      Add New Product
                    </h3>
                    <p className="text-sm text-neutral-600 group-hover:text-primary-500">
                      Create a new listing
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/seller/manage-products"
                className="group p-5 transition-all duration-200 border rounded-lg border-neutral-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-secondary-100 text-primary-600 group-hover:bg-secondary-200 transition-colors">
                    <FaEdit className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-neutral-900 group-hover:text-primary-600">
                      Manage Products
                    </h3>
                    <p className="text-sm text-neutral-600 group-hover:text-primary-500">
                      Edit existing listings
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/seller/orders?status=pending"
                className="group p-5 transition-all duration-200 border rounded-lg border-neutral-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-secondary-100 text-primary-600 group-hover:bg-secondary-200 transition-colors">
                    <FaTruck className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-neutral-900 group-hover:text-primary-600">
                      Process Orders
                    </h3>
                    <p className="text-sm text-neutral-600 group-hover:text-primary-500">
                      Manage pending orders
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
