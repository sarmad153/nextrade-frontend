import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaAd,
  FaSignOutAlt,
  FaUsers,
  FaList,
} from "react-icons/fa";
import MainLogo from "../../../assets/Main Logo.png";
import { useAuth } from "../../../context/AuthContext";

export default function Sidebar({ showSidebar, setShowSidebar }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-primary-600 text-white shadow-md"
        : "text-neutral-700 hover:bg-background-subtle hover:text-primary-600"
    }`;

  const menuItems = [
    { to: "/admin/dashboard", icon: FaTachometerAlt, label: "Admin Dashboard" },
    { to: "/admin/category-management", icon: FaList, label: "All Categories" },
    { to: "/admin/all-products", icon: FaBox, label: "All Products" },
    { to: "/admin/manage-users", icon: FaUsers, label: "Manage Users" },
    {
      to: "/admin/manage-orders",
      icon: FaShoppingCart,
      label: "Manage Orders",
    },
    { to: "/admin/ads-management", icon: FaAd, label: "Manage Advertisement" },
  ];

  return (
    <div
      className={`fixed top-0 h-screen 
        ${showSidebar === "left-0" ? "z-50" : "z-0"} 
        md:z-20 md:left-0 ${showSidebar} 
        overflow-y-auto flex flex-col bg-white w-64 shadow-xl py-10 px-6 
        transition-all duration-300 md:py-8
        ${
          showSidebar === "-left-64"
            ? "pointer-events-none md:pointer-events-auto"
            : ""
        }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center">
        <img src={MainLogo} alt="NexTrade Logo" className="h-10 mr-2" />
        <span className="text-xl font-bold text-primary-900">
          NexTrade Admin
        </span>
      </div>

      <hr className="my-4 border-neutral-300" />

      {/* Menu Links */}
      <ul className="flex flex-col space-y-1">
        {menuItems.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end className={navLinkClass}>
              <item.icon className="text-lg" />
              {item.label}
            </NavLink>
          </li>
        ))}

        {/* Logout Button */}
        <li className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-4 px-4 py-3 text-sm font-medium rounded-lg 
              text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <FaSignOutAlt className="text-lg" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}
