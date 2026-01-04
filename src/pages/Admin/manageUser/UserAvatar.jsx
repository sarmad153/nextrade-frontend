import React, { useState } from "react";

const UserAvatar = ({ user, size = "md" }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-xl",
  };

  // Function to get the correct image URL
  const getImageUrl = () => {
    if (!user.profileImage) return null;

    // If it's already a full URL (from Cloudinary)
    if (typeof user.profileImage === "string") {
      // Check if it starts with http (Cloudinary URL)
      if (user.profileImage.startsWith("http")) {
        return user.profileImage;
      }
      // If it's just a filename/path, add backend URL
      return `https://nextrade-backend-production-a486.up.railway.app/${user.profileImage}`;
    }

    // If it's an object with url property (Cloudinary object)
    if (user.profileImage && typeof user.profileImage === "object") {
      if (user.profileImage.url && user.profileImage.url.startsWith("http")) {
        return user.profileImage.url;
      }
    }

    return null;
  };

  const imageUrl = getImageUrl();

  // If we have a valid image URL and no error, show image
  if (imageUrl && !imageError) {
    return (
      <img
        src={imageUrl}
        alt={user.name || "User"}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
        onError={() => setImageError(true)}
        onLoad={() => setImageError(false)}
      />
    );
  }

  // Fallback to initials avatar
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

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center font-semibold rounded-full bg-secondary-200 text-primary-600 border-2 border-gray-200`}
    >
      {getInitials()}
    </div>
  );
};

export default UserAvatar;
