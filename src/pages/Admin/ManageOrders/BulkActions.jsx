import React from "react";
const BulkActions = ({
  selectedOrders,
  bulkAction,
  setBulkAction,
  onApply,
  onCancel,
}) => {
  if (selectedOrders.length === 0) return null;

  return (
    <div className="p-4 mb-6 border border-primary-600 bg-secondary-200 rounded-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <span className="font-medium text-primary-700">
            {selectedOrders.length} order(s) selected
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 md:px-4"
          >
            <option value="">Update status to...</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={onApply}
            disabled={!bulkAction}
            className="px-3 py-2 text-sm text-white transition rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 md:px-4"
          >
            Apply
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-2 text-sm transition bg-white border rounded-lg text-primary-600 border-primary-600 hover:bg-secondary-200 md:px-4"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
