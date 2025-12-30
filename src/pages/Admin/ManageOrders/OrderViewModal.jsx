import React from "react";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBox,
  FaStore,
  FaExternalLinkAlt,
} from "react-icons/fa";

const OrderViewModal = ({
  order,
  onClose,
  onStatusUpdate,
  getStatusBadge,
  getPaymentStatusBadge,
  getPaymentMethodIcon,
  getPaymentMethod,
  getSafeValue,
  getCustomerName,
  getCustomerEmail,
  getCustomerPhone,
  getShippingAddress,
  formatDateTime,
}) => {
  if (!order) return null;

  // Extract seller information from order items
  const getSellersFromOrder = () => {
    const sellers = new Map();

    order.items?.forEach((item) => {
      if (item.product?.seller) {
        const seller = item.product.seller;
        if (!sellers.has(seller._id)) {
          sellers.set(seller._id, {
            id: seller._id,
            name: seller.name || "Unknown Seller",
            email: seller.email || "No email",
            storeName: seller.storeName || seller.name || "Unknown Store",
            items: [],
          });
        }
        sellers.get(seller._id).items.push({
          name: item.product?.name || "Unknown Product",
          quantity: item.quantity || 1,
          price: item.product?.price || 0,
          total: (item.product?.price || 0) * (item.quantity || 1),
        });
      }
    });

    return Array.from(sellers.values());
  };

  const sellers = getSellersFromOrder();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000c7]">
      <div className="bg-background-light rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-neutral-300">
        <div className="flex items-center justify-between p-4 border-b md:p-6 border-neutral-300 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold md:text-xl text-neutral-800">
            Order Details - ORD-{order._id?.slice(-6)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 transition text-neutral-500 hover:text-neutral-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Order Information & Customer */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Order Information */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-neutral-800">
                    Order Information
                  </h3>
                  <div className="p-4 rounded-lg bg-background-subtle">
                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium text-neutral-700">
                          Order ID:
                        </span>
                        <p className="text-neutral-800">
                          ORD-{order._id?.slice(-6)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">
                          Order Date:
                        </span>
                        <p className="text-neutral-800">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">
                          Status:
                        </span>
                        <div className="mt-1 w-fit">
                          {getStatusBadge(order.status, true)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">
                          Payment:
                        </span>
                        <div className="mt-1 w-fit">
                          {getPaymentStatusBadge(order)}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-neutral-700">
                          Payment Method:
                        </span>
                        <div className="flex items-center mt-1 space-x-2">
                          {getPaymentMethodIcon(order)}
                          <span className="capitalize text-neutral-800">
                            {getPaymentMethod(order).replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-neutral-800">
                    Customer Information
                  </h3>
                  <div className="p-4 rounded-lg bg-background-subtle">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-neutral-500" />
                        <span className="font-medium text-neutral-800">
                          {order.shippingAddress?.fullName || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="text-neutral-500" />
                        <span className="text-neutral-700">
                          {order.shippingAddress?.email || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaPhone className="text-neutral-500" />
                        <span className="text-neutral-700">
                          {order.shippingAddress?.phone || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-neutral-800">
                    Shipping Address
                  </h3>
                  <div className="p-4 rounded-lg bg-background-subtle">
                    <div className="flex items-start space-x-2">
                      <FaMapMarkerAlt className="mt-1 text-neutral-500" />
                      <div className="text-sm text-neutral-700 space-y-1">
                        <p>
                          <strong>Address:</strong>{" "}
                          {order.shippingAddress?.address || "Not provided"}
                        </p>
                        <p>
                          <strong>City:</strong>{" "}
                          {order.shippingAddress?.city || "Not provided"}
                        </p>
                        {order.shippingAddress?.postalCode && (
                          <p>
                            <strong>Postal Code:</strong>{" "}
                            {order.shippingAddress.postalCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items by Seller */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-neutral-800">
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {sellers.map((seller, sellerIndex) => (
                      <div
                        key={seller.id}
                        className="p-4 rounded-lg bg-background-subtle"
                      >
                        {/* Seller Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-300">
                          <div className="flex items-center space-x-2">
                            <FaStore className="text-blue-600" />
                            <div>
                              <h4 className="font-medium text-neutral-800">
                                {seller.storeName}
                              </h4>
                              <p className="text-xs text-neutral-600">
                                by {seller.name}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              console.log("View seller profile:", seller.id);
                            }}
                            className="flex items-center px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                          >
                            <FaExternalLinkAlt className="mr-1" size={10} />
                            View Seller
                          </button>
                        </div>

                        {/* Seller Items */}
                        <div className="space-y-2">
                          {seller.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center justify-between p-2 bg-white rounded"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-white rounded">
                                  <FaBox
                                    className="text-neutral-400"
                                    size={14}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-neutral-800">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-neutral-600">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-neutral-800">
                                  Rs {item.price}
                                </p>
                                <p className="text-xs text-neutral-600">
                                  Total: Rs {item.total}
                                </p>
                              </div>
                            </div>
                          ))}

                          {/* Seller Subtotal */}
                          <div className="flex justify-between pt-2 mt-2 border-t border-neutral-300">
                            <span className="text-sm font-medium text-neutral-700">
                              Seller Subtotal:
                            </span>
                            <span className="text-sm font-semibold text-blue-600">
                              Rs{" "}
                              {seller.items.reduce(
                                (sum, item) => sum + item.total,
                                0
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="p-4 mt-4 border rounded-lg bg-background-subtle border-neutral-300">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span className="text-neutral-700">Order Total:</span>
                      <span className="text-primary-600">
                        Rs {order.totalAmount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Status Update */}
            <div className="space-y-6">
              {/* Status Update */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-neutral-800">
                  Update Status
                </h3>
                <div className="space-y-2">
                  {[
                    "Pending",
                    "Processing",
                    "Shipped",
                    "Delivered",
                    "Cancelled",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => onStatusUpdate(order._id, status)}
                      disabled={order.status === status}
                      className={`w-full p-3 text-sm font-medium rounded-lg transition ${
                        order.status === status
                          ? "bg-primary-600 text-white"
                          : "bg-background-subtle text-neutral-700 hover:bg-secondary-200"
                      } disabled:opacity-50`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 rounded-lg bg-background-subtle">
                <h4 className="mb-3 text-sm font-medium text-neutral-800">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => onStatusUpdate(order._id, "Processing")}
                    className="w-full px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Mark as Processing
                  </button>
                  <button
                    onClick={() => onStatusUpdate(order._id, "Shipped")}
                    className="w-full px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Mark as Shipped
                  </button>
                  <button
                    onClick={() => onStatusUpdate(order._id, "Delivered")}
                    className="w-full px-3 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    Mark as Delivered
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-lg bg-background-subtle">
                <h4 className="mb-3 text-sm font-medium text-neutral-800">
                  Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Items:</span>
                    <span className="text-neutral-800">
                      {order.items?.length || 0} items
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Sellers:</span>
                    <span className="text-neutral-800">
                      {sellers.length} seller(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Order Date:</span>
                    <span className="text-neutral-800">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-neutral-300">
                    <div className="flex justify-between font-semibold">
                      <span className="text-neutral-700">Total:</span>
                      <span className="text-primary-600">
                        Rs {order.totalAmount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewModal;
