import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChevronDown,
  FaBoxOpen,
  FaReceipt,
} from "react-icons/fa";
import MainLogo from "../../../assets/Main Logo.png";
import { useAuth } from "../../../context/AuthContext";
import API from "../../../api/axiosInstance";

const BuyerNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [profileImage, setProfileImage] = useState("");
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads")) {
      return `https://nextrade-backend-production-a486.up.railway.app/${imagePath}`;
    }
    return `https://nextrade-backend-production-a486.up.railway.app//uploads/profiles/${imagePath}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.id) {
        try {
          const cartResponse = await API.get(`/cart/${user.id}`);
          if (
            cartResponse.data &&
            cartResponse.data.products &&
            Array.isArray(cartResponse.data.products)
          ) {
            const totalItems = cartResponse.data.products.reduce(
              (total, item) => {
                return total + (item.quantity || 1);
              },
              0
            );
            setCartItemsCount(totalItems);
          } else {
            setCartItemsCount(0);
          }

          const profileResponse = await API.get("/profile/me");
          if (profileResponse.data && profileResponse.data.profileImage) {
            setProfileImage(profileResponse.data.profileImage);
            setImgError(false);
          } else {
            setProfileImage("");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCartItemsCount(0);
          setProfileImage("");
        }
      } else {
        setCartItemsCount(0);
        setProfileImage("");
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!user || !user.id) return;

    const refreshCartCount = async () => {
      try {
        const cartResponse = await API.get(`/cart/${user.id}`);
        if (
          cartResponse.data &&
          cartResponse.data.products &&
          Array.isArray(cartResponse.data.products)
        ) {
          const totalItems = cartResponse.data.products.reduce(
            (total, item) => {
              return total + (item.quantity || 1);
            },
            0
          );
          setCartItemsCount(totalItems);
        } else {
          setCartItemsCount(0);
        }
      } catch (error) {
        console.error("Error refreshing cart count:", error);
        setCartItemsCount(0);
      }
    };

    const handleRouteChange = () => {
      refreshCartCount();
    };

    window.addEventListener("popstate", handleRouteChange);
    const interval = setInterval(refreshCartCount, 30000);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      clearInterval(interval);
    };
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setCartItemsCount(0);
    setProfileImage("");
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleProfileAction = (action) => {
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    if (action === "profile") {
      navigate("/profile");
    } else if (action === "logout") {
      handleLogout();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const navLinks = [
    {
      to: "/products",
      label: "Products",
      icon: <FaBoxOpen className="mr-2 text-sm" />,
    },
    {
      to: "/orders",
      label: "Orders",
      icon: <FaReceipt className="mr-2 text-sm" />,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img
                src={MainLogo}
                alt="NexTrade Logo"
                className="h-9 mr-3 transition-transform group-hover:scale-105"
              />
              <span className="text-2xl font-bold bg-gradient-primary-diagonal bg-clip-text text-transparent">
                NexTrade
              </span>
              <span className="ml-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                B2B
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </form>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
            >
              <FaShoppingCart className="text-base mr-2" />
              Cart
              {cartItemsCount > 0 && (
                <span className="ml-2 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary-600 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown or Login Button */}
            {user ? (
              <div className="relative profile-dropdown ml-2">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 min-w-[140px]"
                >
                  <div className="flex items-center">
                    {profileImage && !imgError ? (
                      <img
                        src={getProfileImageUrl(profileImage)}
                        alt="Profile"
                        className="w-6 h-6 rounded-full object-cover mr-2"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                        <FaUser className="text-primary-600 text-xs" />
                      </div>
                    )}
                    <span className="truncate max-w-[80px]">
                      {user.name || "Account"}
                    </span>
                  </div>
                  <FaChevronDown
                    className={`ml-2 text-xs transition-transform ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        {profileImage && !imgError ? (
                          <img
                            src={getProfileImageUrl(profileImage)}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                            <FaUser className="text-primary-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.name || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleProfileAction("profile")}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <FaUser className="mr-3 text-gray-400" />
                      My Profile
                    </button>
                    <button
                      onClick={() => handleProfileAction("logout")}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 border-t border-gray-100"
                    >
                      <FaSignOutAlt className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-primary rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <Link
              to="/cart"
              className="relative p-2 mr-3 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <FaShoppingCart className="text-lg" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary-600 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              {isMenuOpen ? (
                <FaTimes className="text-lg" />
              ) : (
                <FaBars className="text-lg" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-100">
          <div className="px-4 py-3 bg-white">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm placeholder-gray-400"
                />
              </div>
            </form>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center">
                      {profileImage && !imgError ? (
                        <img
                          src={getProfileImageUrl(profileImage)}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover mr-3"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                          <FaUser className="text-primary-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="mr-3 text-gray-400" />
                    My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-primary rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default BuyerNavbar;
