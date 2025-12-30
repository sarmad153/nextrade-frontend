import React from "react";
import {
  FaEye,
  FaTruck,
  FaArrowUp,
  FaArrowDown,
  FaSortAmountDown,
} from "react-icons/fa";

const OrderTable = ({
  currentOrders,
  selectedOrders,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onStatusUpdate,
  sortBy,
  sortOrder,
  onSort,
  getStatusBadge,
  getPaymentStatusBadge,
  getCustomerName,
  getCustomerEmail,
  formatDate,
  getSortIcon,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-neutral-300 bg-background-subtle">
          <tr>
            <th className="w-12 px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
              <input
                type="checkbox"
                checked={
                  selectedOrders.length === currentOrders.length &&
                  currentOrders.length > 0
                }
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
              />
            </th>
            <th
              className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer text-neutral-700 md:px-6 md:py-4"
              onClick={() => onSort("id")}
            >
              <div className="flex items-center">
                Order ID
                {getSortIcon("id")}
              </div>
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
              Customer
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
              Items
            </th>
            <th
              className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer text-neutral-700 md:px-6 md:py-4"
              onClick={() => onSort("amount")}
            >
              <div className="flex items-center">
                Amount
                {getSortIcon("amount")}
              </div>
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
              Status
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
              Payment
            </th>
            <th
              className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer text-neutral-700 md:px-6 md:py-4"
              onClick={() => onSort("date")}
            >
              <div className="flex items-center">
                Date
                {getSortIcon("date")}
              </div>
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-300">
          {currentOrders.map((order) => (
            <tr
              key={order._id}
              className="transition hover:bg-background-subtle"
            >
              <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order._id)}
                  onChange={() => onToggleSelect(order._id)}
                  className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                />
              </td>
              <td className="px-4 py-3 text-sm font-medium text-neutral-800 whitespace-nowrap md:px-6 md:py-4">
                ORD-{order._id?.slice(-6)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                <div>
                  <div className="text-sm font-medium text-neutral-800">
                    {getCustomerName(order)}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {getCustomerEmail(order)}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-neutral-800 whitespace-nowrap md:px-6 md:py-4">
                {order.items?.length || 0} item(s)
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-neutral-800 whitespace-nowrap md:px-6 md:py-4">
                Rs {order.totalAmount || 0}
              </td>
              <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                {getStatusBadge(order.status)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                {getPaymentStatusBadge(order)}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap md:px-6 md:py-4">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-4 py-3 text-sm font-medium whitespace-nowrap md:px-6 md:py-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onView(order)}
                    className="p-2 transition rounded-lg text-primary-600 hover:text-primary-800 hover:bg-secondary-200"
                    title="View order details"
                  >
                    <FaEye size={14} />
                  </button>
                  <button
                    onClick={() => onStatusUpdate(order._id, "Processing")}
                    className="p-2 text-green-600 transition rounded-lg hover:text-green-800 hover:bg-green-100"
                    title="Process order"
                  >
                    <FaTruck size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
