import React, { useState, useEffect, useRef } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaStore,
  FaClock,
  FaRobot,
  FaSync,
  FaExclamationTriangle,
  FaEye,
  FaMousePointer,
  FaPercentage,
  FaFire,
  FaCrown,
  FaGem,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import API from "../../../api/axiosInstance";

const BuyerAdCarousel = () => {
  const [ads, setAds] = useState([]);
  const [error, setError] = useState(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [recommendationSource, setRecommendationSource] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [trackedImpressions, setTrackedImpressions] = useState(new Set());
  const [expandedDescription, setExpandedDescription] = useState(false);
  const carouselRef = useRef(null);

  const fetchAdsRecommendations = async () => {
    try {
      setError(null);

      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.id) {
        try {
          const response = await API.post(`/ai/ads/recommend_ads/${user.id}`);
          if (response.data?.recommendedAds?.length > 0) {
            setAds(response.data.recommendedAds);
            setRecommendationSource(response.data.source);
            console.log("Ai picked");
            return;
          }
        } catch (aiError) {
          console.warn("AI ads failed, trying fallback:", aiError);
        }
      }

      const fallbackResponse = await API.get("/ads");
      setAds(fallbackResponse.data || []);
      setRecommendationSource("popular");
    } catch (err) {
      console.error("Error fetching ads:", err);
      setError(err.message);
      setAds([]);
    }
  };

  useEffect(() => {
    fetchAdsRecommendations();
  }, []);

  const getUserFingerprint = () => {
    let fingerprint = localStorage.getItem("userFingerprint");
    if (!fingerprint) {
      fingerprint =
        navigator.userAgent + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("userFingerprint", fingerprint);
    }
    return fingerprint;
  };

  const recordImpression = async (adId) => {
    try {
      if (!adId || trackedImpressions.has(adId)) return;

      const userFingerprint = getUserFingerprint();

      const response = await API.post(
        `/ads/${adId}/impression`,
        {},
        {
          headers: {
            "User-Fingerprint": userFingerprint,
          },
        }
      );

      if (response.data.isNewImpression) {
        setTrackedImpressions((prev) => new Set([...prev, adId]));
      }
    } catch (error) {
      console.error("Error recording impression:", error);
    }
  };

  const refreshAdData = async (adId) => {
    try {
      const response = await API.get(`/ads/${adId}`);
      setAds((prevAds) =>
        prevAds.map((ad) =>
          ad._id === adId ? { ...ad, ...response.data } : ad
        )
      );
    } catch (error) {
      console.error("Error refreshing ad data:", error);
    }
  };

  const recordClick = async (adId) => {
    try {
      if (!adId) return;

      const userFingerprint = getUserFingerprint();

      const response = await API.post(
        `/ads/${adId}/click`,
        {},
        {
          headers: {
            "User-Fingerprint": userFingerprint,
          },
        }
      );
    } catch (error) {
      console.error("Error recording click:", error);
    }
  };

  useEffect(() => {
    if (ads.length > 0) {
      recordImpression(ads[0]._id);
    }
  }, [ads.length]);

  // Auto-rotate ads
  useEffect(() => {
    if (!isAutoPlaying || ads.length <= 1) return;
    const interval = setInterval(nextAd, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, ads.length]);

  const nextAd = () => {
    setCurrentAdIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % ads.length;
      if (ads[newIndex] && !trackedImpressions.has(ads[newIndex]._id)) {
        recordImpression(ads[newIndex]._id);
      }
      return newIndex;
    });
    // Reset description expansion when changing ads
    setExpandedDescription(false);
  };

  const prevAd = () => {
    setCurrentAdIndex((prevIndex) => {
      const newIndex = (prevIndex - 1 + ads.length) % ads.length;
      if (ads[newIndex] && !trackedImpressions.has(ads[newIndex]._id)) {
        recordImpression(ads[newIndex]._id);
      }
      return newIndex;
    });
    // Reset description expansion when changing ads
    setExpandedDescription(false);
  };

  const goToAd = (index) => {
    if (ads[index] && !trackedImpressions.has(ads[index]._id)) {
      recordImpression(ads[index]._id);
    }
    setCurrentAdIndex(index);
    // Reset description expansion when changing ads
    setExpandedDescription(false);
  };

  const handleAdClick = async (ad) => {
    await recordClick(ad._id);
    if (ad.link) {
      window.open(ad.link, "_blank");
    }
  };

  useEffect(() => {
    setTrackedImpressions(new Set());
  }, [ads]);

  const handleRefresh = async () => {
    await fetchAdsRecommendations();
  };

  const getRemainingDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getEngagementData = (ad) => {
    const impressions = ad.impressions || 0;
    const clicks = ad.clicks || 0;
    let ctr = "0.0";

    if (impressions > 0 && clicks > 0) {
      ctr = ((clicks / impressions) * 100).toFixed(1);
    }

    let engagementLevel = "Low";
    let engagementColor = "text-gray-700";

    if (parseFloat(ctr) > 5) {
      engagementLevel = "Hot";
      engagementColor = "text-red-500";
    } else if (parseFloat(ctr) > 2) {
      engagementLevel = "Trending";
      engagementColor = "text-orange-500";
    }

    return {
      impressions,
      clicks,
      ctr,
      engagementLevel,
      engagementColor,
    };
  };

  const getImageUrl = (imageData) => {
    if (!imageData) {
      return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop";
    }

    // If it's already a URL
    if (typeof imageData === "string") {
      // Check if it's a Cloudinary URL
      if (imageData.includes("cloudinary.com")) {
        return imageData;
      }
      if (imageData.startsWith("http")) return imageData;
      if (imageData.startsWith("/uploads/")) {
        return `https://nextrade-backend-production-a486.up.railway.app${imageData}`;
      }
      return `https://nextrade-backend-production-a486.up.railway.app/uploads/${imageData}`;
    }

    // If it's an object with url property (Cloudinary object)
    if (typeof imageData === "object" && imageData !== null) {
      if (imageData.url) return getImageUrl(imageData.url);
      if (imageData.secure_url) return imageData.secure_url;
      if (imageData.publicId) {
        // Convert Cloudinary public_id to URL
        return `https://res.cloudinary.com/${
          process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "cloud-name"
        }/image/upload/${imageData.publicId}`;
      }
      if (imageData.path) return getImageUrl(imageData.path);
    }

    // If it's an array (images array from backend)
    if (Array.isArray(imageData) && imageData.length > 0) {
      // Get first image from array
      return getImageUrl(imageData[0]);
    }

    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop";
  };

  // Get ad image
  const getAdImage = (ad) => {
    if (!ad) return null;

    // Try different possible image properties in order
    const possibleImageSources = [
      ad.images,
      ad.image,
      ad.imageUrl,
      ad.image_url,
    ].filter(Boolean);

    for (const source of possibleImageSources) {
      const url = getImageUrl(source);
      if (url) return url;
    }

    return null;
  };

  const getSellerName = (ad) => {
    return ad.seller?.name || ad.seller?.businessName || "Verified Partner";
  };

  const toggleDescription = () => {
    setExpandedDescription(!expandedDescription);
  };

  // Add inline styles for description
  const descriptionStyles = `
    .description-container {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: ${expandedDescription ? "unset" : "2"};
      -webkit-box-orient: vertical;
      line-height: 1.5;
      max-height: ${expandedDescription ? "none" : "3em"};
      transition: max-height 0.3s ease;
    }
    
    .read-more-btn {
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      font-weight: 600;
      font-size: 0.875rem;
      transition: color 0.2s ease;
    }
  `;

  if (error && ads.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-white to-red-50/30 backdrop-blur-sm rounded-2xl border border-red-200 shadow-lg p-8 text-center">
        <FaExclamationTriangle className="text-3xl text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Temporary Interruption
        </h3>
        <p className="text-gray-600 mb-6">
          We're having trouble loading promotions
        </p>
        <button
          onClick={handleRefresh}
          className="px-6 py-3 bg-gradient-primary-vertical text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center mx-auto"
        >
          <FaSync className="mr-2" />
          Refresh Offers
        </button>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-blue-50/50 to-indigo-100/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-blue-300/50 p-10 text-center">
        <div className="w-20 h-20 bg-gradient-primary-vertical rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FaGem className="text-2xl text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Premium Promotions
        </h3>
        <p className="text-gray-600 text-lg mb-4">
          Exclusive deals coming soon!
        </p>
        <div className="flex justify-center space-x-1 text-yellow-400 text-xl">
          <FaCrown />
          <FaCrown />
          <FaCrown />
        </div>
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];
  const remainingDays = getRemainingDays(currentAd.endDate);
  const engagement = getEngagementData(currentAd);
  const sellerName = getSellerName(currentAd);

  return (
    <>
      <style>{descriptionStyles}</style>
      <div
        className="w-auto bg-gradient-to-br from-white/80 to-blue-50/30 backdrop-blur-sm rounded-2xl border border-gray-300/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
        ref={carouselRef}
      >
        {/* Main Content */}
        <div className="relative">
          <div className="absolute top-4 right-4 z-20">
            <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAutoPlaying(!isAutoPlaying);
                }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all backdrop-blur-sm border shadow-lg z-50 ${
                  isAutoPlaying
                    ? "bg-green-500/90 text-white border-green-400/50 hover:bg-green-600/90"
                    : "bg-gray-500/70 text-white border-gray-400/50 hover:bg-gray-600/70"
                }`}
              >
                {isAutoPlaying ? "AUTO" : "MANUAL"}
              </button>

              <div className="bg-white/20 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-full border border-white/30">
                <span className="text-white font-bold text-xs md:text-sm">
                  {currentAdIndex + 1}/{ads.length}
                </span>
              </div>
            </div>
          </div>

          <div
            className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => handleAdClick(currentAd)}
          >
            {/* Blurred background image - Fixed brightness */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${getAdImage(currentAd)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(20px) brightness(1)",
                transform: "scale(1.1)",
              }}
            >
              {/* Lighter overlay for better readability */}
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Main image container */}

            <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96  overflow-hidden cursor-pointer group">
              <div className="absolute inset-0  flex items-center justify-center">
                <div className="relative w-full overflow-hidden flex items-center justify-center">
                  <img
                    src={getAdImage(currentAd)}
                    alt={currentAd.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Top Left Metrics */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
              <div className="bg-black/60 backdrop-blur-md rounded-xl md:rounded-2xl px-2 py-1 md:px-4 md:py-3 border border-white/20 shadow-2xl">
                <div className="grid grid-cols-3 gap-1 md:gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <FaEye className="text-blue-300 text-xs md:text-base mb-0.5 md:mb-1" />
                    <span className="text-white font-bold text-xs md:text-sm">
                      {engagement.impressions}
                    </span>
                    <span className="text-white/70 text-[10px] md:text-xs">
                      Views
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FaMousePointer className="text-green-300 text-xs md:text-base mb-0.5 md:mb-1" />
                    <span className="text-white font-bold text-xs md:text-sm">
                      {engagement.clicks}
                    </span>
                    <span className="text-white/70 text-[10px] md:text-xs">
                      Clicks
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FaPercentage className="text-purple-300 text-xs md:text-base mb-0.5 md:mb-1" />
                    <span className="text-white font-bold text-xs md:text-sm">
                      {engagement.ctr}%
                    </span>
                    <span className="text-white/70 text-[10px] md:text-xs">
                      CTR
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Overlay - Desktop (hidden on mobile) */}
            <div
              className={`hidden md:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 md:p-6 transition-transform duration-500 ${
                isHovered ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 mb-2 md:mb-4">
                  <div className="flex flex-wrap gap-1 md:gap-3 md:items-center">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-2 py-1 md:px-4 md:py-2 rounded-full font-semibold text-xs md:text-sm shadow-lg">
                      {currentAd.targetCategory?.name || "PREMIUM"}
                    </span>
                    <div className="flex items-center text-white/90 text-xs md:text-sm">
                      <FaStore className="mr-1 md:mr-2 text-blue-300 text-xs md:text-sm" />
                      <span className="font-semibold truncate max-w-[120px] md:max-w-none">
                        {sellerName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 md:space-x-2 bg-white/20 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-full">
                    <FaClock className="text-yellow-300 text-xs md:text-sm" />
                    <span className="text-white font-bold text-xs md:text-sm">
                      {remainingDays} DAYS LEFT
                    </span>
                  </div>
                </div>

                <h2 className="text-lg md:text-2xl lg:text-3xl font-black text-white mb-1 md:mb-3 leading-tight line-clamp-1 md:line-clamp-2">
                  {currentAd.title}
                </h2>

                {/* Enhanced Description Section */}
                <div className="mb-3 md:mb-6">
                  <p
                    className="text-white/90 text-sm md:text-base lg:text-lg leading-relaxed description-container"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {currentAd.description}
                  </p>

                  {currentAd.description &&
                    currentAd.description.length > 100 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDescription();
                        }}
                        className="read-more-btn text-blue-300 hover:text-blue-200"
                      >
                        {expandedDescription ? (
                          <>
                            <FaChevronUp className="mr-1" />
                            Read Less
                          </>
                        ) : (
                          <>
                            <FaChevronDown className="mr-1" />
                            Read More
                          </>
                        )}
                      </button>
                    )}
                </div>

                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="flex items-center space-x-1 md:space-x-2 bg-white/20 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-full">
                      <FaFire className="text-green-300 text-xs md:text-sm" />
                      <span className="text-green-300 font-bold text-xs md:text-sm">
                        {engagement.engagementLevel}
                      </span>
                      <span className="text-white/80 text-xs md:text-sm hidden sm:inline">
                        Engagement
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 md:space-x-3 bg-gradient-primary-vertical px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl shadow-2xl group-hover:from-green-600 group-hover:to-emerald-700 transition-all duration-300">
                    <FaExternalLinkAlt className="text-white text-sm md:text-lg" />
                    <span className="text-white font-bold text-sm md:text-lg">
                      Shop Now
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {ads.length > 1 && isHovered && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevAd();
                  }}
                  className="hidden md:flex absolute left-1 md:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center shadow-2xl hover:bg-white/30 transition-all duration-300 hover:scale-110 border border-white/30"
                >
                  <FaChevronLeft className="text-white text-sm md:text-base" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextAd();
                  }}
                  className="hidden md:flex absolute right-1 md:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center shadow-2xl hover:bg-white/30 transition-all duration-300 hover:scale-110 border border-white/30"
                >
                  <FaChevronRight className="text-white text-sm md:text-base" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Details Section (Always visible on mobile) */}
          <div className="md:hidden bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 p-4 text-white">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-3 py-1 rounded-full font-semibold text-xs shadow-lg">
                  {currentAd.targetCategory?.name || "PREMIUM"}
                </span>
                <div className="flex items-center text-white/90 text-xs">
                  <FaStore className="mr-2 text-blue-300" />
                  <span className="font-semibold truncate max-w-[100px]">
                    {sellerName}
                  </span>
                </div>
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <FaClock className="text-yellow-300 text-xs" />
                  <span className="text-white font-bold text-xs">
                    {remainingDays} DAYS LEFT
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-black text-white leading-tight">
                {currentAd.title}
              </h2>

              <div className="mb-2">
                <p className="text-white/90 text-sm leading-relaxed description-container">
                  {currentAd.description}
                </p>

                {currentAd.description &&
                  currentAd.description.length > 100 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription();
                      }}
                      className="text-blue-300 hover:text-blue-200 font-semibold text-sm mt-1 flex items-center"
                    >
                      {expandedDescription ? (
                        <>
                          <FaChevronUp className="mr-1" />
                          Read Less
                        </>
                      ) : (
                        <>
                          <FaChevronDown className="mr-1" />
                          Read More
                        </>
                      )}
                    </button>
                  )}
              </div>

              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <FaFire className="text-green-300" />
                    <span className="text-green-300 font-bold text-xs">
                      {engagement.engagementLevel}
                    </span>
                    <span className="text-white/80 text-xs">Engagement</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevAd();
                    }}
                    className="flex-1 bg-white/20 backdrop-blur-md rounded-full py-2 flex items-center justify-center shadow-lg border border-white/30"
                  >
                    <FaChevronLeft className="text-white" />
                  </button>

                  <button
                    onClick={() => handleAdClick(currentAd)}
                    className="flex-3 bg-gradient-primary-vertical px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center space-x-2"
                  >
                    <FaExternalLinkAlt className="text-white" />
                    <span className="text-white font-bold text-sm">
                      Shop Now
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextAd();
                    }}
                    className="flex-1 bg-white/20 backdrop-blur-md rounded-full py-2 flex items-center justify-center shadow-lg border border-white/30"
                  >
                    <FaChevronRight className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          {ads.length > 1 && (
            <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 md:space-x-2">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToAd(index);
                  }}
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 shadow-lg ${
                    index === currentAdIndex
                      ? "bg-white w-4 md:w-6 shadow-white/50"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-gray-50/80 to-blue-100/50 backdrop-blur-sm border-t border-gray-300/50">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <FaCrown className="text-white text-xs md:text-sm" />
              </div>
              <div>
                <span className="text-gray-700 font-semibold text-xs md:text-sm">
                  Premium Ad
                </span>
                <span className="text-gray-500 text-[10px] md:text-xs block">
                  By {sellerName}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-1 md:flex-row md:items-center md:space-x-4 md:space-y-0">
              {recommendationSource === "ai" && (
                <div className="flex items-center space-x-1 md:space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-full shadow-lg">
                  <FaRobot className="text-xs md:text-sm" />
                  <span className="text-xs md:text-sm font-semibold">
                    AI Personalized
                  </span>
                </div>
              )}
              <span className="text-gray-500 text-xs md:text-sm font-medium text-center md:text-left">
                Powered By: NexTrade
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyerAdCarousel;
