import React from "react";
import { FaEye, FaTruck, FaEllipsisV } from "react-icons/fa";

const MobileOrderCard = ({
  order,
  isSelected,
  onToggleSelect,
  onView,
  onStatusUpdate,
  getStatusBadge,
  getPaymentStatusBadge,
  getCustomerName,
  getCustomerEmail,
  formatDate,
}) => {
  return (
    <div className="p-4 mb-4 bg-white border rounded-lg shadow-sm border-neutral-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(order._id)}
            className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
          />
          <span className="font-semibold text-primary-700">
            ORD-{order._id?.slice(-6)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(order.status)}
          <button
            onClick={() => onView(order)}
            className="p-1 rounded text-primary-600 hover:bg-secondary-200"
          >
            <FaEllipsisV size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">Customer:</span>
          <span className="font-medium text-neutral-800">
            {getCustomerName(order)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Items:</span>
          <span className="text-neutral-800">
            {order.items?.length || 0} items
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Amount:</span>
          <span className="font-semibold text-primary-600">
            Rs {order.totalAmount || 0}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Date:</span>
          <span className="text-neutral-600">
            {formatDate(order.createdAt)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Payment:</span>
          {getPaymentStatusBadge(order)}
        </div>
      </div>

      <div className="flex justify-between pt-3 mt-3 border-t border-neutral-200">
        <button
          onClick={() => onView(order)}
          className="flex items-center px-3 py-1 text-sm rounded-lg text-primary-600 bg-secondary-200 hover:bg-secondary-300"
        >
          <FaEye className="mr-1" size={12} />
          View
        </button>
        <button
          onClick={() => onStatusUpdate(order._id, "Processing")}
          className="flex items-center px-3 py-1 text-sm text-green-600 bg-green-100 rounded-lg hover:bg-green-200"
        >
          <FaTruck className="mr-1" size={12} />
          Process
        </button>
      </div>
    </div>
  );
};

export default MobileOrderCard;
