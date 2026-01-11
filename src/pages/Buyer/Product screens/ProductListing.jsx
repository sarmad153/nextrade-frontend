import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaShoppingCart,
  FaEye,
  FaTimes,
  FaPercentage,
  FaLayerGroup,
  FaTag,
  FaBox,
  FaStore,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import API from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const ProductsGrid = ({
  products,
  loading,
  error,
  onAddToCart,
  currentCategory,
  filters,
  clearCategoryFilter,
}) => {
  const renderStars = (rating) => {
    const actualRating = rating || 0;
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={
          index < Math.floor(actualRating)
            ? "text-yellow-400"
            : "text-neutral-300"
        }
        size={14}
      />
    ));
  };

  const calculateDiscount = (product) => {
    if (!product?.salePrice || product.salePrice >= product.price) return 0;
    return Math.round(
      ((product.price - product.salePrice) / product.price) * 100
    );
  };

  const BulkPricingBadge = ({ product }) => {
    const hasValidBulkPricing =
      product.bulkPricingEnabled &&
      product.bulkTiers &&
      product.bulkTiers.length > 0 &&
      product.bulkTiers.some(
        (tier) => tier && tier.discountValue && tier.minQuantity
      );

    if (!hasValidBulkPricing) return null;

    return (
      <div className="absolute top-3 left-3">
        <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <FaLayerGroup className="mr-1" size={10} />
          Bulk Deals
        </div>
      </div>
    );
  };

  const SellerInfo = ({ product }) => {
    if (!product.seller) return null;

    return (
      <div className="flex items-center justify-between mt-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs text-neutral-600">
            <FaStore className="mr-1 text-blue-600" size={10} />
            <span className="font-medium text-neutral-700">
              {product.seller.storeName || product.seller.name}
            </span>
          </div>

          {product.seller.role === "seller_approved" && (
            <div className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              <FaCheckCircle size={8} className="mr-1" />
              Verified
            </div>
          )}
        </div>

        {product.seller.rating && (
          <div className="flex items-center text-xs text-neutral-600">
            <FaStar className="text-yellow-400 mr-1" size={10} />
            <span>{product.seller.rating}</span>
          </div>
        )}
      </div>
    );
  };

  const TrustBadges = ({ product }) => {
    const badges = [];

    if (product.seller?.role === "seller_approved") {
      badges.push({
        icon: FaShieldAlt,
        text: "Verified Seller",
        color: "text-green-600",
        bgColor: "bg-green-100",
      });
    }

    if (product.bulkPricingEnabled) {
      badges.push({
        icon: FaLayerGroup,
        text: "Bulk Discounts",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      });
    }

    if (product.featured) {
      badges.push({
        icon: FaStar,
        text: "Featured",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      });
    }

    if (badges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mb-2">
        {badges.map((badge, index) => (
          <div
            key={index}
            className={`flex items-center px-2 py-1 rounded-full text-xs ${badge.bgColor} ${badge.color}`}
          >
            <badge.icon className="mr-1" size={8} />
            <span>{badge.text}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full lg:w-3/4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-neutral-200"></div>
              <div className="flex flex-col flex-1 p-4 space-y-3">
                <div className="h-4 bg-neutral-200 rounded"></div>
                <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-8 bg-neutral-200 rounded mt-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full lg:w-3/4">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full lg:w-3/4">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-neutral-600">
            No products found matching your criteria.
          </p>
          <button
            onClick={clearCategoryFilter}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Clear filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-3/4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const discountPercentage = calculateDiscount(product);
          const hasDiscount = discountPercentage > 0;

          return (
            <div
              key={product._id}
              className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full"
            >
              <div className="relative h-48 bg-neutral-100 overflow-hidden">
                <img
                  src={
                    product.images && product.images.length > 0
                      ? (() => {
                          // Safely get the first image
                          const firstImage = product.images[0];

                          // If it's a string
                          if (typeof firstImage === "string") {
                            return firstImage.startsWith("http")
                              ? firstImage
                              : `https://nextrade-backend-production-a486.up.railway.app/${firstImage}`;
                          }

                          // If it's an object, try to get the URL
                          if (
                            typeof firstImage === "object" &&
                            firstImage !== null
                          ) {
                            // Try common image object properties
                            return (
                              firstImage.url ||
                              firstImage.secure_url ||
                              firstImage.path ||
                              firstImage.src ||
                              "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
                            );
                          }

                          // Fallback
                          return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
                        })()
                      : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <BulkPricingBadge product={product} />

                {hasDiscount && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                      {discountPercentage}% OFF
                    </span>
                  </div>
                )}

                {product.featured && !hasDiscount && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-bold text-white bg-primary-600 rounded-full">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 p-4">
                <h3 className="font-semibold text-neutral-800 line-clamp-2 h-8 mb-2 text-sm sm:text-base">
                  {product.name}
                </h3>

                <p className="text-sm text-neutral-600 mb-1">
                  {product.category?.name}
                </p>

                <SellerInfo product={product} />

                <TrustBadges product={product} />

                <div className="flex items-center mb-3">
                  <div className="flex">
                    {renderStars(product.averageRating)}
                  </div>
                  <span className="ml-2 text-sm text-neutral-600">
                    ({product.numReviews || 0})
                  </span>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      {hasDiscount ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-lg font-bold text-primary-600 sm:text-xl">
                            Rs {product.salePrice}
                          </span>
                          <span className="text-sm text-neutral-500 line-through">
                            Rs {product.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary-600 sm:text-xl">
                          Rs {product.price}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.stock > 10
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock > 10 ? "In Stock" : "Low Stock"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/product/${product._id}`}
                      className="flex-1 px-3 py-2 text-center text-sm border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center"
                    >
                      <FaEye className="mr-1" />
                      View
                    </Link>
                    <button
                      onClick={() => onAddToCart(product._id)}
                      className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                    >
                      <FaShoppingCart className="mr-1" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProductListing = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Scroll to top when filters change (optional)
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams]);

  // Initialize filters directly from URL params
  const [filters, setFilters] = useState(() => {
    const urlCategory = searchParams.get("category");
    const urlBulkPricing = searchParams.get("bulkPricing");
    const urlSearch = searchParams.get("search");
    const urlMinPrice = searchParams.get("minPrice");
    const urlMaxPrice = searchParams.get("maxPrice");

    return {
      category: urlCategory || "",
      bulkPricing: urlBulkPricing || "",
      search: urlSearch || "",
      minPrice: urlMinPrice || "",
      maxPrice: urlMaxPrice || "",
    };
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState("name");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearch = useDebounce(filters.search, 500);
  const debouncedMinPrice = useDebounce(filters.minPrice, 500);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 500);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categoriesResponse = await API.get("/categories/with-counts");
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        setError(null);

        const params = {};
        if (filters.category) params.category = filters.category;
        if (debouncedSearch) params.search = debouncedSearch;
        if (debouncedMinPrice) params.minPrice = debouncedMinPrice;
        if (debouncedMaxPrice) params.maxPrice = debouncedMaxPrice;
        if (filters.bulkPricing) params.bulkPricing = filters.bulkPricing;

        const productsResponse = await API.get("/products", { params });
        const productsData = productsResponse.data.products || [];

        const productsWithBulkPricing = await Promise.all(
          productsData.map(async (product) => {
            try {
              const bulkResponse = await API.get(
                `/bulk-pricing/products/${product._id}`
              );

              // Check if response.data is an array
              const hasBulkPricing =
                Array.isArray(bulkResponse.data) &&
                bulkResponse.data.length > 0;

              return {
                ...product,
                bulkPricingEnabled: hasBulkPricing,
                bulkTiers: hasBulkPricing ? bulkResponse.data : [],
              };
            } catch (error) {
              // If 404 or other error, no bulk pricing
              return {
                ...product,
                bulkPricingEnabled: false,
                bulkTiers: [],
              };
            }
          })
        );

        setProducts(productsWithBulkPricing);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [
    filters.category,
    debouncedSearch,
    debouncedMinPrice,
    debouncedMaxPrice,
    filters.bulkPricing,
  ]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      search: "",
      bulkPricing: "",
    });
  };

  const clearCategoryFilter = () => {
    setFilters((prev) => ({
      ...prev,
      category: "",
    }));
  };

  const handleAddToCart = async (productId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("Please login to add items to cart");
        return;
      }

      const response = await API.post("/cart", {
        userId: user.id,
        productId: productId,
        quantity: 1,
      });

      toast.success("Product added to cart!");
    } catch (err) {
      console.error("Detailed cart error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        user: JSON.parse(localStorage.getItem("user")),
      });

      toast.error("Failed to add product to cart");
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const hasValidBulkPricing =
        product.bulkPricingEnabled &&
        product.bulkTiers &&
        product.bulkTiers.length > 0;

      if (filters.bulkPricing === "yes" && !hasValidBulkPricing) return false;
      if (filters.bulkPricing === "no" && hasValidBulkPricing) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "bulk-discount":
          const aHasBulk = a.bulkTiers && a.bulkTiers.length > 0;
          const bHasBulk = b.bulkTiers && b.bulkTiers.length > 0;

          if (!aHasBulk && !bHasBulk) return 0;
          if (!aHasBulk) return 1;
          if (!bHasBulk) return -1;

          const aMaxDiscount = Math.max(
            ...a.bulkTiers.map((t) => t.discountValue || 0)
          );
          const bMaxDiscount = Math.max(
            ...b.bulkTiers.map((t) => t.discountValue || 0)
          );
          return bMaxDiscount - aMaxDiscount;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const currentCategory = categories.find(
    (cat) => cat._id === filters.category
  );

  const bulkProductsCount = products.filter((p) => p.bulkPricingEnabled).length;

  const MobileFilters = () => (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowMobileFilters(false)}
      ></div>

      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-800">Filters</h2>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 text-neutral-600 hover:text-neutral-800"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <FaSearch className="absolute right-3 top-3 text-neutral-400" />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 font-medium text-neutral-700">Bulk Pricing</h3>
            <select
              value={filters.bulkPricing}
              onChange={(e) =>
                handleFilterChange("bulkPricing", e.target.value)
              }
              className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Products</option>
              <option value="yes">With Bulk Discounts</option>
              <option value="no">Without Bulk Discounts</option>
            </select>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 font-medium text-neutral-700">Category</h3>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name} ({category.productCount || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 font-medium text-neutral-700">Price Range</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-neutral-600 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 font-medium text-neutral-700">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="bulk-discount">Bulk Discount %</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light">
      {showMobileFilters && <MobileFilters />}

      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 sm:text-3xl">
              {currentCategory
                ? `${currentCategory.name} Products`
                : "All Products"}
            </h1>
            <p className="mt-1 text-neutral-600 text-sm sm:text-base">
              {filteredProducts.length} products found
              {filters.search && ` for "${filters.search}"`}
              {currentCategory && ` in ${currentCategory.name}`}
              {filters.bulkPricing === "yes" && ` with bulk discounts`}
              {currentCategory && (
                <button
                  onClick={clearCategoryFilter}
                  className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full hover:bg-primary-200 transition-colors"
                >
                  {currentCategory.name} ×
                </button>
              )}
            </p>
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center justify-center px-4 py-2 border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50 lg:hidden"
          >
            <FaFilter className="mr-2 text-neutral-600" />
            Filters
          </button>
        </div>

        {bulkProductsCount > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaLayerGroup className="text-blue-600 mr-3 text-xl" />
                <div>
                  <h3 className="font-semibold text-blue-800">
                    Smart Bulk Shopping
                  </h3>
                  <p className="text-sm text-blue-700">
                    {bulkProductsCount} products with bulk discounts available
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  Save up to 45% on bulk orders
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="hidden lg:block lg:w-1/4">
            <div className="p-6 bg-white rounded-lg shadow sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-800">
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <FaSearch className="absolute right-2 top-2 text-neutral-400" />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 font-medium text-neutral-700">
                  Bulk Pricing
                </h3>
                <select
                  value={filters.bulkPricing}
                  onChange={(e) =>
                    handleFilterChange("bulkPricing", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Products</option>
                  <option value="yes">With Bulk Discounts</option>
                  <option value="no">Without Bulk Discounts</option>
                </select>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 font-medium text-neutral-700">Category</h3>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name} ({category.productCount || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 font-medium text-neutral-700">
                  Price Range
                </h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-medium text-neutral-700">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="bulk-discount">Bulk Discount %</option>
                </select>
              </div>
            </div>
          </div>

          <ProductsGrid
            products={filteredProducts}
            loading={productsLoading}
            error={error}
            onAddToCart={handleAddToCart}
            currentCategory={currentCategory}
            filters={filters}
            clearCategoryFilter={clearCategoryFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
