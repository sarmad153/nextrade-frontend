import React from "react";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  onClearFilters,
}) => {
  const statusOptions = [
    "all",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  return (
    <div className="p-4 mb-6 bg-white border shadow-sm border-neutral-300 rounded-xl md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="relative max-w-md">
            <FaSearch className="absolute transform -translate-y-1/2 text-neutral-400 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent md:py-2.5"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition md:px-4 md:py-2.5 ${
              showFilters
                ? "bg-secondary-200 text-primary-700 border border-primary-600"
                : "bg-background-subtle text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            <FaFilter className="mr-2" />
            Filters
          </button>

          <button
            onClick={onClearFilters}
            className="flex items-center px-3 py-2 text-sm text-neutral-700 bg-background-subtle rounded-lg transition hover:bg-neutral-200 md:px-4 md:py-2.5"
          >
            <FaTimes className="mr-2" />
            Clear
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4 p-4 mt-4 rounded-lg bg-background-subtle md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-neutral-700">
              Order Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All Status" : status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-neutral-700">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="date">Order Date</option>
              <option value="amount">Total Amount</option>
              <option value="id">Order ID</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
