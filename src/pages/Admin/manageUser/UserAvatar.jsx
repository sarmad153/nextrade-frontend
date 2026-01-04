import React, { useState } from "react";

const UserAvatar = ({ user, size = "md" }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-xl",
  };

  // Get initials for fallback
  const getInitials = () => {
    if (user.avatar) return user.avatar;
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return "U";
  };

  // If we have a profileImage URL and no error, show image
  if (user.profileImage && !imageError) {
    return (
      <img
        src={user.profileImage}
        alt={user.name || "User"}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
        onError={() => setImageError(true)}
        onLoad={() => setImageError(false)}
      />
    );
  }

  // Fallback to initials avatar
  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center font-semibold rounded-full bg-secondary-200 text-primary-600 border-2 border-gray-200`}
    >
      {getInitials()}
    </div>
  );
};

export default UserAvatar;
