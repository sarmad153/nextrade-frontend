import React, { useState } from "react";

const UserAvatar = ({ user, size = "md" }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-xl",
  };

  // If user has a profile image and no error, show it
  if (user.profileImage && !imageError) {
    return (
      <img
        src={`http://localhost:5000${user.profileImage}`}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
        onError={() => setImageError(true)}
      />
    );
  }

  // Fallback to initials avatar
  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center font-semibold rounded-full bg-secondary-200 text-primary-600 border-2 border-gray-200`}
    >
      {user.avatar}
    </div>
  );
};

export default UserAvatar;
