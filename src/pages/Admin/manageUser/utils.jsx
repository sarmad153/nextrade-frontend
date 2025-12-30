import React from "react";
import {
  FaUserCheck,
  FaBan,
  FaStore,
  FaUser,
  FaUserClock,
} from "react-icons/fa";

export const getStatusBadge = (status) => {
  const statusConfig = {
    active: {
      classes: "bg-green-100 text-green-800",
      text: "Active",
      icon: FaUserCheck,
    },
    blocked: {
      classes: "bg-red-100 text-red-800",
      text: "Blocked",
      icon: FaBan,
    },
  };

  const config = statusConfig[status] || statusConfig.active;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.classes}`}
    >
      <IconComponent className="mr-1" size={10} />
      {config.text}
    </span>
  );
};

export const getRoleBadge = (role) => {
  const roleConfig = {
    seller_approved: {
      classes: "bg-green-100 text-green-800",
      text: "Approved Seller",
      icon: FaStore,
    },
    seller_pending: {
      classes: "bg-orange-100 text-orange-800",
      text: "Pending Seller",
      icon: FaUserClock,
    },
    seller: {
      classes: "bg-purple-100 text-purple-800",
      text: "Seller",
      icon: FaStore,
    },
    admin: {
      classes: "bg-red-100 text-red-800",
      text: "Admin",
      icon: FaUserCheck,
    },
    buyer: {
      classes: "bg-blue-100 text-blue-800",
      text: "Buyer",
      icon: FaUser,
    },
  };

  const config = roleConfig[role] || roleConfig.buyer;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.classes}`}
    >
      <IconComponent className="mr-1" size={10} />
      {config.text}
    </span>
  );
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
