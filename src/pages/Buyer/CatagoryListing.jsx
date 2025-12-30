import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaSearch,
  FaShoppingBag,
  FaMobile,
  FaHome,
  FaTshirt,
  FaUtensils,
  FaFutbol,
  FaBriefcase,
  FaPercentage,
  FaLayerGroup,
  FaStar,
  FaFire,
  FaExclamationTriangle,
} from "react-icons/fa";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";

const CategoryListing = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories from your actual API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null);

        // Using the endpoint that includes product counts
        const response = await API.get("/categories/with-counts");
        const categoriesData = response.data;

        // Transform the data to match your component structure
        const transformedCategories = categoriesData.map((category) => ({
          _id: category._id,
          name: category.name,
          description:
            category.description ||
            `${category.name} products with best prices and bulk discounts`,
          image: category.image || getDefaultCategoryImage(category.name),
          productCount: category.productCount || 0,
          featured: category.isFeatured || false,
          hasBulkPricing: true,
          bulkPricingProducts: Math.floor((category.productCount || 0) * 0.3), // Estimate 30% have bulk pricing
          bulkDiscountRange: "10-40% OFF",
        }));

        setCategories(transformedCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again.");
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Helper function to get default category images
  const getDefaultCategoryImage = (categoryName) => {
    const imageMap = {
      Electronics:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=300&fit=crop",
      Clothing:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop",
      "Home & Kitchen":
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
      Food: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop",
      Sports:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop",
      Office:
        "https://images.unsplash.com/photo-1587334984009-aa4f53f58e6c?w=500&h=300&fit=crop",
    };

    return (
      imageMap[categoryName] ||
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop"
    );
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const featuredCategories = filteredCategories.filter((cat) => cat.featured);
  const otherCategories = filteredCategories.filter((cat) => !cat.featured);

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      Electronics: FaMobile,
      Clothing: FaTshirt,
      Fashion: FaTshirt,
      Home: FaHome,
      Kitchen: FaHome,
      Food: FaUtensils,
      Beverages: FaUtensils,
      Sports: FaFutbol,
      Fitness: FaFutbol,
      Office: FaBriefcase,
      Supplies: FaBriefcase,
      Beauty: FaShoppingBag,
      "Personal Care": FaShoppingBag,
      Books: FaShoppingBag,
      Media: FaShoppingBag,
      Toys: FaShoppingBag,
      Games: FaShoppingBag,
      Automotive: FaShoppingBag,
    };

    // Find the best matching icon
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return FaShoppingBag;
  };

  // Bulk Pricing Badge Component
  const BulkPricingBadge = ({ category }) => {
    if (!category.hasBulkPricing) return null;

    return (
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          <FaLayerGroup className="mr-1" />
          Bulk Discounts Available
        </div>
        <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          <FaPercentage className="mr-1" />
          {category.bulkDiscountRange}
        </div>
      </div>
    );
  };

  // Popular Bulk Items Component
  const PopularBulkItems = ({ category }) => {
    if (!category.hasBulkPricing) return null;

    const defaultItems = {
      Electronics: ["Smartphones", "Headphones", "Chargers", "Power Banks"],
      Clothing: ["T-Shirts", "Jeans", "Socks", "Underwear"],
      "Home & Kitchen": ["Dinner Sets", "Glassware", "Utensils", "Containers"],
      Food: ["Tea/Coffee", "Snacks", "Cereals", "Beverages"],
      Sports: ["Protein Supplements", "Sports Gear", "Accessories"],
      Office: ["Pens", "Notebooks", "Staplers", "Files"],
    };

    const popularItems = defaultItems[category.name] || ["Various Products"];

    return (
      <div className="mt-2">
        <div className="flex flex-wrap gap-1">
          {popularItems.slice(0, 3).map((item, index) => (
            <span
              key={index}
              className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs"
            >
              {item}
            </span>
          ))}
          {popularItems.length > 3 && (
            <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              +{popularItems.length - 3} more
            </span>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-neutral-800 font-poppins mb-2">
            All Categories
          </h1>
          <p className="text-neutral-600">
            Browse through our wide range of product categories with bulk
            pricing discounts
          </p>

          {/* Bulk Pricing Info Banner */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <FaLayerGroup className="text-blue-600 mr-3 text-xl" />
              <div>
                <h3 className="font-semibold text-blue-800">
                  Smart Bulk Shopping Available
                </h3>
                <p className="text-sm text-blue-700">
                  Save up to 60% when you buy in larger quantities across
                  multiple categories
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search categories with bulk discounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-800 font-poppins">
                Featured Categories
              </h2>
              <div className="flex items-center text-sm text-orange-600">
                <FaFire className="mr-1" />
                Best for Bulk Purchases
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCategories.map((category) => {
                const IconComponent = getCategoryIcon(category.name);

                return (
                  <Link
                    key={category._id}
                    to={`/products?category=${category._id}`}
                    className="group bg-white rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48 bg-neutral-100 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <div className="p-2 bg-white/90 rounded-lg shadow-md">
                          <IconComponent className="text-primary-600 text-xl" />
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full font-medium">
                          Featured
                        </span>
                      </div>
                      {/* Bulk Pricing Indicator */}
                      {category.hasBulkPricing && (
                        <div className="absolute bottom-4 left-4">
                          <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            <FaStar className="mr-1" />
                            {category.bulkPricingProducts}+ Bulk Items
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold text-neutral-800 text-xl mb-2 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>

                      {/* Bulk Pricing Info */}
                      <BulkPricingBadge category={category} />

                      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>

                      {/* Popular Bulk Items */}
                      <PopularBulkItems category={category} />

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                            {category.productCount} products
                          </span>
                          {category.hasBulkPricing && (
                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              {category.bulkPricingProducts} bulk deals
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* All Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-800 font-poppins">
              All Categories
            </h2>
            <div className="text-sm text-neutral-600">
              {categories.filter((cat) => cat.hasBulkPricing).length} categories
              with bulk pricing
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <FaShoppingBag className="text-4xl text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                No categories found
              </h3>
              <p className="text-neutral-600">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherCategories.map((category) => {
                const IconComponent = getCategoryIcon(category.name);

                return (
                  <Link
                    key={category._id}
                    to={`/products?category=${category._id}`}
                    className="group bg-white rounded-xl shadow-sm border border-neutral-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-40 bg-neutral-100 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <div className="p-2 bg-white/90 rounded-lg shadow-md">
                          <IconComponent className="text-primary-600 text-lg" />
                        </div>
                      </div>
                      {/* Bulk Pricing Indicator */}
                      {category.hasBulkPricing && (
                        <div className="absolute bottom-3 left-3">
                          <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            <FaLayerGroup className="mr-1" />
                            Bulk Deals
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-neutral-800 text-lg mb-2 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>

                      {/* Bulk Pricing Info */}
                      {category.hasBulkPricing && (
                        <div className="mb-2">
                          <div className="flex items-center text-green-600 text-sm">
                            <FaPercentage className="mr-1" />
                            {category.bulkDiscountRange}
                          </div>
                        </div>
                      )}

                      <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                        {category.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                            {category.productCount} products
                          </span>
                          {category.hasBulkPricing && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              {category.bulkPricingProducts} bulk
                            </span>
                          )}
                        </div>
                        <span className="text-primary-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                          View →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Bulk Shopping Tips */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
            <FaLayerGroup className="mr-2" />
            Smart Bulk Shopping Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                1
              </div>
              <p className="text-purple-700">
                Look for the bulk deals badge on categories
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                2
              </div>
              <p className="text-purple-700">
                Buy larger quantities to unlock better discounts
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                3
              </div>
              <p className="text-purple-700">
                Combine items from same category for maximum savings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListing;
