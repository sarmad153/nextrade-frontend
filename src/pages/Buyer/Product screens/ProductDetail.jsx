import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaPercentage,
  FaLayerGroup,
  FaTag,
  FaCheckCircle,
  FaBox,
  FaArrowLeft,
  FaExclamationTriangle,
  FaEye,
  FaStore,
  FaMapMarkerAlt,
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
  FaEdit,
} from "react-icons/fa";
import API from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import ReviewForm from "./ReviewForm";

const SellerInfo = React.memo(({ product }) => {
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!product?.seller?._id) return;

      try {
        setLoading(true);
        const response = await API.get(
          `/products/seller/${product.seller._id}/public-profile`
        );
        setSellerProfile(response.data);
      } catch (error) {
        console.error("Error fetching seller profile:", error);
        setSellerProfile({
          seller: product.seller,
          profile: {},
          stats: { totalProducts: "N/A", activeProducts: "N/A" },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, [product?.seller?._id]);

  if (!product?.seller) return null;

  if (loading) {
    return (
      <div className="mt-6 p-4 bg-white rounded-lg border border-neutral-200">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const getProfileImage = () => {
    const imageUrl = sellerProfile?.profile?.profileImage;
    if (!imageUrl) return null;

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    } else if (imageUrl.startsWith("/uploads")) {
      return `https://nextrade-backend-production-a486.up.railway.app/${imageUrl}`;
    } else {
      return `https://nextrade-backend-production-a486.up.railway.app//uploads/profiles/${imageUrl}`;
    }
  };

  const profileImage = getProfileImage();
  const storeName =
    sellerProfile?.seller?.storeName || sellerProfile?.seller?.name || "Seller";
  const businessType = sellerProfile?.profile?.businessType;
  const city = sellerProfile?.profile?.city;
  const yearsInBusiness = sellerProfile?.profile?.yearsInBusiness;
  const totalProducts = sellerProfile?.stats?.totalProducts;
  const businessDescription = sellerProfile?.profile?.businessDescription;
  const mainProducts = sellerProfile?.profile?.mainProducts;
  const isVerified = sellerProfile?.seller?.role === "seller_approved";

  return (
    <div className="mt-6 p-4 sm:p-6 bg-white rounded-lg border border-neutral-200 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
        <FaStore className="mr-2 text-blue-600" />
        Seller Information
      </h3>

      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-shrink-0 flex justify-center sm:justify-start">
          {profileImage ? (
            <img
              src={profileImage}
              alt={storeName}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg border-2 border-blue-200 ${
              profileImage ? "hidden" : "flex"
            }`}
          >
            {storeName.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
            <h4 className="text-xl font-bold text-neutral-800 text-center sm:text-left truncate">
              {storeName}
            </h4>
            {isVerified && (
              <div className="flex items-center justify-center sm:justify-start bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                <FaCheckCircle size={10} className="mr-1" />
                Verified Seller
              </div>
            )}
          </div>

          <div className="space-y-2 mb-3">
            {businessType && (
              <div className="flex items-center text-sm text-neutral-600 justify-center sm:justify-start">
                <FaBox className="mr-2 text-blue-500" size={12} />
                <span className="font-medium">Business:</span>
                <span className="ml-1 capitalize">{businessType}</span>
              </div>
            )}

            {city && (
              <div className="flex items-center text-sm text-neutral-600 justify-center sm:justify-start">
                <FaMapMarkerAlt className="mr-2 text-blue-500" size={12} />
                <span className="font-medium">Location:</span>
                <span className="ml-1">{city}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 p-3 bg-neutral-50 rounded-lg">
            {yearsInBusiness > 0 && (
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {yearsInBusiness}+
                </div>
                <div className="text-xs text-neutral-600">Years Experience</div>
              </div>
            )}

            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {totalProducts || "100+"}
              </div>
              <div className="text-xs text-neutral-600">Products</div>
            </div>
          </div>

          {businessDescription && (
            <div className="mb-3">
              <p className="text-sm text-neutral-700 line-clamp-2 text-center sm:text-left">
                {businessDescription}
              </p>
              {businessDescription.length > 100 && (
                <button className="text-blue-600 text-xs font-medium mt-1 w-full sm:w-auto text-center sm:text-left">
                  Read more
                </button>
              )}
            </div>
          )}

          {mainProducts && mainProducts.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-neutral-700 mb-2 text-center sm:text-left">
                Specializes In:
              </h5>
              <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                {mainProducts.slice(0, 4).map((product, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {product}
                  </span>
                ))}
                {mainProducts.length > 4 && (
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                    +{mainProducts.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <FaShippingFast size={10} className="mr-1" />
              Fast Shipping
            </div>
            <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <FaShieldAlt size={10} className="mr-1" />
              Quality Guarantee
            </div>
            <div className="flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              <FaHeadset size={10} className="mr-1" />
              Support Available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const BulkPricingTable = React.memo(
  ({ bulkPricingInfo, quantity, product }) => {
    if (
      !bulkPricingInfo?.bulkPricingEnabled ||
      !bulkPricingInfo.tiers ||
      bulkPricingInfo.tiers.length === 0
    ) {
      return null;
    }

    const sortedTiers = [...bulkPricingInfo.tiers].sort(
      (a, b) => a.minQuantity - b.minQuantity
    );

    const getBasePrice = () => {
      return product.salePrice && product.salePrice < product.price
        ? product.salePrice
        : product.price;
    };

    const basePrice = getBasePrice();

    return (
      <div className="mt-4 sm:mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center justify-center sm:justify-start">
          <FaLayerGroup className="mr-2" />
          Bulk Pricing Tiers
        </h4>
        <div className="space-y-2">
          {sortedTiers.map((tier, index) => {
            const discountAmount =
              tier.discountType === "percentage"
                ? basePrice * (tier.discountValue / 100)
                : tier.discountValue;
            const finalPrice = basePrice - discountAmount;

            return (
              <div
                key={index}
                className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded ${
                  quantity >= tier.minQuantity
                    ? "bg-green-100 border border-green-200"
                    : "bg-white"
                }`}
              >
                <div className="flex items-center justify-center sm:justify-start mb-2 sm:mb-0">
                  <span className="font-medium text-neutral-700 text-sm sm:text-base">
                    {tier.minQuantity}+ units
                  </span>
                  {quantity >= tier.minQuantity && (
                    <FaCheckCircle className="ml-2 text-green-600" size={14} />
                  )}
                </div>
                <div className="text-center sm:text-right">
                  <div className="flex items-center justify-center sm:justify-end space-x-2">
                    <span className="text-sm text-neutral-500 line-through">
                      Rs {product.price}
                    </span>
                    <span
                      className={`font-semibold text-sm sm:text-base ${
                        quantity >= tier.minQuantity
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      Rs {finalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {tier.discountType === "percentage"
                      ? `${tier.discountValue}% OFF`
                      : `Save Rs ${tier.discountValue}`}
                    {product.salePrice && product.salePrice < product.price && (
                      <span className="text-orange-600 ml-1">
                        (on top of sale)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

const SavingsCalculator = React.memo(
  ({ bulkPricingInfo, currentPricing, product, quantity, nextTier }) => {
    if (!bulkPricingInfo?.bulkPricingEnabled) return null;

    const originalTotalPrice = product.price * quantity;
    const priceWithSaleOnly =
      product.salePrice && product.salePrice < product.price
        ? product.salePrice * quantity
        : product.price * quantity;
    const saleDiscountAmount = originalTotalPrice - priceWithSaleOnly;

    return (
      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-800 mb-2 flex items-center justify-center sm:justify-start">
          <FaPercentage className="mr-2" />
          Your Savings
        </h4>
        {currentPricing.appliedTier ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Original Price:</span>
              <span className="line-through text-neutral-500">
                Rs {originalTotalPrice.toFixed(2)}
              </span>
            </div>

            {saleDiscountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Sale Discount:</span>
                <span className="text-orange-600 font-medium">
                  -Rs {saleDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>Bulk Discount:</span>
              <span className="text-green-600 font-medium">
                -Rs {(priceWithSaleOnly - currentPricing.totalPrice).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-2">
              <span>You Pay:</span>
              <span className="text-green-700">
                Rs {currentPricing.totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="text-xs text-green-600 text-center sm:text-left">
              Total savings:{" "}
              {(
                ((originalTotalPrice - currentPricing.totalPrice) /
                  originalTotalPrice) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>
        ) : (
          <div className="text-sm text-green-700 text-center sm:text-left">
            Add {nextTier ? nextTier.minQuantity - quantity : "more"} items to
            unlock bulk discounts
          </div>
        )}
      </div>
    );
  }
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [bulkPricingInfo, setBulkPricingInfo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasPurchasedProduct, setHasPurchasedProduct] = useState(false);
  const [userPurchasedProducts, setUserPurchasedProducts] = useState([]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product details
        const productResponse = await API.get(`/products/${id}`);
        const productData = productResponse.data;
        setProduct(productData);

        // Track user activity for recommendations
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          try {
            await API.post(`/activity/view/${user.id}/${id}`);
            // Check if user purchased this product
            await checkUserPurchaseStatus(user.id, id);
          } catch (activityError) {
            console.error("Activity tracking failed:", activityError);
          }
        }

        // Fetch bulk pricing information
        try {
          const bulkResponse = await API.get(`/products/${id}/bulk-pricing`);
          setBulkPricingInfo({
            bulkPricingEnabled: bulkResponse.data.length > 0,
            tiers: bulkResponse.data,
          });
        } catch (bulkError) {
          console.error("Bulk pricing fetch error:", bulkError);
          setBulkPricingInfo({
            bulkPricingEnabled: false,
            tiers: [],
          });
        }

        // Fetch reviews
        await fetchReviews();

        // Fetch AI recommendations
        try {
          const recommendationsResponse = await API.get(
            `/ai/products/recommend/product/${id}`
          );
          setRecommendedProducts(recommendationsResponse.data.data || []);
          console.log("Fetch Data from Ai");
        } catch (aiError) {
          console.error("AI recommendations fetch error:", aiError);
          try {
            const fallbackRecs = await API.get(
              `/recommendations/product/${id}`
            );
            setRecommendedProducts(fallbackRecs.data.recommendedProducts || []);
          } catch (fallbackError) {
            console.error("Fallback recommendations failed:", fallbackError);
            setRecommendedProducts([]);
          }
        }
      } catch (err) {
        console.error("Product fetch error:", err);
        setError("Failed to load product details");
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Check if user purchased the product
  const checkUserPurchaseStatus = async (userId, productId) => {
    try {
      console.log("Checking purchase status for:", { userId, productId });

      const response = await API.get(
        `/activity/user/${userId}/purchased-products`
      );
      const purchasedProducts = response.data.purchasedProducts || [];

      console.log("Purchased products:", purchasedProducts);
      console.log(
        "Has purchased this product?",
        purchasedProducts.includes(productId)
      );

      setUserPurchasedProducts(purchasedProducts);
      setHasPurchasedProduct(purchasedProducts.includes(productId));
    } catch (error) {
      console.error("Error checking purchase status:", error);
      setHasPurchasedProduct(false);
    }
  };

  // Fetch reviews function
  const fetchReviews = async () => {
    try {
      const reviewsResponse = await API.get(`/reviews/${id}`);
      const reviewsData = reviewsResponse.data;
      if (reviewsData && reviewsData.reviews) {
        setReviews(reviewsData.reviews);
        setAverageRating(parseFloat(reviewsData.averageRating) || 0);
      } else {
        setReviews([]);
        setAverageRating(0);
      }
    } catch (reviewError) {
      if (reviewError.response?.status === 404) {
        setReviews([]);
        setAverageRating(0);
      } else {
        console.error("Reviews fetch error:", reviewError);
        setReviews([]);
        setAverageRating(0);
      }
    }
  };

  // Handle successful review submission
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    fetchReviews(); // Refresh reviews
    toast.success("Thank you for your review!");
  };

  const handleAddToCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("Please login to add items to cart");
        navigate("/login");
        return;
      }

      const response = await API.post("/cart", {
        userId: user.id,
        productId: id,
        quantity: quantity,
      });

      toast.success("Product added to cart!");
    } catch (err) {
      console.error("Cart error:", err.response?.data || err.message);
      toast.error("Failed to add product to cart");
    }
  };

  const renderStars = (rating, size = 16) => {
    const actualRating = rating || 0;
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        size={size}
        className={
          index < Math.floor(actualRating)
            ? "text-yellow-400"
            : "text-neutral-300"
        }
      />
    ));
  };

  // Calculate current pricing based on quantity
  const calculateCurrentPricing = () => {
    if (!product?.price) {
      return {
        unitPrice: 0,
        totalPrice: 0,
        appliedTier: null,
        discountAmount: 0,
        savingsPercentage: 0,
      };
    }

    const getBasePrice = () => {
      return product.salePrice && product.salePrice < product.price
        ? product.salePrice
        : product.price;
    };

    const basePrice = getBasePrice();

    if (
      !bulkPricingInfo?.bulkPricingEnabled ||
      !bulkPricingInfo.tiers ||
      bulkPricingInfo.tiers.length === 0
    ) {
      return {
        unitPrice: basePrice,
        totalPrice: basePrice * quantity,
        appliedTier: null,
        discountAmount: 0,
        savingsPercentage: 0,
      };
    }

    const sortedTiers = [...bulkPricingInfo.tiers].sort(
      (a, b) => b.minQuantity - a.minQuantity
    );
    const applicableTier = sortedTiers.find(
      (tier) => quantity >= tier.minQuantity
    );

    if (!applicableTier) {
      return {
        unitPrice: basePrice,
        totalPrice: basePrice * quantity,
        appliedTier: null,
        discountAmount: 0,
        savingsPercentage: 0,
      };
    }

    const discountAmount =
      applicableTier.discountType === "percentage"
        ? basePrice * (applicableTier.discountValue / 100)
        : applicableTier.discountValue;

    const finalUnitPrice = basePrice - discountAmount;
    const totalDiscountFromOriginal =
      (product.price - finalUnitPrice) * quantity;

    return {
      unitPrice: finalUnitPrice,
      totalPrice: finalUnitPrice * quantity,
      appliedTier: applicableTier,
      discountAmount: discountAmount * quantity,
      totalDiscountFromOriginal: totalDiscountFromOriginal,
      savingsPercentage:
        (totalDiscountFromOriginal / (product.price * quantity)) * 100,
    };
  };

  const currentPricing = useMemo(
    () => calculateCurrentPricing(),
    [product, bulkPricingInfo, quantity]
  );

  // Get next tier information
  const getNextTierInfo = () => {
    if (!bulkPricingInfo?.bulkPricingEnabled || !bulkPricingInfo.tiers)
      return null;

    const sortedTiers = [...bulkPricingInfo.tiers].sort(
      (a, b) => a.minQuantity - b.minQuantity
    );
    const nextTier = sortedTiers.find((tier) => tier.minQuantity > quantity);

    return nextTier;
  };

  const nextTier = useMemo(
    () => getNextTierInfo(),
    [bulkPricingInfo, quantity]
  );

  // Calculate display price
  const getDisplayPrice = () => {
    if (!product)
      return { price: 0, isDiscounted: false, discountPercentage: 0 };

    const hasSaleDiscount =
      product.salePrice && product.salePrice < product.price;
    const displayPrice = hasSaleDiscount ? product.salePrice : product.price;
    const discountPercentage = hasSaleDiscount
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

    return {
      price: displayPrice,
      isDiscounted: hasSaleDiscount,
      discountPercentage: discountPercentage,
    };
  };

  const displayPrice = getDisplayPrice();

  // Review Button Component
  const ReviewButton = ({ variant = "primary" }) => {
    if (!hasPurchasedProduct) return null;

    const baseClasses =
      "flex items-center justify-center px-4 py-3 rounded-lg transition-colors text-sm font-medium";

    const variants = {
      primary: "bg-green-600 text-white hover:bg-green-700",
      secondary: "border border-green-600 text-green-600 hover:bg-green-50",
    };

    return (
      <button
        onClick={() => setShowReviewForm(true)}
        className={`${baseClasses} ${variants[variant]}`}
      >
        <FaEdit className="mr-2" />
        Write Review
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-red-500" />
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm sm:text-base"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Navigation */}
      <div className="bg-white border-b border-neutral-200">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-neutral-600 hover:text-neutral-800 text-sm sm:text-base"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            <nav className="flex ml-4 space-x-2 text-xs sm:text-sm overflow-x-auto">
              <Link
                to="/"
                className="text-neutral-500 hover:text-neutral-700 whitespace-nowrap"
              >
                Home
              </Link>
              <span className="text-neutral-300">/</span>
              <Link
                to={`/products?category=${product.category?._id}`}
                className="text-neutral-500 hover:text-neutral-700 whitespace-nowrap"
              >
                {product.category?.name || "Products"}
              </Link>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-900 whitespace-nowrap truncate max-w-[120px] sm:max-w-none">
                {product.name}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="px-3 py-6 sm:py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:items-start">
          {/* Product Images - Left Column */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative aspect-w-1 aspect-h-1 bg-neutral-200 h-64 sm:h-80 lg:h-96 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={
                      product.images[selectedImage]?.startsWith("http")
                        ? product.images[selectedImage]
                        : `https://nextrade-backend-production-a486.up.railway.app/${product.images[selectedImage]}`
                    }
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-neutral-500 text-sm sm:text-base">
                    No Image Available
                  </span>
                )}
                {/* Bulk Pricing Badge */}
                {bulkPricingInfo?.bulkPricingEnabled && (
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <div className="bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-lg flex items-center text-xs sm:text-sm">
                      <FaLayerGroup className="mr-1 sm:mr-2" />
                      <span className="font-semibold">Bulk Deals</span>
                    </div>
                  </div>
                )}
                {/* Sale Discount Badge */}
                {displayPrice.isDiscounted && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <div className="bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-lg flex items-center text-xs sm:text-sm">
                      <FaPercentage className="mr-1 sm:mr-2" />
                      <span className="font-semibold">
                        {displayPrice.discountPercentage}% OFF
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-neutral-200 rounded cursor-pointer hover:opacity-75 flex items-center justify-center border-2 ${
                      selectedImage === index
                        ? "border-primary-600"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={
                        image.startsWith("http")
                          ? image
                          : `https://nextrade-backend-production-a486.up.railway.app/${image}`
                      }
                      alt={`${product.name} ${index + 1}`}
                      className="object-cover w-full h-full rounded"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Seller Information */}
            <SellerInfo product={product} />
          </div>

          {/* Product Info - Right Column with Sticky */}
          <div className="lg:sticky lg:top-4">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 text-center sm:text-left">
                  {product.name}
                </h1>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {bulkPricingInfo?.bulkPricingEnabled && (
                    <div className="flex items-center bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs">
                      <FaTag className="mr-1" />
                      Bulk Discounts
                    </div>
                  )}
                  {displayPrice.isDiscounted && (
                    <div className="flex items-center bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full text-xs">
                      <FaPercentage className="mr-1" />
                      On Sale
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start mt-2">
                <div className="flex">{renderStars(averageRating, 14)}</div>
                <span className="ml-2 text-neutral-600 text-sm sm:text-base">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>

              {/* Price Display */}
              <div className="mt-4">
                {product.salePrice && product.salePrice < product.price ? (
                  currentPricing.appliedTier ? (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <span className="text-2xl sm:text-3xl font-bold text-green-600 text-center sm:text-left">
                          Rs {currentPricing.unitPrice.toFixed(2)}
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <span className="text-lg sm:text-xl text-neutral-500 line-through text-center sm:text-left">
                            Rs {product.price}
                          </span>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium text-center sm:text-left">
                            {Math.round(
                              ((product.price - currentPricing.unitPrice) /
                                product.price) *
                                100
                            )}
                            % OFF
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-green-600 text-center sm:text-left">
                        Extra bulk discount applied! Total savings:{" "}
                        {(
                          ((product.price - currentPricing.unitPrice) /
                            product.price) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <span className="text-2xl sm:text-3xl font-bold text-green-600 text-center sm:text-left">
                        Rs {product.salePrice}
                      </span>
                      <span className="text-lg sm:text-xl text-neutral-500 line-through text-center sm:text-left">
                        Rs {product.price}
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium text-center sm:text-left">
                        {Math.round(
                          ((product.price - product.salePrice) /
                            product.price) *
                            100
                        )}
                        % OFF
                      </span>
                    </div>
                  )
                ) : currentPricing.appliedTier ? (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <span className="text-2xl sm:text-3xl font-bold text-green-600 text-center sm:text-left">
                        Rs {currentPricing.unitPrice.toFixed(2)}
                      </span>
                      <span className="text-lg sm:text-xl text-neutral-500 line-through text-center sm:text-left">
                        Rs {product.price}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium text-center sm:text-left">
                        {currentPricing.savingsPercentage.toFixed(1)}% OFF
                      </span>
                    </div>
                    <div className="text-sm text-green-600 text-center sm:text-left">
                      Bulk discount applied!
                    </div>
                  </div>
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-primary-600 text-center sm:text-left block">
                    Rs {product.price}
                  </span>
                )}
              </div>

              {/* Next Tier Suggestion */}
              {nextTier && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center text-orange-700 text-xs sm:text-sm justify-center sm:justify-start">
                    <FaBox className="mr-2 flex-shrink-0" />
                    Add {nextTier.minQuantity - quantity} more to get{" "}
                    {nextTier.discountValue}% off (Rs{" "}
                    {(
                      displayPrice.price -
                      displayPrice.price * (nextTier.discountValue / 100)
                    ).toFixed(2)}{" "}
                    per unit)
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-neutral-600 text-sm sm:text-base text-center sm:text-left">
                  {product.description}
                </p>
              </div>

              <div className="mt-4 sm:mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-700 text-sm sm:text-base">
                    Category:
                  </span>
                  <span className="text-neutral-600 text-sm sm:text-base">
                    {product.category?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-700 text-sm sm:text-base">
                    Stock:
                  </span>
                  <span
                    className={`font-medium text-sm sm:text-base ${
                      product.stock > 10 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.stock} units available
                  </span>
                </div>
                {bulkPricingInfo?.bulkPricingEnabled && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-700 text-sm sm:text-base">
                      Bulk Pricing:
                    </span>
                    <span className="text-green-600 font-medium text-sm sm:text-base">
                      Available
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mt-4 sm:mt-6">
                <label className="block mb-2 font-medium text-neutral-700 text-sm sm:text-base text-center sm:text-left">
                  Quantity
                </label>
                <div className="flex items-center justify-center sm:justify-start">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="p-2 sm:p-3 border border-neutral-300 rounded-l-lg hover:bg-neutral-50 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12"
                    disabled={quantity <= 1}
                  >
                    <FaMinus size={12} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-12 sm:w-16 h-10 sm:h-12 py-2 text-center border-y border-neutral-300 focus:outline-none text-sm sm:text-base"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() =>
                      setQuantity((prev) => Math.min(product.stock, prev + 1))
                    }
                    className="p-2 sm:p-3 border border-neutral-300 rounded-r-lg hover:bg-neutral-50 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12"
                    disabled={quantity >= product.stock}
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              </div>

              {/* Savings Calculator */}
              <SavingsCalculator
                bulkPricingInfo={bulkPricingInfo}
                currentPricing={currentPricing}
                product={product}
                quantity={quantity}
                nextTier={nextTier}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 px-4 sm:px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  <FaShoppingCart className="mr-2" />
                  {product.stock === 0
                    ? "Out of Stock"
                    : `Add to Cart - Rs ${currentPricing.totalPrice.toFixed(
                        2
                      )}`}
                </button>
                {/* Review Button */}
                <ReviewButton variant="primary" />
              </div>

              {/* Bulk Pricing Table */}
              <BulkPricingTable
                bulkPricingInfo={bulkPricingInfo}
                quantity={quantity}
                product={product}
              />
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 sm:mt-12">
          <div className="border-b border-neutral-200 overflow-x-auto">
            <nav className="flex -mb-px min-w-max">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-3 sm:py-4 px-4 sm:px-6 font-medium border-b-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "description"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-neutral-600 hover:text-neutral-800"
                }`}
              >
                Description
              </button>
              {bulkPricingInfo?.bulkPricingEnabled && (
                <button
                  onClick={() => setActiveTab("bulk")}
                  className={`py-3 sm:py-4 px-4 sm:px-6 font-medium border-b-2 text-sm sm:text-base whitespace-nowrap ${
                    activeTab === "bulk"
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-neutral-600 hover:text-neutral-800"
                  }`}
                >
                  Bulk Pricing
                </button>
              )}
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-3 sm:py-4 px-4 sm:px-6 font-medium border-b-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "reviews"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-neutral-600 hover:text-neutral-800"
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          <div className="py-4 sm:py-6">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-neutral-700 text-sm sm:text-base">
                  {product.description}
                </p>

                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4 sm:mt-6">
                    <h4 className="font-medium text-neutral-800 text-sm sm:text-base">
                      Tags:
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-secondary-200 text-neutral-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "bulk" && bulkPricingInfo?.bulkPricingEnabled && (
              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-6 bg-white rounded-lg shadow">
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-3 sm:mb-4">
                    Bulk Pricing Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2 sm:mb-3 text-sm sm:text-base">
                        How Bulk Pricing Works
                      </h4>
                      <ul className="space-y-2 text-neutral-700 text-sm sm:text-base">
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            Buy more, save more with quantity-based discounts
                          </span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Discounts automatically apply at checkout</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-600 mr-2 mt=0.5 flex-shrink-0" />
                          <span>
                            Perfect for businesses, events, and resellers
                          </span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            No minimum order value - just quantity based
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2 sm:mb-3 text-sm sm:text-base">
                        Pricing Tiers
                      </h4>
                      <BulkPricingTable
                        bulkPricingInfo={bulkPricingInfo}
                        quantity={quantity}
                        product={product}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Review Button in Reviews Tab */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-800">
                    Customer Reviews ({reviews.length})
                  </h3>
                  <ReviewButton variant="secondary" />
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div
                        key={review._id}
                        className="p-4 sm:p-6 bg-white rounded-lg shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                          <div className="flex items-center">
                            <div className="flex">
                              {renderStars(review.rating, 14)}
                            </div>
                            <span className="ml-2 text-sm text-neutral-600">
                              by {review.user?.name || "Anonymous"}
                            </span>
                          </div>
                          <span className="text-sm text-neutral-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-neutral-700 text-sm sm:text-base mt-2">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 bg-white rounded-lg shadow text-center">
                      <FaExclamationTriangle className="mx-auto mb-3 text-2xl text-neutral-400" />
                      <p className="text-neutral-600 text-sm sm:text-base">
                        No reviews yet for this product.
                      </p>
                      <p className="text-neutral-500 text-xs sm:text-sm mt-1">
                        {hasPurchasedProduct
                          ? "Be the first to share your experience!"
                          : "Purchase this product to leave a review"}
                      </p>
                      {hasPurchasedProduct && (
                        <div className="mt-4">
                          <ReviewButton variant="primary" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommended Products */}
        {recommendedProducts.length > 0 && (
          <section className="mt-8 sm:mt-12">
            <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-neutral-800 text-center sm:text-left">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recommendedProducts.slice(0, 4).map((recommendedProduct) => (
                <div
                  key={recommendedProduct._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-w-16 aspect-h-9 bg-neutral-200 h-32 flex items-center justify-center">
                    {recommendedProduct.images &&
                    recommendedProduct.images.length > 0 ? (
                      <img
                        src={
                          recommendedProduct.images[0]?.startsWith("http")
                            ? recommendedProduct.images[0]
                            : `https://nextrade-backend-production-a486.up.railway.app/${recommendedProduct.images[0]}`
                        }
                        alt={recommendedProduct.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-neutral-500 text-sm">No Image</span>
                    )}
                    {recommendedProduct.bulkPricingEnabled && (
                      <div className="flex absolute top-2 justify-between right-2 left-2">
                        <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full text-center">
                          Bulk Discounts
                        </div>
                        <div className="bg-green-600 text-white p-1 rounded-full">
                          <FaLayerGroup size={12} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-neutral-800 text-sm line-clamp-2 mb-2">
                      {recommendedProduct.name}
                    </h3>

                    <div className="flex items-center justify-between mt-auto mb-3">
                      <span className="font-bold text-primary-600 text-sm sm:text-base">
                        Rs {recommendedProduct.price}
                      </span>
                      <div className="flex items-center text-xs text-neutral-600">
                        {renderStars(recommendedProduct.averageRating || 0, 12)}
                      </div>
                    </div>

                    <Link
                      to={`/product/${recommendedProduct._id}`}
                      className="w-full flex items-center justify-center px-3 py-2 text-xs sm:text-sm border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                      <FaEye className="mr-1" size={12} />
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          productId={id}
          productName={product.name}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
