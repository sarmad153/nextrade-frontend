import React, { useState, useEffect, useMemo } from "react";
import {
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaCreditCard,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaSortAmountDown,
} from "react-icons/fa";
import API from "../../../api/axiosInstance";
// Components
import BulkActions from "./BulkActions";
import SearchFilters from "./SearchFilters";
import OrderTable from "./OrderTable";
import MobileOrderCard from "./MobileOrderCard";
import OrderViewModal from "./OrderViewModal";
import ConfirmationModal from "./ConfirmationModal";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [mobileView, setMobileView] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    orderId: null,
    newStatus: null,
    message: "",
    isBulk: false,
  });

  // Custom Hook for Orders Management
  const useOrders = () => {
    const fetchOrders = async (params = {}) => {
      setIsLoading(true);
      setError("");
      try {
        const response = await API.get("/orders/admin/orders", { params });
        const ordersData = response.data.orders || response.data;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again.");
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
      try {
        await API.put(`/orders/${orderId}/status`, { status: newStatus });
        return true;
      } catch (error) {
        console.error("Error updating order status:", error);
        throw new Error("Failed to update order status");
      }
    };

    const bulkUpdateOrders = async (orderIds, action) => {
      try {
        await API.post("/orders/admin/orders/bulk-actions", {
          orderIds,
          action: action.toLowerCase(),
        });
        return true;
      } catch (error) {
        console.error("Error performing bulk action:", error);
        throw new Error("Failed to update orders");
      }
    };

    return {
      fetchOrders,
      updateOrderStatus,
      bulkUpdateOrders,
    };
  };

  const { fetchOrders, updateOrderStatus, bulkUpdateOrders } = useOrders();

  // Utility Functions
  const getSafeValue = (value, fallback = "Not provided") => {
    return value || fallback;
  };

  const getCustomerName = (order) => {
    return getSafeValue(order.user?.name, "Unknown Customer");
  };

  const getCustomerEmail = (order) => {
    return getSafeValue(order.user?.email);
  };

  const getCustomerPhone = (order) => {
    return order.shippingAddress?.phone || "Not provided";
  };

  const getShippingAddress = (order) => {
    if (!order.shippingAddress) return "Address not provided";

    const { fullName, address, city, postalCode, phone, email } =
      order.shippingAddress;

    return `${fullName || ""}, ${address || ""}, ${city || ""}${
      postalCode ? `, ${postalCode}` : ""
    }`;
  };

  const getShippingAddressFullName = (order) => {
    return order.shippingAddress?.fullName || "Not provided";
  };

  const getShippingAddressEmail = (order) => {
    return order.shippingAddress?.email || "Not provided";
  };

  const getShippingAddressPhone = (order) => {
    return order.shippingAddress?.phone || "Not provided";
  };

  const getShippingAddressStreet = (order) => {
    return order.shippingAddress?.address || "Not provided";
  };

  const getShippingAddressCity = (order) => {
    return order.shippingAddress?.city || "Not provided";
  };

  const getShippingAddressPostalCode = (order) => {
    return order.shippingAddress?.postalCode || "Not provided";
  };

  const getPaymentMethod = (order) => {
    const method = order.paymentMethod || "Cash on Delivery";
    return method === "Card Payment" ? "credit_card" : "cash";
  };

  const getPaymentStatus = (order) => {
    if (order.status === "Delivered" || order.status === "Shipped") {
      return "paid";
    }
    return "pending";
  };

  const getStatusBadge = (status, inline = false) => {
    const statusConfig = {
      Pending: { color: "bg-yellow-100 text-yellow-800", icon: FaClock },
      Processing: { color: "bg-blue-100 text-blue-800", icon: FaTruck },
      Shipped: { color: "bg-purple-100 text-purple-800", icon: FaTruck },
      Delivered: { color: "bg-green-100 text-green-800", icon: FaCheckCircle },
      Cancelled: { color: "bg-red-100 text-red-800", icon: FaTimesCircle },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${
          config.color
        } ${inline ? "w-fit" : ""}`}
      >
        <IconComponent size={10} />
        {!mobileView && <span>{status}</span>}
      </span>
    );
  };

  const getPaymentStatusBadge = (order) => {
    const paymentStatus = getPaymentStatus(order);
    const statusConfig = {
      paid: { color: "bg-green-100 text-green-800", icon: FaCheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: FaClock },
      failed: { color: "bg-red-100 text-red-800", icon: FaTimesCircle },
      refunded: { color: "bg-gray-100 text-gray-800", icon: FaMoneyBillWave },
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
      >
        {paymentStatus.charAt(0).toUpperCase()}
      </span>
    );
  };

  const getPaymentMethodIcon = (order) => {
    const method = getPaymentMethod(order);
    switch (method) {
      case "credit_card":
        return <FaCreditCard className="text-primary-600" />;
      case "cash":
        return <FaMoneyBillWave className="text-green-500" />;
      default:
        return <FaCreditCard className="text-neutral-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSortIcon = (column) => {
    if (sortBy !== column)
      return <FaSortAmountDown className="ml-1 text-neutral-400" />;
    return sortOrder === "asc" ? (
      <FaArrowUp className="ml-1" />
    ) : (
      <FaArrowDown className="ml-1" />
    );
  };

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setMobileView(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Set loading timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError("Orders loading timeout. Please check your connection.");
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Fetch orders when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      status: selectedStatus !== "all" ? selectedStatus : undefined,
      search: searchTerm || undefined,
      sortBy: sortBy === "date" ? "createdAt" : sortBy,
      sortOrder: sortOrder,
    };
    fetchOrders(params);
  }, [currentPage, selectedStatus, searchTerm, sortBy, sortOrder]);

  // Filter orders locally for immediate UI updates
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items?.some((item) =>
            item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, selectedStatus]);

  // Calculate pagination
  const currentOrders = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredOrders.length / itemsPerPage),
    [filteredOrders, itemsPerPage]
  );

  // Handlers
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const showConfirmModal = (orderId, newStatus, isBulk = false) => {
    const message = isBulk
      ? `Are you sure you want to update ${selectedOrders.length} order(s) to ${newStatus}?`
      : `Are you sure you want to change order status to ${newStatus}?`;

    setConfirmModal({ show: true, orderId, newStatus, message, isBulk });
  };

  const hideConfirmModal = () => {
    setConfirmModal({
      show: false,
      orderId: null,
      newStatus: null,
      message: "",
      isBulk: false,
    });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
      hideConfirmModal();
    } catch (error) {
      hideConfirmModal();
    }
  };

  const handleBulkAction = async () => {
    try {
      await bulkUpdateOrders(selectedOrders, confirmModal.newStatus);
      fetchOrders();
      setSelectedOrders([]);
      setBulkAction("");
      hideConfirmModal();
    } catch (error) {
      hideConfirmModal();
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortBy("date");
    setSortOrder("desc");
    setSelectedOrders([]);
    setCurrentPage(1);
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedOrders((prev) =>
      prev.length === currentOrders.length
        ? []
        : currentOrders.map((order) => order._id)
    );
  };

  const handleConfirm = () => {
    if (confirmModal.isBulk) {
      handleBulkAction();
    } else {
      handleStatusUpdate(confirmModal.orderId, confirmModal.newStatus);
    }
  };

  // Show loading screen until all data is loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light font-inter">
      <div className="p-4 md:p-6">
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-300 rounded-lg">
            {error}
          </div>
        )}

        <BulkActions
          selectedOrders={selectedOrders}
          bulkAction={bulkAction}
          setBulkAction={setBulkAction}
          onApply={() => showConfirmModal(null, bulkAction, true)}
          onCancel={() => setSelectedOrders([])}
        />

        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onClearFilters={clearFilters}
        />

        {/* Orders Table/Cards */}
        <div className="overflow-hidden bg-white border shadow-sm border-neutral-300 rounded-xl">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center md:p-12">
              <FaShoppingCart className="mx-auto text-4xl text-neutral-400" />
              <p className="mt-3 text-neutral-600">No orders found</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            </div>
          ) : mobileView ? (
            <div className="p-4">
              {currentOrders.map((order) => (
                <MobileOrderCard
                  key={order._id}
                  order={order}
                  isSelected={selectedOrders.includes(order._id)}
                  onToggleSelect={toggleOrderSelection}
                  onView={setViewOrder}
                  onStatusUpdate={(id, status) => showConfirmModal(id, status)}
                  getStatusBadge={getStatusBadge}
                  getPaymentStatusBadge={getPaymentStatusBadge}
                  getCustomerName={getCustomerName}
                  getCustomerEmail={getCustomerEmail}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : (
            <>
              <OrderTable
                currentOrders={currentOrders}
                selectedOrders={selectedOrders}
                onToggleSelect={toggleOrderSelection}
                onToggleSelectAll={toggleSelectAll}
                onView={setViewOrder}
                onStatusUpdate={(id, status) => showConfirmModal(id, status)}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                getStatusBadge={getStatusBadge}
                getPaymentStatusBadge={getPaymentStatusBadge}
                getCustomerName={getCustomerName}
                getCustomerEmail={getCustomerEmail}
                formatDate={formatDate}
                getSortIcon={getSortIcon}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-neutral-300 md:px-6 md:py-4">
                  <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <div className="text-sm text-neutral-700">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredOrders.length
                      )}{" "}
                      of {filteredOrders.length} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium bg-white border rounded-lg text-neutral-700 border-neutral-300 hover:bg-background-subtle disabled:opacity-50 md:px-4"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium bg-white border rounded-lg text-neutral-700 border-neutral-300 hover:bg-background-subtle disabled:opacity-50 md:px-4"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order View Modal */}
      {viewOrder && (
        <OrderViewModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onStatusUpdate={(id, status) => showConfirmModal(id, status)}
          getStatusBadge={getStatusBadge}
          getPaymentStatusBadge={getPaymentStatusBadge}
          getPaymentMethodIcon={getPaymentMethodIcon}
          getPaymentMethod={getPaymentMethod}
          getSafeValue={getSafeValue}
          getCustomerName={getCustomerName}
          getCustomerEmail={getCustomerEmail}
          getCustomerPhone={getCustomerPhone}
          getShippingAddress={getShippingAddress}
          getShippingAddressFullName={getShippingAddressFullName}
          getShippingAddressEmail={getShippingAddressEmail}
          getShippingAddressPhone={getShippingAddressPhone}
          getShippingAddressStreet={getShippingAddressStreet}
          getShippingAddressCity={getShippingAddressCity}
          getShippingAddressPostalCode={getShippingAddressPostalCode}
          formatDateTime={formatDateTime}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.show}
        onClose={hideConfirmModal}
        onConfirm={handleConfirm}
        message={confirmModal.message}
      />
    </div>
  );
};

export default ManageOrders;
