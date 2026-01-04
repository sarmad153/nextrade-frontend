import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaUser,
  FaStore,
  FaExternalLinkAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendar,
  FaSpinner,
  FaIdCard,
  FaBuilding,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../../api/axiosInstance";

const SellerInfoModal = ({
  sellerModalOpen,
  setSellerModalOpen,
  selectedSeller,
  products,
  setSearchTerm,
  onSellerFilter,
}) => {
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
    rating: 0,
  });

  useEffect(() => {
    if (sellerModalOpen && selectedSeller) {
      fetchSellerProfile();
      calculateSellerStats();
    }
  }, [sellerModalOpen, selectedSeller]);

  const fetchSellerProfile = async () => {
    try {
      setLoading(true);

      const response = await API.get(`/profile/${selectedSeller.id}`);
      const profileData = response.data;

      const transformedProfile = {
        name: profileData.user?.name || selectedSeller.name,
        email: profileData.user?.email || selectedSeller.email,
        storeName: profileData.shopName || selectedSeller.storeName,
        phone: profileData.phone || profileData.businessPhone || "Not provided",
        address:
          profileData.address ||
          profileData.businessAddress ||
          "Address not provided",
        bio:
          profileData.businessDescription ||
          profileData.shopDescription ||
          "No description provided",
        joinDate: profileData.user?.createdAt || new Date().toISOString(),
        profileImage: profileData.profileImage,
        businessType: profileData.businessType,
        city: profileData.city,
        cnicNumber: profileData.cnicNumber,
        yearsInBusiness: profileData.yearsInBusiness,
        mainProducts: profileData.mainProducts || [],
      };

      setSellerProfile(transformedProfile);
    } catch (error) {
      console.error("Failed to fetch seller profile:", error);
      setSellerProfile({
        name: selectedSeller.name,
        email: selectedSeller.email,
        storeName: selectedSeller.storeName,
        phone: "Not provided",
        address: "Address not provided",
        bio: "No description provided",
        joinDate: new Date().toISOString(),
        profileImage: null,
        businessType: "Not specified",
        city: "Not specified",
        cnicNumber: "Not provided",
        yearsInBusiness: 0,
        mainProducts: [],
      });
      toast.error("Could not load full seller profile");
    } finally {
      setLoading(false);
    }
  };

  const calculateSellerStats = () => {
    const sellerProducts = products.filter(
      (p) => p.seller.id === selectedSeller.id
    );
    const totalProducts = sellerProducts.length;
    const totalRevenue = sellerProducts.reduce((sum, product) => {
      const price = product.salePrice || product.price;
      return sum + price * product.sales;
    }, 0);
    const totalOrders = sellerProducts.reduce(
      (sum, product) => sum + (product.sales || 0),
      0
    );
    const rating = 4.5 + Math.random() * 0.5;

    setStats({
      totalProducts,
      totalRevenue,
      totalOrders,
      rating: parseFloat(rating.toFixed(1)),
    });
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Unknown";
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
    const nextSibling = e.target.nextSibling;
    if (nextSibling) {
      nextSibling.style.display = "flex";
    }
  };

  const handleViewAllProducts = () => {
    if (onSellerFilter) {
      onSellerFilter(selectedSeller);
      setSellerModalOpen(false);
    } else {
      setSearchTerm(selectedSeller.storeName);
      setSellerModalOpen(false);
      toast.info(`Showing products from ${selectedSeller.storeName}`);
    }
  };

  if (!sellerModalOpen || !selectedSeller) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-300 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            Seller Information
          </h2>
          <button
            onClick={() => setSellerModalOpen(false)}
            className="p-2 text-gray-500 transition-colors hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-2 rounded-full border-blue-600 border-t-transparent animate-spin"></div>
              <p className="mt-3 text-gray-600">
                Loading seller information...
              </p>
            </div>
          ) : (
            <>
              {/* Seller Image and Info */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="relative w-16 h-16">
                    {sellerProfile?.profileImage ? (
                      <>
                        <img
                          src={sellerProfile.profileImage}
                          alt={sellerProfile.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 absolute top-0 left-0"
                          onError={(e) => {
                            console.error(
                              "Failed to load profile image:",
                              sellerProfile.profileImage
                            );
                            e.target.style.display = "none";
                            const fallbackDiv = e.target.nextSibling;
                            if (fallbackDiv) {
                              fallbackDiv.style.display = "flex";
                            }
                          }}
                        />
                        <div className="absolute inset-0 hidden w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 items-center justify-center">
                          <FaStore className="text-2xl text-blue-600" />
                        </div>
                      </>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                        <FaStore className="text-2xl text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Seller Info - Make sure this has proper width */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {sellerProfile?.storeName || selectedSeller.storeName}
                  </h3>
                  <p className="text-gray-600 truncate">
                    by {sellerProfile?.name || selectedSeller.name}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="flex items-center text-yellow-500 text-sm font-medium">
                      <span className="mr-1">★</span>
                      {stats.rating}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {stats.totalProducts} products
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaEnvelope className="mr-2 text-blue-600" />
                    Email:
                  </span>
                  <span className="text-gray-800 text-sm break-all text-right">
                    {sellerProfile?.email || selectedSeller.email}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaPhone className="mr-2 text-blue-600" />
                    Phone:
                  </span>
                  <span className="text-gray-800">
                    {sellerProfile?.phone || "Not provided"}
                  </span>
                </div>

                <div className="flex justify-between items-start py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-600 mt-0.5" />
                    Address:
                  </span>
                  <span className="text-gray-800 text-sm text-right max-w-[200px]">
                    {sellerProfile?.address || "Address not provided"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaBuilding className="mr-2 text-blue-600" />
                    Business Type:
                  </span>
                  <span className="text-gray-800 capitalize">
                    {sellerProfile?.businessType || "Not specified"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-600" />
                    City:
                  </span>
                  <span className="text-gray-800">
                    {sellerProfile?.city || "Not specified"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaIdCard className="mr-2 text-blue-600" />
                    CNIC:
                  </span>
                  <span className="text-gray-800 text-sm">
                    {sellerProfile?.cnicNumber || "Not provided"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaStore className="mr-2 text-blue-600" />
                    Total Products:
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {stats.totalProducts}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaCalendar className="mr-2 text-blue-600" />
                    Member Since:
                  </span>
                  <span className="text-gray-800">
                    {formatJoinDate(sellerProfile?.joinDate)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium flex items-center">
                    <span className="mr-2 text-green-600">Rs</span>
                    Total Revenue:
                  </span>
                  <span className="text-green-600 font-semibold">
                    Rs {stats.totalRevenue?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>

              {sellerProfile?.bio &&
                sellerProfile.bio !== "No description provided" && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">
                      About the Business
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {sellerProfile.bio}
                    </p>
                  </div>
                )}

              {sellerProfile?.mainProducts &&
                sellerProfile.mainProducts.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Main Products
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sellerProfile.mainProducts.map((product, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="space-y-3">
                <button
                  onClick={handleViewAllProducts}
                  className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  View All Products from this Seller
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerInfoModal;
