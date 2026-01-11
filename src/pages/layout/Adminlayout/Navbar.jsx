import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";

export default function Navbar({ showSidebar, setShowSidebar }) {
  const location = useLocation().pathname;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  const handleLinkClick = () => {
    setDropdownOpen(false);
  };

  return (
    <nav className="px-6 py-4 bg-white shadow-xs relative z-30 md:z-50">
      <div className="flex items-center justify-between w-full">
        {/* Left Side - Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <div className="md:hidden">
            {showSidebar === "-left-64" ? (
              <button
                className="p-2 text-2xl transition-colors duration-200 rounded-full text-neutral-700 hover:bg-neutral-100"
                onClick={() => setShowSidebar("left-0")}
              >
                <FaBars />
              </button>
            ) : (
              <button
                className="p-2 text-2xl transition-colors duration-200 rounded-full text-neutral-700 hover:bg-neutral-100"
                onClick={() => setShowSidebar("-left-64")}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Right Side - Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center p-2 space-x-3 transition-colors duration-200 rounded-lg hover:bg-neutral-100"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-500">
              <FaUserCircle className="text-lg text-white" />
            </div>
            <span className="hidden text-sm font-medium text-neutral-700 lg:block">
              Admin
            </span>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 z-50 w-48 py-2 mt-2 bg-white rounded-lg shadow-xl border border-neutral-100 animate-fadeIn">
              <div className="px-4 py-2 border-b border-neutral-200">
                <p className="text-sm font-medium text-neutral-800">
                  Admin Account
                </p>
                <p className="text-xs text-neutral-500">admin@nextrade.com</p>
              </div>

              <Link
                to="/admin/profile"
                onClick={handleLinkClick}
                className="flex items-center px-4 py-2 text-sm transition-colors duration-200 text-neutral-700 hover:bg-background-subtle"
              >
                <FaUserCircle className="mr-3 text-neutral-500" />
                Admin Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
