import React, { useState, useEffect, memo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaShoppingBag,
  FaMobile,
  FaHome,
  FaTshirt,
  FaUtensils,
  FaFutbol,
  FaBriefcase,
  FaStar,
  FaChartLine,
  FaLayerGroup,
  FaPercentage,
  FaTags,
} from "react-icons/fa";
import API from "../../../api/axiosInstance";

const iconMap = {
  Electronics: FaMobile,
  "Clothing & Fashion": FaTshirt,
  "Home & Kitchen": FaHome,
  "Food & Beverages": FaUtensils,
  "Sports & Fitness": FaFutbol,
  "Office Supplies": FaBriefcase,
};

const getCategoryIcon = (categoryName) => {
  return iconMap[categoryName] || FaShoppingBag;
};
const cache = new Map();

const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = useCallback((index) => {
    setHoveredCard(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCard(null);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const cacheKey = "featured-categories";

      if (cache.has(cacheKey)) {
        setCategories(cache.get(cacheKey));
        return;
      }

      try {
        const response = await API.get("/categories/featured/with-stats");
        const data = response.data || [];
        setCategories(data);
        cache.set(cacheKey, data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (e, categoryId) => {
    e.preventDefault();
    navigate(`/products?category=${categoryId}`, {
      state: { scrollToTop: true },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const CategoryCard = memo(({ category, index }) => {
    const IconComponent = getCategoryIcon(category.name);
    const isHovered = hoveredCard === index;

    return (
      <div
        className="relative group"
        style={{ animationDelay: `${index * 100}ms` }}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          to={`/products?category=${category._id}`}
          onClick={(e) => handleCategoryClick(e, category._id)}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-neutral-200 hover:border-primary-300 transition-all duration-500 overflow-hidden h-full flex flex-col"
        >
          <div className="relative h-48 bg-neutral-100 overflow-hidden flex-shrink-0">
            <img
              src={
                category.image?.startsWith("http")
                  ? category.image
                  : `${import.meta.env.VITE_API_URL.replace("/api", "")}${
                      category.image
                    }`
              }
              alt={category.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop";
              }}
            />

            <div className="absolute top-4 left-4 transform transition-transform duration-300">
              <div className="p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
                <IconComponent className="text-primary-600 text-xl" />
              </div>
            </div>

            {category.isBulkEnabled && (
              <div className="absolute top-4 right-4">
                <div className="bg-gradient-primary text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-1">
                  <FaPercentage className="text-xs" />
                  <span className="text-sm font-semibold">Bulk Deals</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col flex-1">
            <h3 className="font-bold text-neutral-800 text-xl mb-3 group-hover:text-primary-700 transition-colors">
              {category.name}
            </h3>

            <p className="text-neutral-600 text-sm mb-4 leading-relaxed flex-1">
              {category.description || "Explore our premium collection"}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className="flex items-center text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full text-xs">
                  <FaChartLine className="mr-1 text-primary-600" />
                  {category.productCount} products
                </span>
                {category.isBulkEnabled && (
                  <span className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs">
                    <FaLayerGroup className="mr-1" />
                    {category.bulkProducts} bulk
                  </span>
                )}
              </div>
            </div>

            <div
              className={`mb-4 p-3 rounded-lg border ${
                category.isBulkEnabled
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`font-medium ${
                    category.isBulkEnabled ? "text-green-700" : "text-blue-700"
                  }`}
                >
                  {category.isBulkEnabled ? "Bulk Discount:" : "Pricing:"}
                </span>
                <span
                  className={`font-bold ${
                    category.isBulkEnabled ? "text-green-600" : "text-blue-600"
                  }`}
                >
                  {category.isBulkEnabled
                    ? category.discountRange
                    : "Competitive Prices"}
                </span>
              </div>
              {!category.isBulkEnabled && (
                <p className="text-xs text-blue-600 mt-1">
                  Contact for wholesale inquiries
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 group-hover:border-primary-100 transition-colors mt-auto">
              <span className="text-primary-600 font-semibold group-hover:text-primary-700 transition-colors text-sm">
                Explore Category
              </span>
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center transform transition-all duration-300">
                <FaArrowRight className="text-sm" />
              </div>
            </div>
          </div>
        </Link>

        {isHovered && (
          <div className="absolute -top-2 -right-2 bg-white text-primary-600 px-3 py-1 rounded-full shadow-lg border border-primary-200 text-sm font-semibold z-20">
            <FaStar className="inline mr-1 text-yellow-500" />
            Featured
          </div>
        )}
      </div>
    );
  });

  CategoryCard.displayName = "CategoryCard";

  const handleViewAllClick = (e) => {
    e.preventDefault();
    navigate("/categories", { state: { scrollToTop: true } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNoCategoriesClick = (e) => {
    e.preventDefault();
    navigate("/categories", { state: { scrollToTop: true } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="py-16 bg-gradient-to-br from-background-light via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
            <FaLayerGroup className="mr-2" />
            B2B Bulk Categories
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 font-poppins mb-4">
            Featured{" "}
            <span className="text-gradient-primary">Business Categories</span>
          </h2>

          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed px-4">
            Discover wholesale opportunities with competitive pricing across all
            major product categories
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 max-w-md mx-auto">
              <FaTags className="text-4xl text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                No Featured Categories
              </h3>
              <p className="text-neutral-600 mb-4">
                Check back later for featured categories
              </p>
              <Link
                to="/categories"
                onClick={handleNoCategoriesClick}
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                View All Categories
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  index={index}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 sm:p-8 max-w-2xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-4">
                  Ready to Scale Your Business?
                </h3>
                <p className="text-neutral-600 mb-6 text-sm sm:text-base">
                  Get access to competitive pricing and wholesale deals across
                  all categories
                </p>
                <Link
                  to="/categories"
                  onClick={handleViewAllClick}
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-primary text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <FaLayerGroup className="mr-3" />
                  View All Categories
                  <FaArrowRight className="ml-3" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
