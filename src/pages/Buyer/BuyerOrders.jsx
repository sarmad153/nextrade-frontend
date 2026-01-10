import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBox,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaClock,
  FaPercentage,
  FaTag,
  FaTimes,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaEdit,
  FaStar,
} from "react-icons/fa";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";
import ReviewForm from "./Product screens/ReviewForm";

const BuyerOrders = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = localStorage.getItem("userId");

        if (!user || !userId) {
          toast.error("Please login to view orders");
          setOrders([]);
          setLoading(false);
          return;
        }

        const response = await API.get(`/orders/user/${userId}`);

        if (response.data && Array.isArray(response.data)) {
          const processedOrders = response.data.map((order) => ({
            ...order,
            bulkSavings:
              order.items?.reduce(
                (sum, item) => sum + (item.discountAmount || 0),
                0
              ) || 0,
          }));
          setOrders(processedOrders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Please login again");
        } else if (error.response?.status === 403) {
          toast.error("Access denied");
        } else if (error.response?.status === 404) {
          setOrders([]);
        } else {
          toast.error("Failed to load orders");
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleReviewProduct = (product) => {
    setSelectedProduct({
      id: product._id,
      name: product.name,
    });
    setShowReviewForm(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setSelectedProduct(null);
    toast.success("Thank you for your review!");
  };

  const ReviewButton = ({ product }) => {
    return (
      <button
        onClick={() => handleReviewProduct(product)}
        className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
      >
        <FaEdit className="mr-1" size={12} />
        Write Review
      </button>
    );
  };

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter(
          (order) => order.status.toLowerCase() === activeFilter.toLowerCase()
        );

  const getStatusIcon = (status) => {
    const icons = {
      Delivered: <FaCheckCircle className="text-green-500" />,
      Shipped: <FaShippingFast className="text-blue-500" />,
      Processing: <FaClock className="text-yellow-500" />,
      Pending: <FaClock className="text-yellow-500" />,
      Cancelled: <FaTimesCircle className="text-red-500" />,
    };
    return icons[status] || <FaBox className="text-gray-500" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      Delivered: "bg-green-100 text-green-800",
      Shipped: "bg-blue-100 text-blue-800",
      Processing: "bg-yellow-100 text-yellow-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateBulkSavings = (order) => {
    return order.items.reduce(
      (total, item) => total + (item.discountAmount || 0),
      0
    );
  };

  const BulkPricingBadge = ({ item }) => {
    if (!item.appliedTier) return null;

    const discountText =
      item.appliedTier.discountType === "percentage"
        ? `${item.appliedTier.discountValue}% off`
        : `Rs ${item.appliedTier.discountValue} off`;

    return (
      <div className="flex items-center mt-1">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center whitespace-nowrap">
          <FaTag className="mr-1" />
          Bulk Discount: {discountText}
        </span>
      </div>
    );
  };

  const OrderSavings = ({ order }) => {
    const savings = calculateBulkSavings(order);
    if (!savings || savings === 0) return null;

    const originalTotal = order.totalAmount + savings;
    const savingsPercentage = ((savings / originalTotal) * 100).toFixed(1);

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
        <div className="flex items-center text-green-800 mb-2 sm:mb-0">
          <FaTag className="mr-2" />
          <span className="font-medium">Bulk Purchase Savings</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-700">-Rs {savings}</div>
          <div className="text-xs text-green-600">
            You saved {savingsPercentage}%
          </div>
        </div>
      </div>
    );
  };

  const ItemPriceDisplay = ({ item }) => {
    if (item.appliedTier) {
      const originalPrice =
        (item.product?.price || item.unitPrice) * item.quantity;
      return (
        <div className="text-right min-w-[100px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end sm:space-x-2">
            <span className="text-sm text-gray-500 line-through">
              Rs {originalPrice}
            </span>
            <span className="font-semibold text-green-600">
              Rs {parseFloat(item.finalPrice).toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            Saved: Rs {item.discountAmount}
          </div>
        </div>
      );
    }

    return (
      <div className="text-right min-w-[80px]">
        <span className="font-semibold text-neutral-800">
          Rs {item.finalPrice}
        </span>
      </div>
    );
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const handleBuyAgain = async (order) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = localStorage.getItem("userId");
      if (!user) {
        toast.error("Please login to add items to cart");
        return;
      }

      for (const item of order.items) {
        await API.post("/cart", {
          userId: userId,
          productId: item.product._id,
          quantity: item.quantity,
        });
      }
      toast.success("Items added to cart!");
    } catch (error) {
      toast.error("Failed to add items to cart");
    }
  };

  const getImageUrl = (imageData) => {
    if (!imageData) {
      return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
    }

    if (typeof imageData === "string") {
      return imageData.startsWith("http")
        ? imageData
        : `https://nextrade-backend-production-a486.up.railway.app/${imageData}`;
    }

    if (typeof imageData === "object" && imageData !== null) {
      const url =
        imageData.url ||
        imageData.secure_url ||
        imageData.path ||
        imageData.src;
      if (url && typeof url === "string") {
        return url.startsWith("http")
          ? url
          : `https://nextrade-backend-production-a486.up.railway.app/${url}`;
      }
    }

    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-neutral-800 truncate">
                Order Details
              </h2>
              <p className="text-neutral-600 text-sm truncate">
                Order #{order._id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
            >
              <FaTimes className="text-neutral-500" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-2 flex items-center">
                    <FaUser className="mr-2" />
                    Customer Information
                  </h3>
                  <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-neutral-800 break-words">
                      {order.shippingAddress?.fullName || "N/A"}
                    </p>
                    <p className="text-neutral-600 text-sm mt-1 break-words">
                      {order.user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-800 mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    Shipping Address
                  </h3>
                  <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-neutral-800 break-words">
                      {order.shippingAddress?.address || "N/A"}
                    </p>
                    <p className="text-neutral-600 break-words">
                      {order.shippingAddress?.city || "N/A"}
                      {order.shippingAddress?.postalCode &&
                        `, ${order.shippingAddress.postalCode}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-2 flex items-center">
                    <FaPhone className="mr-2" />
                    Contact Information
                  </h3>
                  <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-neutral-800 break-words">
                      Phone: {order.shippingAddress?.phone || "N/A"}
                    </p>
                    <p className="text-neutral-800 mt-1 break-words">
                      Email: {order.shippingAddress?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-800 mb-2">
                    Order Information
                  </h3>
                  <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-neutral-600 text-sm sm:text-base">
                        Order Date:
                      </span>
                      <span className="text-neutral-800 text-sm sm:text-base">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-neutral-600 text-sm sm:text-base">
                        Status:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )} mt-1 sm:mt-0`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-neutral-600 text-sm sm:text-base">
                        Payment Method:
                      </span>
                      <span className="text-neutral-800 text-sm sm:text-base">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-800 mb-4">
                Order Items ({order.items?.length || 0})
                {order.status === "Delivered" && (
                  <span className="ml-2 text-sm text-green-600 font-normal">
                    • You can now review these products
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-neutral-50 rounded-lg gap-3"
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="relative w-16 h-16 bg-neutral-200 rounded flex items-center justify-center flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <img
                            src={getImageUrl(item.product?.images?.[0])}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-neutral-500 text-xs">IMG</span>
                        )}
                        {item.appliedTier && (
                          <div className="absolute -top-1 -right-1">
                            <div className="bg-green-500 text-white rounded-full p-1">
                              <FaPercentage className="text-xs" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-800 truncate">
                          {item.product?.name || "Product"}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-sm text-neutral-600">
                            Quantity: {item.quantity}
                          </p>
                          {item.appliedTier && (
                            <p className="text-xs text-blue-600">
                              {item.appliedTier.minQuantity}+ units tier
                            </p>
                          )}
                        </div>
                        <BulkPricingBadge item={item} />

                        {order.status === "Delivered" && (
                          <div className="mt-2">
                            <ReviewButton product={item.product} />
                          </div>
                        )}
                      </div>
                    </div>
                    <ItemPriceDisplay item={item} />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="mb-3 sm:mb-0">
                  <p className="text-base sm:text-lg font-semibold text-neutral-800">
                    Order Total
                  </p>
                  {calculateBulkSavings(order) > 0 && (
                    <p className="text-green-600 text-sm mt-1">
                      You saved Rs {calculateBulkSavings(order)} with bulk
                      discounts
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold text-primary-600">
                    Rs {order.totalAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-neutral-200">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors order-2 sm:order-1"
            >
              Close
            </button>
            {order.status === "Delivered" && (
              <button
                onClick={() => {
                  handleBuyAgain(order);
                  onClose();
                }}
                className="px-4 sm:px-6 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors order-1 sm:order-2"
              >
                Buy Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const OrderItemWithReview = ({ item, orderStatus }) => {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="relative w-12 h-12 bg-neutral-200 rounded flex items-center justify-center flex-shrink-0">
            {item.product?.images?.[0] ? (
              <img
                src={getImageUrl(item.product?.images?.[0])}
                alt={item.product.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <span className="text-neutral-500 text-xs">IMG</span>
            )}
            {item.appliedTier && (
              <div className="absolute -top-1 -right-1">
                <div className="bg-green-500 text-white rounded-full p-1">
                  <FaPercentage className="text-xs" />
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 mb-1">
                  <h4 className="font-medium text-neutral-800 truncate">
                    {item.product?.name || "Product"}
                  </h4>
                  {item.appliedTier && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                      Bulk Purchase
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-sm text-neutral-600">
                    Quantity: {item.quantity}
                  </p>
                  {item.appliedTier && (
                    <p className="text-xs text-blue-600">
                      {item.appliedTier.minQuantity}+ units tier
                    </p>
                  )}
                </div>
                <BulkPricingBadge item={item} />
              </div>

              {orderStatus === "Delivered" && (
                <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                  <ReviewButton product={item.product} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="self-end sm:self-center mt-2 sm:mt-0">
          <ItemPriceDisplay item={item} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">
            My Orders
          </h1>
          <p className="mt-2 text-neutral-600 text-sm sm:text-base">
            View and track your order history
          </p>
        </div>

        {orders.some((order) => calculateBulkSavings(order) > 0) && (
          <div className="p-3 sm:p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center">
                <FaTag className="text-blue-600 mr-3 text-lg sm:text-xl mt-1 sm:mt-0 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800 text-sm sm:text-base">
                    Smart Bulk Shopping
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-700">
                    Total savings from bulk purchases: Rs{" "}
                    {orders.reduce(
                      (sum, order) => sum + calculateBulkSavings(order),
                      0
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">
                  {
                    orders.filter((order) => calculateBulkSavings(order) > 0)
                      .length
                  }{" "}
                  orders with bulk discounts
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              "all",
              "pending",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize whitespace-nowrap flex-shrink-0 ${
                  activeFilter === filter
                    ? "bg-primary-600 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {filter === "all" ? "All Orders" : filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow">
              <FaBox className="mx-auto text-3xl sm:text-4xl text-neutral-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-2">
                {orders.length === 0
                  ? "No orders yet"
                  : "No orders match this filter"}
              </h3>
              <p className="text-neutral-600 text-sm sm:text-base mb-4 px-4">
                {orders.length === 0
                  ? "You haven't placed any orders yet."
                  : "Try selecting a different filter."}
              </p>
              {orders.length === 0 && (
                <Link
                  to="/products"
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
                >
                  Start Shopping
                </Link>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200">
                  <div className="flex flex-col justify-between md:flex-row md:items-center">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-neutral-800 text-sm sm:text-base truncate">
                          Order #{order._id}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-600 truncate">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 md:mt-0 md:space-x-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )} whitespace-nowrap`}
                      >
                        {order.status}
                      </span>
                      <div className="text-right ml-4">
                        <div className="text-base sm:text-lg font-bold text-primary-600">
                          Rs {order.totalAmount}
                        </div>
                        {calculateBulkSavings(order) > 0 && (
                          <div className="text-xs text-green-600">
                            Saved Rs {calculateBulkSavings(order)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 md:p-6">
                  <OrderSavings order={order} />

                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <OrderItemWithReview
                        key={index}
                        item={item}
                        orderStatus={order.status}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col justify-between pt-4 mt-4 border-t border-neutral-200 gap-4 md:flex-row md:items-center">
                    <div className="text-xs sm:text-sm text-neutral-600 space-y-1">
                      <p className="break-words">
                        Shipping:{" "}
                        {order.shippingAddress?.address ||
                          "Address not available"}
                      </p>
                      <p>Payment: {order.paymentMethod}</p>
                      {calculateBulkSavings(order) > 0 && (
                        <p className="text-green-600">
                          <FaTag className="inline mr-1" />
                          Bulk discount applied on this order
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="flex items-center justify-center px-3 sm:px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-blue-50 hover:scale-105 transition-all text-sm sm:text-base"
                      >
                        <FaEye className="mr-2" />
                        View Details
                      </button>
                      {order.status === "Delivered" && (
                        <button
                          onClick={() => handleBuyAgain(order)}
                          className="px-3 sm:px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
                        >
                          Buy Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredOrders.length > 0 && (
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              to="/products"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-primary-600 hover:text-primary-700 text-sm sm:text-base"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {showDetailsModal && (
          <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />
        )}

        {showReviewForm && selectedProduct && (
          <ReviewForm
            productId={selectedProduct.id}
            productName={selectedProduct.name}
            onSuccess={handleReviewSuccess}
            onCancel={() => {
              setShowReviewForm(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BuyerOrders;
