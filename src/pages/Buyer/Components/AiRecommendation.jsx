import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaShoppingCart,
  FaEye,
  FaSync,
  FaRobot,
  FaExclamationTriangle,
  FaHeart,
  FaChartLine,
  FaPercentage,
  FaLayerGroup,
  FaArrowRight,
  FaBolt,
  FaStore,
  FaShieldAlt,
  FaCheckCircle,
  FaTag,
} from "react-icons/fa";
import API, { SERVER_URL } from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const AIRecommendations = ({
  title = "AI Recommended For Your Business",
  showViewAll = true,
}) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [user, setUser] = useState(null);

  // data mapping
  const mapProductData = (apiProduct) => {
    return {
      _id: apiProduct._id,
      name: apiProduct.name,
      price: apiProduct.price,
      salePrice: apiProduct.salePrice,
      images: apiProduct.images || ["Image Error"],
      averageRating: apiProduct.averageRating || 0,
      numReviews: apiProduct.numReviews || 0,
      category: apiProduct.category || { name: "General" },
      seller: apiProduct.seller || {
        name: "Seller",
        storeName: "Store",
        role: "seller",
      },
      stock: apiProduct.stock || 0,
      description:
        apiProduct.description || "Quality product for your business",
      bulkPricingEnabled: apiProduct.bulkPricingEnabled || false,
      featured: apiProduct.featured || false,
      tags: apiProduct.tags || [],
    };
  };

  // Fetch AI recommendations
  useEffect(() => {
    const fetchAIRecommendations = async () => {
      try {
        setError(null);
        const userData = JSON.parse(localStorage.getItem("user"));
        setUser(userData);

        if (userData && userData.id) {
          try {
            const response = await API.get(
              `/ai/products/recommend/home/${userData.id}`
            );
            if (response.data?.data?.length > 0) {
              setRecommendedProducts(response.data.data.map(mapProductData));
              return;
            }
          } catch (aiError) {
            console.warn("AI recommendations failed:", aiError);
          }
        }

        const trendingResponse = await API.get(
          "/products/trending/products?limit=8"
        );
        if (trendingResponse.data?.trendingProducts?.length > 0) {
          setRecommendedProducts(
            trendingResponse.data.trendingProducts.map(mapProductData)
          );
        } else {
          throw new Error("No products available");
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(err.message);
        setRecommendedProducts([]);
      }
    };

    fetchAIRecommendations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAIRecommendations();
    setRefreshing(false);
  };

  // Add to cart function
  const handleAddToCart = async (product) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("Please login to add items to cart");
        return;
      }

      const response = await API.post("/cart", {
        userId: user.id,
        productId: product._id,
        quantity: 1,
      });

      toast.success("Product added to cart!");
    } catch (err) {
      console.error("Cart error:", err);
      toast.error("Failed to add product to cart");
    }
  };

  const handleToggleWishlist = async (productId) => {
    toast.info("Wishlist feature coming soon!");
  };

  // Render stars
  const renderStars = (rating) => {
    const actualRating = rating || 0;
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        size={12}
        className={
          index < Math.floor(actualRating)
            ? "text-yellow-400"
            : "text-neutral-300"
        }
      />
    ));
  };

  // Calculate discount percentage
  const calculateDiscount = (product) => {
    if (!product?.salePrice || product.salePrice >= product.price) return 0;
    return Math.round(
      ((product.price - product.salePrice) / product.price) * 100
    );
  };

  // Trust badges
  const TrustBadges = ({ product }) => {
    const badges = [];

    if (product.seller?.role === "seller_approved") {
      badges.push({
        icon: FaShieldAlt,
        text: "Verified",
        color: "text-green-600",
        bgColor: "bg-green-100",
      });
    }

    if (product.bulkPricingEnabled) {
      badges.push({
        icon: FaLayerGroup,
        text: "Bulk",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      });
    }

    if (badges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mb-3">
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

  // Error State
  if (error && recommendedProducts.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-background-light via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-neutral-200">
            <FaExclamationTriangle className="text-5xl text-amber-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-neutral-800 mb-4">
              Unable to Load Recommendations
            </h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto text-lg">
              {error}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-4 bg-gradient-primary-vertical  text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 flex items-center mx-auto"
            >
              <FaSync className="mr-3" />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty State
  if (recommendedProducts.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-background-light via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-neutral-200">
            <FaRobot className="text-5xl text-neutral-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-neutral-800 mb-4">
              {user ? "No Recommendations Yet" : "Popular Products"}
            </h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto text-lg">
              {user
                ? "Start browsing products to get personalized recommendations"
                : "Discover trending products from our marketplace"}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-primary-vertical text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-300"
            >
              <FaArrowRight className="mr-3" />
              Browse All Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-background-light via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
            <FaRobot className="mr-2" />
            {user ? "AI-Powered Recommendations" : "Trending Products"}
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-4">
            {user ? "Smart " : "Popular "}
            <span className="bg-gradient-primary-vertical bg-clip-text text-transparent">
              {user ? "Business Picks" : "Products"}
            </span>
          </h2>

          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {user
              ? "AI-curated products tailored to maximize your business savings"
              : "Discover the most popular products in our marketplace"}
          </p>
        </div>

        {/* Error Banner */}
        {error && recommendedProducts.length > 0 && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-amber-800 text-sm">
              Using limited data: {error}
            </p>
          </div>
        )}

        {/* Products Grid*/}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recommendedProducts.map((product, index) => {
            const discount = calculateDiscount(product);
            const hasDiscount = discount > 0;

            return (
              <div
                key={product._id}
                className="relative group"
                onMouseEnter={() => setHoveredProduct(index)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-neutral-200 hover:border-primary-300 transition-all duration-300 overflow-hidden flex flex-col h-full">
                  {/* Product Image*/}
                  <div className="relative h-48 bg-neutral-100 overflow-hidden flex-shrink-0">
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? typeof product.images[0] === "string"
                            ? product.images[0].startsWith("http")
                              ? product.images[0]
                              : `${SERVER_URL}${product.images[0]}`
                            : product.images[0]?.url ||
                              product.images[0]?.secure_url ||
                              product.images[0]?.path ||
                              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop"
                          : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* AI Badge - Only show for logged-in users with AI recommendations */}
                    {user && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-gradient-primary-vertical  text-white text-xs rounded-full font-semibold shadow-lg flex items-center">
                          <FaBolt className="mr-1" size={8} />
                          AI PICK
                        </span>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold shadow-lg">
                          {discount}% OFF
                        </span>
                      </div>
                    )}

                    {/* Trust Badges */}
                    <div className="absolute bottom-3 right-3 flex flex-col gap-1 items-end">
                      {product.seller?.role === "seller_approved" && (
                        <div className="bg-green-500 text-white text-xs font-semibold py-1 px-2 rounded-full shadow-lg flex items-center">
                          <FaShieldAlt size={8} className="mr-1" />
                          Verified
                        </div>
                      )}
                      {product.bulkPricingEnabled && (
                        <div className="bg-blue-500 text-white text-xs font-semibold py-1 px-2 rounded-full shadow-lg flex items-center">
                          <FaLayerGroup size={8} className="mr-1" />
                          Bulk
                        </div>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {product.featured && (
                      <div className="absolute bottom-3 left-3">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-semibold py-1 px-3 rounded-full shadow-lg flex items-center">
                          <FaStar className="mr-1" size={10} />
                          Featured
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info*/}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Category */}
                    {product.category && (
                      <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wide font-medium">
                        {product.category.name}
                      </p>
                    )}

                    {/* Product Name*/}
                    <h3 className="font-semibold text-neutral-800 mb-2 line-clamp-2 text-sm leading-tight min-h-[2.5rem] group-hover:text-primary-700 transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        {renderStars(product.averageRating)}
                      </div>
                      <span className="text-xs text-neutral-500">
                        ({product.numReviews})
                      </span>
                    </div>

                    {/* Price*/}
                    <div className="mb-3">
                      {hasDiscount ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-lg font-bold text-primary-600">
                            Rs {product.salePrice}
                          </span>
                          <span className="text-sm text-neutral-500 line-through">
                            Rs {product.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary-600">
                          Rs {product.price}
                        </span>
                      )}
                    </div>

                    {/* Stock Status*/}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          product.stock > 10
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock > 10 ? "In Stock" : "Low Stock"}
                      </span>
                      {product.bulkPricingEnabled && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          Bulk Available
                        </span>
                      )}
                    </div>

                    {/* Action Buttons*/}
                    <div className="flex space-x-2 mt-auto">
                      <Link
                        to={`/product/${product._id}`}
                        className="flex-1 px-3 py-2 text-center text-xs border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 hover:scale-105 transition-all duration-200 flex items-center justify-center font-medium"
                      >
                        <FaEye className="mr-1" size={12} />
                        View
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 px-3 py-2 text-xs bg-gradient-primary-vertical text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center font-medium"
                      >
                        <FaShoppingCart className="mr-1" size={12} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating AI Insight - Only show for logged-in users */}
                {user && hoveredProduct === index && (
                  <div className="absolute -top-2 -right-2 bg-white text-primary-600 px-2 py-1 rounded-full shadow-lg border border-primary-200 text-xs font-semibold z-20 animate-bounce">
                    <FaChartLine className="inline mr-1" size={8} />
                    Smart Match
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-neutral-800 mb-3">
              {user ? "Want Better Recommendations?" : "Discover More Products"}
            </h3>
            <p className="text-neutral-600 mb-6">
              {user
                ? "Our AI learns from your browsing to provide smarter suggestions"
                : "Explore our complete catalog of amazing products"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-gradient-primary-vertical text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 shadow-md"
              >
                <FaStore className="mr-2" />
                Browse All Products
                <FaArrowRight className="ml-2" />
              </Link>
              {user && (
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300 disabled:opacity-50"
                >
                  <FaSync
                    className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500 flex items-center justify-center">
            <FaLayerGroup className="mr-2 text-primary-600" />
            {user
              ? "Personalized based on your business needs and market trends"
              : "Featured products based on popularity and customer ratings"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AIRecommendations;
