import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBox,
  FaMoneyBillWave,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaFilter,
  FaEye,
  FaTimes,
  FaEdit,
  FaSpinner,
  FaUser,
  FaMapMarkerAlt,
  FaUserClock,
  FaExclamationTriangle,
  FaShoppingCart,
} from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";

const SellerOrders = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const statusFromUrl = queryParams.get("status");

  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingUserStatus, setCheckingUserStatus] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    statusFromUrl === "pending" ? "Pending" : "All"
  );
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrderModal, setViewOrderModal] = useState(false);
  const [editOrderModal, setEditOrderModal] = useState(false);
  const [sellerProducts, setSellerProducts] = useState([]); // To store seller's product IDs

  // Stats state - ADDING REVENUE FROM DASHBOARD ENDPOINT
  const [revenueFromDashboard, setRevenueFromDashboard] = useState(0);

  // Keep original stats for other cards
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });

  // Check user role and profile status on component mount
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const currentRole = user?.role;
        setUserRole(currentRole);

        // Fetch profile data to get profile completion status
        if (["seller_pending", "seller_approved"].includes(currentRole)) {
          try {
            const profileResponse = await API.get("/profile/me");
            const profileData = profileResponse.data;
            setProfileComplete(profileData.isProfileComplete || false);
          } catch (profileError) {
            console.error("Profile fetch error:", profileError);
          }
        }
      } catch (error) {
        console.error("User status check error:", error);
      } finally {
        setCheckingUserStatus(false);
      }
    };

    checkUserStatus();
  }, []);

  // Fetch seller's products to know which products belong to this seller
  const fetchSellerProducts = async () => {
    try {
      const response = await API.get("/products/seller/products");
      const products = response.data.products || response.data || [];
      const productIds = products.map((product) => product._id);
      setSellerProducts(productIds);
      return productIds;
    } catch (error) {
      console.error("Failed to fetch seller products:", error);
      return [];
    }
  };

  // Filter order items to only show seller's products
  const filterSellerItems = (orderItems, sellerProductIds) => {
    if (!orderItems || !Array.isArray(orderItems)) return [];
    return orderItems.filter(
      (item) =>
        item.product && sellerProductIds.includes(item.product._id.toString())
    );
  };

  // Calculate seller's total from filtered items
  const calculateSellerTotal = (filteredItems) => {
    return filteredItems.reduce((sum, item) => sum + (item.finalPrice || 0), 0);
  };

  // Calculate seller's total quantity from filtered items
  const calculateSellerQuantity = (filteredItems) => {
    return filteredItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Get seller's product IDs first
      const sellerProductIds = await fetchSellerProducts();

      if (sellerProductIds.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const response = await API.get("/orders/seller/orders");
      const ordersData = Array.isArray(response.data)
        ? response.data
        : response.data.orders || [];

      // Transform and filter orders
      const transformedOrders = ordersData
        .map((order) => {
          // Filter items to only show seller's products
          const sellerItems = filterSellerItems(order.items, sellerProductIds);

          // If no seller items, skip this order
          if (sellerItems.length === 0) return null;

          const sellerTotal = calculateSellerTotal(sellerItems);
          const sellerQuantity = calculateSellerQuantity(sellerItems);

          // Get product names for display
          const productNames = sellerItems.map(
            (item) => item.product?.name || "Unknown Product"
          );
          const primaryProduct = productNames[0] || "Multiple Products";
          const additionalProducts =
            productNames.length > 1 ? ` + ${productNames.length - 1} more` : "";

          return {
            id: order._id,
            orderId: order._id,
            customer: order.user?.name || "Unknown Customer",
            customerEmail: order.user?.email || "No email",
            customerPhone: order.shippingAddress?.phone || "No phone",
            // Show first product + count of additional products
            product:
              productNames.length > 1
                ? `${primaryProduct}${additionalProducts}`
                : primaryProduct,
            date: new Date(order.createdAt).toLocaleDateString(),
            status: order.status,
            // Show seller's total quantity and amount
            quantity: sellerQuantity,
            total: sellerTotal,
            payment: order.paymentMethod || "Cash on Delivery",
            // Format shipping address
            shippingAddress: order.shippingAddress
              ? `${order.shippingAddress.address}, ${
                  order.shippingAddress.city
                }${
                  order.shippingAddress.postalCode
                    ? `, ${order.shippingAddress.postalCode}`
                    : ""
                }`
              : "Address not provided",
            // Keep original data and filtered items
            sellerItems: sellerItems,
            allItems: order.items || [],
            shippingAddressObj: order.shippingAddress,
            originalData: order,
          };
        })
        .filter((order) => order !== null);

      setOrders(transformedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch revenue from dashboard endpoint
  const fetchDashboardRevenue = async () => {
    try {
      if (userRole === "seller_approved" && profileComplete) {
        const statsResponse = await API.get("/admin/seller/stats");
        if (
          statsResponse.data &&
          statsResponse.data.totalRevenue !== undefined
        ) {
          setRevenueFromDashboard(statsResponse.data.totalRevenue);
        }
      }
    } catch (error) {
      console.error("Failed to fetch revenue from dashboard endpoint:", error);
      // Keep the calculated revenue as fallback
    }
  };

  // Fetch seller stats (excluding revenue calculation)
  const fetchSellerStats = async () => {
    try {
      if (userRole === "seller_approved" && profileComplete) {
        // Calculate stats from orders (EXCLUDING REVENUE)
        const sellerProductIds =
          sellerProducts.length > 0
            ? sellerProducts
            : await fetchSellerProducts();

        const allOrders = await API.get("/orders/seller/orders");
        const ordersData = Array.isArray(allOrders.data)
          ? allOrders.data
          : allOrders.data.orders || [];

        let pendingOrdersCount = 0;
        let totalOrdersCount = 0;

        ordersData.forEach((order) => {
          const sellerItems = filterSellerItems(order.items, sellerProductIds);
          if (sellerItems.length > 0) {
            totalOrdersCount++;
            if (order.status === "Pending") {
              pendingOrdersCount++;
            }
          }
        });

        setStats({
          totalOrders: totalOrdersCount,
          totalProducts: sellerProductIds.length,
          pendingOrders: pendingOrdersCount,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await API.put(`/orders/${orderId}/status`, { status: newStatus });

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Refresh stats
      await fetchSellerStats();

      toast.success(`Order status updated to ${newStatus}`);
      setViewOrderModal(false);
      setEditOrderModal(false);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle form changes for editing
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "shippingAddress") {
      setSelectedOrder((prev) => ({
        ...prev,
        shippingAddress: value,
      }));
    } else {
      setSelectedOrder((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (
      !checkingUserStatus &&
      userRole === "seller_approved" &&
      profileComplete
    ) {
      fetchOrders();
      fetchSellerStats();
      fetchDashboardRevenue(); // ADD THIS LINE
    } else if (!checkingUserStatus) {
      setLoading(false);
    }
  }, [checkingUserStatus, userRole, profileComplete]);

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status counts for stats
  const statusCounts = {
    Pending: orders.filter((order) => order.status === "Pending").length,
    Processing: orders.filter((order) => order.status === "Processing").length,
    Shipped: orders.filter((order) => order.status === "Shipped").length,
    Delivered: orders.filter((order) => order.status === "Delivered").length,
    Cancelled: orders.filter((order) => order.status === "Cancelled").length,
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setViewOrderModal(true);
  };

  // Edit order details
  const editOrderDetails = (order) => {
    setSelectedOrder({ ...order });
    setEditOrderModal(true);
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-300 text-neutral-800";
    }
  };

  // Payment status color
  const getPaymentColor = (status) => {
    switch (status) {
      case "Card Payment":
        return "bg-green-100 text-green-800";
      case "Cash on Delivery":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-neutral-300 text-neutral-800";
    }
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="mr-1" />;
      case "Processing":
        return <FaBox className="mr-1" />;
      case "Shipped":
        return <FaTruck className="mr-1" />;
      case "Delivered":
        return <FaCheckCircle className="mr-1" />;
      case "Cancelled":
        return <FaTimes className="mr-1" />;
      default:
        return <FaBox className="mr-1" />;
    }
  };

  if (checkingUserStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Show pending approval message
  if (userRole === "seller_pending") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-md">
          <FaUserClock className="mx-auto mb-4 text-5xl text-blue-500" />
          <h2 className="mb-3 text-2xl font-bold text-neutral-800">
            Approval Pending
          </h2>
          <p className="mb-4 text-neutral-600">
            Your seller application is under review. You need approved seller
            status to manage orders.
          </p>
          <div className="p-4 mb-4 bg-blue-50 rounded-lg">
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
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            {profileComplete
              ? "View Business Profile"
              : "Complete Business Profile"}
          </Link>
        </div>
      </div>
    );
  }

  // Show profile incomplete message
  if (userRole === "seller_approved" && !profileComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-md">
          <FaExclamationTriangle className="mx-auto mb-4 text-5xl text-orange-500" />
          <h2 className="mb-3 text-2xl font-bold text-neutral-800">
            Complete Your Business Profile
          </h2>
          <p className="mb-4 text-neutral-600">
            Your seller account is approved! Please complete your business
            profile to start managing orders and access all seller features.
          </p>
          <div className="p-4 mb-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              <strong>Required:</strong> Business details, CNIC verification,
              and contact information
            </p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Complete Business Profile
          </Link>
        </div>
      </div>
    );
  }

  // Show access denied
  if (userRole !== "seller_approved") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-md">
          <FaExclamationTriangle className="mx-auto mb-4 text-5xl text-red-500" />
          <h2 className="mb-3 text-2xl font-bold text-neutral-800">
            Access Denied
          </h2>
          <p className="mb-4 text-neutral-600">
            You need approved seller privileges to manage orders.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-800">
            Order Management
          </h1>
          <p className="text-neutral-600">
            Manage and track orders for your products
          </p>
        </div>

        {/* Stats Cards - ONLY REVENUE CARD CHANGED */}
        <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 md:gap-4 md:mb-8">
          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full text-primary-600 bg-secondary-200 md:p-3">
                <FaBox className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Total Orders
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-yellow-600 bg-yellow-100 rounded-full md:p-3">
                <FaClock className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Pending
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {statusCounts.Pending}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-blue-600 bg-blue-100 rounded-full md:p-3">
                <FaShoppingCart className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  My Products
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {stats.totalProducts}
                </p>
              </div>
            </div>
          </div>

          {/* REVENUE CARD - USING DASHBOARD ENDPOINT */}
          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-green-600 bg-green-100 rounded-full md:p-3">
                <FaMoneyBillWave className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Revenue
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  Rs {revenueFromDashboard?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The rest of your component remains exactly the same... */}
        {/* Mobile Filter Section, Controls, Orders Table, Modals, etc. */}

        {/* Controls - Desktop */}
        <div className="hidden p-4 mb-6 bg-white rounded-lg shadow md:p-6 md:block">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders by ID, customer, email, or product..."
                  className="w-full py-2 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaFilter className="text-neutral-400" />
                </div>
                <select
                  className="py-2 pl-10 pr-8 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6"
                  >
                    Order Details
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-neutral-500 md:px-6"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg">
                          <FaBox className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-primary-600 truncate">
                            #{order.id.slice(-8).toUpperCase()}
                          </div>
                          <div className="text-sm text-neutral-900 line-clamp-1">
                            {order.product}
                          </div>
                          <div className="text-xs text-neutral-500 md:hidden">
                            {order.customer} • {order.date}
                          </div>
                          <div className="text-xs text-neutral-500 md:hidden">
                            Rs {order.total.toFixed(2)} • Qty: {order.quantity}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="flex items-center">
                        <FaUser className="flex-shrink-0 w-4 h-4 mr-2 text-neutral-400" />
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {order.customer}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {order.customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm text-neutral-500">
                        {order.date}
                      </div>
                    </td>

                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm font-medium text-neutral-900">
                        Rs {order.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {order.quantity} items
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap md:px-6">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentColor(
                            order.payment
                          )}`}
                        >
                          {order.payment}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-right whitespace-nowrap md:px-6">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="p-2 text-primary-600 rounded-lg hover:bg-secondary-200 transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => editOrderDetails(order)}
                          className="p-2 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Edit Order"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="py-12 text-center">
              <FaBox className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {orders.length === 0 ? "No orders yet" : "No matching orders"}
              </h3>
              <p className="text-neutral-600 max-w-md mx-auto mb-4">
                {orders.length === 0
                  ? "Orders will appear here once customers start purchasing your products."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {orders.length === 0 && (
                <Link
                  to="/seller/manage-products"
                  className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  Manage Your Products
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {viewOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-800">
                      Order #{selectedOrder.id.slice(-8).toUpperCase()}
                    </h2>
                    <p className="text-neutral-600">
                      Placed on {selectedOrder.date}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewOrderModal(false)}
                    className="p-2 text-neutral-400 hover:text-neutral-500 rounded-lg hover:bg-neutral-100"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Customer & Order Info */}
                <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                  <div className="p-4 rounded-lg bg-neutral-50">
                    <h3 className="flex items-center mb-3 text-lg font-semibold text-neutral-800">
                      <FaUser className="mr-2 text-primary-600" />
                      Customer Information
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <strong>Name:</strong> {selectedOrder.customer}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedOrder.customerEmail}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedOrder.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-50">
                    <h3 className="flex items-center mb-3 text-lg font-semibold text-neutral-800">
                      <FaBox className="mr-2 text-primary-600" />
                      Order Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <strong>Status:</strong>
                        <span
                          className={`ml-2 px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <strong>Payment:</strong>
                        <span
                          className={`ml-2 px-2 py-1 text-sm font-semibold rounded-full ${getPaymentColor(
                            selectedOrder.payment
                          )}`}
                        >
                          {selectedOrder.payment}
                        </span>
                      </div>
                      <p>
                        <strong>Your Items:</strong> {selectedOrder.quantity}
                      </p>
                      <p>
                        <strong>Your Total:</strong> Rs{" "}
                        {selectedOrder.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="p-4 mb-6 rounded-lg bg-neutral-50">
                  <h3 className="flex items-center mb-3 text-lg font-semibold text-neutral-800">
                    <FaMapMarkerAlt className="mr-2 text-primary-600" />
                    Shipping Address
                  </h3>
                  {selectedOrder.shippingAddressObj ? (
                    <div className="space-y-2 text-neutral-700">
                      <p>
                        <strong>Address:</strong>{" "}
                        {selectedOrder.shippingAddressObj.address ||
                          "Not provided"}
                      </p>
                      <p>
                        <strong>City:</strong>{" "}
                        {selectedOrder.shippingAddressObj.city ||
                          "Not provided"}
                      </p>
                      {selectedOrder.shippingAddressObj.postalCode && (
                        <p>
                          <strong>Postal Code:</strong>{" "}
                          {selectedOrder.shippingAddressObj.postalCode}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-neutral-700">
                      {selectedOrder.shippingAddress}
                    </p>
                  )}
                </div>

                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                    Your Products in this Order (
                    {selectedOrder.sellerItems.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.sellerItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg bg-secondary-200 border-primary-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">
                            {item.product?.name || "Unknown Product"}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <p className="text-sm text-neutral-600">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm text-neutral-600">
                              Unit Price: Rs{" "}
                              {item.unitPrice?.toFixed(2) || "0.00"}
                            </p>
                            {item.appliedTier && (
                              <p className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                                Bulk Discount Applied
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900">
                            Rs {item.finalPrice?.toFixed(2) || "0.00"}
                          </p>
                          {item.discountAmount > 0 && (
                            <p className="text-xs text-green-700">
                              Saved: Rs {item.discountAmount?.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-3 mt-3 border-t border-neutral-200">
                      <p className="text-lg font-bold text-neutral-900">
                        Your Total Amount
                      </p>
                      <p className="text-lg font-bold text-primary-600">
                        Rs {selectedOrder.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setViewOrderModal(false);
                      editOrderDetails(selectedOrder);
                    }}
                    className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    <FaEdit className="mr-2" /> Edit Order
                  </button>

                  {/* Status Update Buttons */}
                  {selectedOrder.status === "Pending" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(selectedOrder.orderId, "Processing")
                      }
                      disabled={updatingStatus === selectedOrder.id}
                      className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updatingStatus === selectedOrder.id ? (
                        <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FaBox className="mr-2" />
                      )}
                      {updatingStatus === selectedOrder.id
                        ? "Updating..."
                        : "Start Processing"}
                    </button>
                  )}

                  {selectedOrder.status === "Processing" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(selectedOrder.orderId, "Shipped")
                      }
                      disabled={updatingStatus === selectedOrder.id}
                      className="flex items-center px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {updatingStatus === selectedOrder.id ? (
                        <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FaTruck className="mr-2" />
                      )}
                      {updatingStatus === selectedOrder.id
                        ? "Updating..."
                        : "Mark as Shipped"}
                    </button>
                  )}

                  {selectedOrder.status === "Shipped" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(selectedOrder.orderId, "Delivered")
                      }
                      disabled={updatingStatus === selectedOrder.id}
                      className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingStatus === selectedOrder.id ? (
                        <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FaCheckCircle className="mr-2" />
                      )}
                      {updatingStatus === selectedOrder.id
                        ? "Updating..."
                        : "Mark as Delivered"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-800">
                    Edit Order #{selectedOrder.id.slice(-8).toUpperCase()}
                  </h2>
                  <button
                    onClick={() => setEditOrderModal(false)}
                    className="p-2 text-neutral-400 hover:text-neutral-500 rounded-lg hover:bg-neutral-100"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateOrderStatus(
                      selectedOrder.orderId,
                      selectedOrder.status
                    );
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 md:gap-6">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-neutral-700">
                        Order Status
                      </label>
                      <select
                        name="status"
                        className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        value={selectedOrder.status}
                        onChange={handleEditChange}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-neutral-700">
                        Payment Method
                      </label>
                      <select
                        name="payment"
                        className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        value={selectedOrder.payment}
                        onChange={handleEditChange}
                        disabled={selectedOrder.payment === "Card Payment"}
                      >
                        <option value="Cash on Delivery">
                          Cash on Delivery
                        </option>
                        <option value="Card Payment" disabled>
                          Card Payment (Coming Soon)
                        </option>
                      </select>
                      {selectedOrder.payment === "Card Payment" && (
                        <p className="mt-1 text-xs text-orange-600">
                          Note: Online payments are coming soon.
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-neutral-700">
                        Shipping Address (Read-only)
                      </label>
                      <textarea
                        name="shippingAddress"
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-neutral-50"
                        value={selectedOrder.shippingAddress}
                        onChange={handleEditChange}
                        readOnly
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Shipping address cannot be modified from order
                        management.
                      </p>
                    </div>

                    {/* Show seller's products in this order */}
                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-neutral-700">
                        Your Products in this Order
                      </label>
                      <div className="space-y-2">
                        {selectedOrder.sellerItems?.map((item, index) => (
                          <div
                            key={index}
                            className="p-2 bg-neutral-50 rounded"
                          >
                            <p className="font-medium">{item.product?.name}</p>
                            <div className="flex justify-between text-sm text-neutral-600">
                              <span>Qty: {item.quantity}</span>
                              <span>Rs {item.finalPrice?.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditOrderModal(false)}
                      className="px-6 py-2 border rounded-lg text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                    >
                      Update Status
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
