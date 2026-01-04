import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaPause,
  FaPlay,
  FaSearch,
  FaMoneyBillWave,
  FaClock,
  FaImage,
  FaTimes,
  FaSpinner,
  FaUserClock,
  FaExclamationTriangle,
  FaCreditCard,
  FaUniversity,
  FaCheckCircle,
  FaHourglassHalf,
  FaChartLine,
  FaEye,
  FaMousePointer,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaBan,
  FaExclamationCircle,
  FaBox,
  FaTruck,
  FaFilter,
  FaUser,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import CreateAd from "./createAd";
import API from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import PaymentModal from "./payment";

const SellerAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateAd, setShowCreateAd] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAdForPayment, setSelectedAdForPayment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [selectedAdForAnalytics, setSelectedAdForAnalytics] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    pendingAds: 0,
    totalSpent: 0,
    totalImpressions: 0,
    totalClicks: 0,
    averageCTR: 0,
  });

  // Check user role and profile status on component mount
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Decode token to get role
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        const currentRole = decoded.role;
        setUserRole(currentRole);

        console.log("Current user role:", currentRole);

        if (["seller_pending", "seller_approved"].includes(currentRole)) {
          try {
            const profileResponse = await API.get("/profile/me");
            const profileData = profileResponse.data;
            const isComplete = profileData.isProfileComplete || false;
            setProfileComplete(isComplete);

            console.log("Profile complete status:", isComplete);
          } catch (profileError) {
            console.error("Profile fetch error:", profileError);
            setProfileComplete(false);
          }
        }
      } catch (error) {
        console.error("User status check error:", error);
      }
    };

    checkUserStatus();
  }, []);

  // Fetch ads and payment status
  const fetchAds = async () => {
    if (!userRole || !profileComplete) return;

    setLoading(true);
    try {
      const response = await API.get(`/ads/seller/me`);
      console.log("Ads API Response:", response.data);

      let adsData = response.data || [];
      if (!Array.isArray(adsData)) {
        console.warn("Ads data is not an array:", adsData);
        adsData = [];
      }

      // Log each ad to see structure
      adsData.forEach((ad, index) => {
        console.log(`Ad ${index}:`, {
          id: ad._id,
          title: ad.title,
          images: ad.images,
          payment: ad.payment,
          status: ad.status,
        });
      });

      setAds(adsData);

      // Fetch payment status for each ad
      const paymentStatusPromises = adsData.map(async (ad) => {
        try {
          if (ad.payment && ad.payment._id) {
            // If payment is already populated
            console.log(`Ad ${ad._id} has payment:`, ad.payment);
            return {
              adId: ad._id,
              payment: ad.payment,
            };
          } else if (ad.status === "approved") {
            // Try to fetch payment separately
            console.log(`Fetching payment for ad ${ad._id}`);
            const paymentResponse = await API.get(
              `/payments/ad/${ad._id}/status`
            );
            return {
              adId: ad._id,
              payment: paymentResponse.data.payment || {
                status: "not_initiated",
              },
            };
          }
          return {
            adId: ad._id,
            payment: { status: "not_initiated" },
          };
        } catch (error) {
          console.warn(
            `Error fetching payment for ad ${ad._id}:`,
            error.message
          );
          return {
            adId: ad._id,
            payment: { status: "not_initiated" },
          };
        }
      });

      const paymentStatuses = await Promise.all(paymentStatusPromises);
      const statusMap = {};
      paymentStatuses.forEach((status) => {
        statusMap[status.adId] = status.payment;
      });
      console.log("Payment status map:", statusMap);
      setPaymentStatus(statusMap);

      // Calculate stats
      const totalAds = adsData.length || 0;
      const activeAds =
        adsData.filter(
          (ad) =>
            ad.status === "approved" &&
            ad.isActive &&
            new Date(ad.endDate) > new Date() &&
            ad.payment?.status === "completed"
        ).length || 0;

      const pendingAds =
        adsData.filter((ad) => ad.status === "pending").length || 0;

      const totalSpent = adsData.reduce((sum, ad) => {
        const payment = statusMap[ad._id];
        if (payment?.status === "completed") {
          return sum + (ad.totalCost || 0);
        }
        return sum;
      }, 0);

      // Calculate analytics stats
      const totalImpressions = adsData.reduce(
        (sum, ad) => sum + (ad.impressions || 0),
        0
      );
      const totalClicks = adsData.reduce(
        (sum, ad) => sum + (ad.clicks || 0),
        0
      );
      const averageCTR =
        totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      setStats({
        totalAds,
        activeAds,
        pendingAds,
        totalSpent,
        totalImpressions,
        totalClicks,
        averageCTR: Number(averageCTR.toFixed(2)),
      });

      console.log("Stats calculated:", {
        totalAds,
        activeAds,
        pendingAds,
        totalSpent,
        totalImpressions,
        totalClicks,
        averageCTR,
      });
    } catch (error) {
      console.error("Failed to load advertisements:", error);
      toast.error("Failed to load advertisements");
      setAds([]);
      setStats({
        totalAds: 0,
        activeAds: 0,
        pendingAds: 0,
        totalSpent: 0,
        totalImpressions: 0,
        totalClicks: 0,
        averageCTR: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole && profileComplete) {
      fetchAds();
    }
  }, [userRole, profileComplete]);

  // Fetch detailed analytics for a specific ad
  const fetchAdAnalytics = async (adId) => {
    setAnalyticsLoading(true);
    try {
      const response = await API.get(`/ads/${adId}/analytics?period=30d`);
      setAnalytics(response.data);
      setSelectedAdForAnalytics(ads.find((ad) => ad._id === adId));
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Handle payment initiation
  const handlePayNow = async (ad) => {
    try {
      console.log("Handling payment for ad:", ad);

      // First, check if payment already exists
      let payment;
      if (ad.payment && ad.payment._id) {
        payment = ad.payment;
      } else {
        // Create payment record
        console.log("Creating payment record...");
        const initiateResponse = await API.post(
          `/payments/ad/${ad._id}/initiate`,
          {
            amount: ad.totalCost,
            method: "bank_transfer",
          }
        );
        payment = initiateResponse.data.payment;
        console.log("Payment created:", payment);
      }

      // Get payment instructions
      const instructionsResponse = await API.get(
        `/payments/instructions/${ad._id}`
      );

      setSelectedAdForPayment({
        ...ad,
        payment: payment,
        instructions: instructionsResponse.data,
      });
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      console.error("Error details:", error.response?.data);

      let errorMessage = "Failed to initiate payment";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  // Handle payment completion
  const handlePaymentComplete = () => {
    fetchAds();
    setShowPaymentModal(false);
    setSelectedAdForPayment(null);
  };

  // Get payment status for an ad
  const getAdPaymentStatus = (ad) => {
    // First check paymentStatus state
    const storedPayment = paymentStatus[ad._id];
    if (storedPayment) {
      return storedPayment.status || "not_initiated";
    }

    // Then check ad.payment if populated
    if (ad.payment) {
      return ad.payment.status || "not_initiated";
    }

    // Default
    return "not_initiated";
  };

  // Get payment status color and text
  const getPaymentStatusInfo = (ad) => {
    const status = getAdPaymentStatus(ad);
    console.log("Payment status for ad", ad._id, ":", status);

    switch (status) {
      case "completed":
        return {
          color: "bg-green-100 text-green-800",
          text: "Paid",
          icon: <FaCheckCircle className="inline mr-1" />,
          showPayButton: false,
        };
      case "processing":
        return {
          color: "bg-blue-100 text-blue-800",
          text: "Under Review",
          icon: <FaHourglassHalf className="inline mr-1" />,
          showPayButton: false,
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          text: "Payment Pending",
          icon: <FaClock className="inline mr-1" />,
          showPayButton: true,
        };
      case "failed":
        return {
          color: "bg-red-100 text-red-800",
          text: "Payment Failed",
          icon: <FaTimes className="inline mr-1" />,
          showPayButton: true,
        };
      case "not_initiated":
        return {
          color: "bg-gray-100 text-gray-800",
          text: "Payment Required",
          icon: <FaCreditCard className="inline mr-1" />,
          showPayButton: true,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          text: status || "Payment Required",
          icon: <FaCreditCard className="inline mr-1" />,
          showPayButton: true,
        };
    }
  };

  // Get performance indicator for an ad
  const getPerformanceIndicator = (ad) => {
    const ctr = ad.ctr || 0;
    if (ctr > 5)
      return {
        color: "text-green-600",
        icon: <FaArrowUp className="inline" />,
        text: "High",
      };
    if (ctr > 2)
      return {
        color: "text-yellow-600",
        icon: <FaArrowUp className="inline" />,
        text: "Good",
      };
    if (ctr > 0)
      return {
        color: "text-blue-600",
        icon: <FaArrowUp className="inline" />,
        text: "Low",
      };
    return { color: "text-gray-600", icon: null, text: "No data" };
  };

  // Get image URL
  const getImageUrl = (imageData) => {
    if (!imageData) return "/placeholder.png";

    if (typeof imageData === "string") {
      return imageData.startsWith("http") ? imageData : "/placeholder.png";
    }

    if (typeof imageData === "object" && imageData !== null) {
      if (imageData.url && typeof imageData.url === "string") {
        return imageData.url;
      }
      const possibleUrls = [
        imageData.secure_url,
        imageData.path,
        imageData.src,
        imageData.imageUrl,
        imageData.image_url,
      ].filter(Boolean);

      if (possibleUrls.length > 0) {
        return possibleUrls[0];
      }
    }

    if (Array.isArray(imageData) && imageData.length > 0) {
      return getImageUrl(imageData[0]);
    }

    return "/placeholder.png";
  };

  const filteredAds = (ads || []).filter((ad) => {
    if (!ad) return false;
    const matchesSearch =
      ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const paymentStatus = getAdPaymentStatus(ad);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" &&
        ad.status === "approved" &&
        ad.isActive &&
        paymentStatus === "completed" &&
        new Date(ad.endDate) > new Date()) ||
      (statusFilter === "paused" &&
        ad.status === "approved" &&
        paymentStatus === "completed" &&
        !ad.isActive &&
        new Date(ad.endDate) > new Date()) ||
      (statusFilter === "pending" && ad.status === "pending") ||
      (statusFilter === "awaiting_payment" &&
        ad.status === "approved" &&
        paymentStatus === "pending") ||
      (statusFilter === "ended" && new Date(ad.endDate) < new Date()) ||
      (statusFilter === "rejected" && ad.status === "rejected");

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (ad) => {
    if (!ad) return "bg-gray-100 text-gray-800";
    if (ad.status === "pending") return "bg-yellow-100 text-yellow-800";
    if (ad.status === "rejected") return "bg-red-100 text-red-800";
    if (new Date(ad.endDate) < new Date()) return "bg-gray-100 text-gray-800";

    const paymentStatus = getAdPaymentStatus(ad);
    if (ad.status === "approved") {
      if (paymentStatus !== "completed") {
        return "bg-orange-100 text-orange-800";
      }
      if (ad.isActive) return "bg-green-100 text-green-800";
      if (!ad.isActive) return "bg-blue-100 text-blue-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (ad) => {
    if (!ad) return "Unknown";
    if (ad.status === "pending") return "Pending Approval";
    if (ad.status === "rejected") return "Rejected";
    if (new Date(ad.endDate) < new Date()) return "Ended";

    const paymentStatus = getAdPaymentStatus(ad);
    if (ad.status === "approved") {
      if (paymentStatus !== "completed") {
        return "Awaiting Payment";
      }
      if (ad.isActive) return "Active";
      if (!ad.isActive) return "Paused";
    }
    return "Unknown";
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleImageError = (e) => {
    if (e.target) {
      e.target.style.display = "none";
      const fallbackDiv = e.target.nextElementSibling;
      if (fallbackDiv) {
        fallbackDiv.style.display = "flex";
      }
    }
  };

  const updateAdStatus = async (adId, newActiveStatus) => {
    try {
      await API.put(`/ads/${adId}`, { isActive: newActiveStatus });
      setAds(
        ads.map((ad) =>
          ad._id === adId ? { ...ad, isActive: newActiveStatus } : ad
        )
      );
      setStats((prev) => ({
        ...prev,
        activeAds: newActiveStatus ? prev.activeAds + 1 : prev.activeAds - 1,
      }));
      toast.success(
        `Ad ${newActiveStatus ? "activated" : "paused"} successfully`
      );
    } catch (error) {
      console.error("Error updating ad status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update ad status"
      );
    }
  };

  const handleAdCreated = (newAd) => {
    if (newAd) {
      setAds([newAd, ...ads]);
      setStats((prev) => ({
        ...prev,
        totalAds: prev.totalAds + 1,
        pendingAds: prev.pendingAds + 1,
      }));
    }
    setShowCreateAd(false);
  };

  // Check if user can create ad
  const canCreateAd = () => {
    if (!userRole) return false;
    if (userRole === "seller_pending") {
      toast.error("Your seller application is pending approval");
      return false;
    }
    if (userRole === "seller_approved" && !profileComplete) {
      toast.error("Please complete your profile first");
      return false;
    }
    return true;
  };

  // Show payment button for approved but unpaid ads
  const shouldShowPayButton = (ad) => {
    if (ad.status !== "approved") return false;
    const paymentStatus = getAdPaymentStatus(ad);
    console.log("Ad payment status:", ad._id, paymentStatus, ad);
    return (
      paymentStatus === "pending" ||
      paymentStatus === "not_initiated" ||
      paymentStatus === "failed"
    );
  };

  const shouldShowAnalyticsButton = (ad) => {
    if (ad.status !== "approved") return false;
    const paymentStatus = getAdPaymentStatus(ad);
    const hasAnalyticsData = ad.impressions > 0 || ad.clicks > 0;

    return paymentStatus === "completed" && hasAnalyticsData;
  };

  // Show analytics button for paid ads with data
  const shouldShowActivationButton = (ad) => {
    if (ad.status !== "approved") return false;
    const paymentStatus = getAdPaymentStatus(ad);
    const hasEnded = new Date(ad.endDate) < new Date();
    const isPaid = paymentStatus === "completed";

    return isPaid && !hasEnded;
  };

  // Loading state
  if (loading && ads.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading advertisements...</p>
        </div>
      </div>
    );
  }

  // Check if user is authorized
  if (!["seller_pending", "seller_approved"].includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-4 text-center bg-white rounded-lg shadow-md md:p-6">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-red-500 md:text-5xl" />
          <h2 className="mb-2 text-xl font-bold text-neutral-800 md:text-2xl">
            Access Denied
          </h2>
          <p className="mb-4 text-neutral-600 md:mb-6">
            You need to be a seller to access this section.
            <br />
            Current role: <strong>{userRole || "none"}</strong>
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if profile is complete for approved sellers
  if (userRole === "seller_approved" && !profileComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-4 text-center bg-white rounded-lg shadow-md md:p-6">
          <FaExclamationCircle className="mx-auto mb-4 text-4xl text-yellow-500 md:text-5xl" />
          <h2 className="mb-2 text-xl font-bold text-neutral-800 md:text-2xl">
            Complete Your Profile
          </h2>
          <p className="mb-4 text-neutral-600 md:mb-6">
            You need to complete your seller profile before creating
            advertisements.
          </p>
          <Link
            to="/seller/profile"
            className="inline-flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-background-light md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-800">
            Advertisement Management
          </h1>
          <p className="text-neutral-600">
            Create and manage your product advertisements
          </p>
        </div>

        {/* Stats Cards*/}
        <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 md:gap-4 md:mb-8">
          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full text-primary-600 bg-secondary-200 md:p-3">
                <FaBox className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Total Ads
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {stats.totalAds}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-green-600 bg-green-100 rounded-full md:p-3">
                <FaPlay className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Active
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {stats.activeAds}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-yellow-600 bg-yellow-100 rounded-full md:p-3">
                <FaClock className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Pending
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {stats.pendingAds}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-blue-600 bg-blue-100 rounded-full md:p-3">
                <FaMoneyBillWave className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Total Spent
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  Rs {stats.totalSpent?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Cards*/}
        <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-3 md:gap-4 md:mb-8">
          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-purple-600 bg-purple-100 rounded-full md:p-3">
                <FaEye className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Impressions
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {stats.totalImpressions?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-orange-600 bg-orange-100 rounded-full md:p-3">
                <FaMousePointer className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Total Clicks
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {stats.totalClicks?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-teal-600 bg-teal-100 rounded-full md:p-3">
                <FaChartLine className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Avg. CTR
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {stats.averageCTR}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Section */}
        <div className="p-4 mb-4 bg-white rounded-lg shadow md:hidden">
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search ads..."
              className="w-full py-2 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaFilter className="text-neutral-400" />
            </div>
            <select
              className="w-full py-2 pl-10 pr-8 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="pending">Pending Approval</option>
              <option value="awaiting_payment">Awaiting Payment</option>
              <option value="ended">Ended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Controls - Desktop */}
        <div className="hidden p-4 mb-6 bg-white rounded-lg shadow md:p-6 md:block">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search ads by title or description..."
                  className="w-full py-2 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaFilter className="text-neutral-400" />
                </div>
                <select
                  className="py-2 pl-10 pr-8 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="pending">Pending Approval</option>
                  <option value="awaiting_payment">Awaiting Payment</option>
                  <option value="ended">Ended</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <button
                onClick={() => {
                  if (canCreateAd()) {
                    setShowCreateAd(true);
                  }
                }}
                className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                disabled={!canCreateAd()}
              >
                <FaPlus className="mr-2" />
                Create New Ad
              </button>
            </div>
          </div>
        </div>

        {/* Advertisement Grid */}
        {filteredAds.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow md:p-12">
            <FaImage className="mx-auto text-4xl text-neutral-400" />
            <h3 className="mt-4 text-lg font-medium text-neutral-900">
              No advertisements found
            </h3>
            <p className="mt-2 text-neutral-600">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : userRole === "seller_pending"
                ? "Your seller application is pending approval"
                : "Start promoting your products with targeted advertisements"}
            </p>
            {!searchTerm &&
              statusFilter === "all" &&
              userRole === "seller_approved" && (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setShowCreateAd(true)}
                    className="inline-flex items-center px-6 py-3 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    <FaPlus className="mr-2" />
                    Create Your First Ad
                  </button>
                  <div className="text-sm text-neutral-500">
                    <p>• Reach more customers</p>
                    <p>• Boost your product visibility</p>
                    <p>• Target specific categories</p>
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAds.map((ad, index) => {
              const paymentInfo = getPaymentStatusInfo(ad);
              const performance = getPerformanceIndicator(ad);
              const showPayButton = shouldShowPayButton(ad);
              const showAnalyticsButton = shouldShowAnalyticsButton(ad);
              const showActivationButton = shouldShowActivationButton(ad);

              return (
                <div
                  key={ad?._id || `ad-${index}`}
                  className="overflow-hidden bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Advertisement Image */}
                  <div className="relative h-48 bg-neutral-200">
                    {ad?.images && ad.images.length > 0 ? (
                      <>
                        <img
                          src={getImageUrl(ad.images)}
                          alt={ad?.title || "Advertisement"}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className="absolute inset-0 hidden items-center justify-center bg-neutral-200"
                          style={{ display: "none" }}
                        >
                          <FaImage className="text-4xl text-neutral-400" />
                          <span className="ml-2 text-sm text-neutral-600">
                            Image not available
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <FaImage className="text-4xl text-neutral-400" />
                        <span className="ml-2 text-sm text-neutral-600">
                          No Image
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          ad
                        )}`}
                      >
                        {getStatusText(ad)}
                      </span>
                    </div>
                  </div>

                  {/* Advertisement Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1">
                      {ad?.title || "Untitled Ad"}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                      {ad?.description || "No description available"}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Period:</span>
                        <span className="font-medium text-neutral-900">
                          {formatDate(ad?.startDate)} -{" "}
                          {formatDate(ad?.endDate)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Remaining:</span>
                        <span className="font-medium text-neutral-900">
                          {getRemainingDays(ad?.endDate)} days
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Cost:</span>
                        <span className="font-medium text-neutral-900">
                          Rs {ad?.totalCost || 0}
                        </span>
                      </div>

                      {/* Analytics Data */}
                      {(ad.impressions > 0 || ad.clicks > 0) && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Views:</span>
                            <span className="font-medium text-neutral-900">
                              {ad.impressions || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Clicks:</span>
                            <span className="font-medium text-neutral-900">
                              {ad.clicks || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">CTR:</span>
                            <span
                              className={`font-medium ${performance.color}`}
                            >
                              {ad.ctr ? `${ad.ctr.toFixed(2)}%` : "0%"}{" "}
                              {performance.icon}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Payment:</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${paymentInfo.color}`}
                        >
                          {paymentInfo.icon}
                          {paymentInfo.text}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between mt-4">
                      <div className="flex flex-wrap gap-2">
                        {showPayButton && (
                          <button
                            onClick={() => handlePayNow(ad)}
                            className="flex items-center px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <FaCreditCard className="mr-1" />
                            Pay Now
                          </button>
                        )}

                        {showAnalyticsButton && (
                          <button
                            onClick={() => fetchAdAnalytics(ad._id)}
                            className="flex items-center px-3 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <FaChartLine className="mr-1" />
                            Analytics
                          </button>
                        )}
                      </div>

                      {showActivationButton && (
                        <button
                          onClick={() => updateAdStatus(ad._id, !ad.isActive)}
                          className={`p-2 transition rounded-lg ${
                            ad.isActive
                              ? "text-yellow-600 hover:bg-yellow-100"
                              : "text-green-600 hover:bg-green-100"
                          }`}
                          title={ad.isActive ? "Pause Ad" : "Activate Ad"}
                        >
                          {ad.isActive ? (
                            <FaPause className="text-sm" />
                          ) : (
                            <FaPlay className="text-sm" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalyticsModal && selectedAdForAnalytics && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-neutral-200">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Ad Analytics - {selectedAdForAnalytics.title}
                  </h2>
                  <p className="text-neutral-600">
                    Detailed performance metrics for your advertisement
                  </p>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="p-2 text-neutral-400 rounded-lg hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="p-6">
                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="w-8 h-8 animate-spin text-primary-600" />
                    <span className="ml-3 text-neutral-600">
                      Loading analytics...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="p-4 text-center rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-lg font-bold text-blue-700">
                          {analytics.impressions || 0}
                        </div>
                        <div className="text-sm text-blue-600">Total Views</div>
                      </div>
                      <div className="p-4 text-center rounded-lg bg-green-50 border border-green-200">
                        <div className="text-lg font-bold text-green-700">
                          {analytics.clicks || 0}
                        </div>
                        <div className="text-sm text-green-600">
                          Total Clicks
                        </div>
                      </div>
                      <div className="p-4 text-center rounded-lg bg-purple-50 border border-purple-200">
                        <div className="text-lg font-bold text-purple-700">
                          {analytics.ctr
                            ? parseFloat(analytics.ctr).toFixed(2)
                            : "0.00"}
                          %
                        </div>
                        <div className="text-sm text-purple-600">CTR</div>
                      </div>
                      <div className="p-4 text-center rounded-lg bg-gray-50 border border-gray-200">
                        <div className="text-lg font-bold text-gray-700">
                          {analytics.uniqueViewers || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Unique Viewers
                        </div>
                      </div>
                    </div>

                    {/* Unique User Metrics  */}
                    {analytics.uniqueCTR > 0 && (
                      <div className="p-4 bg-white rounded-lg shadow">
                        <h3 className="mb-3 text-lg font-semibold text-gray-800">
                          Engagement Quality
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              Unique Clickers
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              {analytics.uniqueClickers || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Unique CTR</p>
                            <p className="text-xl font-bold text-gray-900">
                              {analytics.uniqueCTR
                                ? parseFloat(analytics.uniqueCTR).toFixed(2)
                                : "0.00"}
                              %
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Daily Stats  */}
                    {analytics.dailyStats &&
                      analytics.dailyStats.length > 0 && (
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow">
                          <h3 className="mb-4 text-lg font-semibold text-gray-800">
                            Daily Performance (Last 30 Days)
                          </h3>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {analytics.dailyStats.map((day, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded"
                              >
                                <span className="text-sm font-medium text-gray-700">
                                  {day._id}
                                </span>
                                <div className="flex space-x-4 text-sm">
                                  <span className="text-blue-600">
                                    {day.impressions} views
                                  </span>
                                  <span className="text-green-600">
                                    {day.clicks} clicks
                                  </span>
                                  <span className="text-purple-600">
                                    {day.impressions > 0
                                      ? (
                                          (day.clicks / day.impressions) *
                                          100
                                        ).toFixed(2)
                                      : "0.00"}
                                    %
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Ad Modal  */}
        {showCreateAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-neutral-200">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Create New Advertisement
                  </h2>
                  <p className="text-neutral-600">
                    Promote your products to reach more customers
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateAd(false)}
                  className="p-2 text-neutral-400 rounded-lg hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <CreateAd
                onClose={() => setShowCreateAd(false)}
                onAdCreated={handleAdCreated}
              />
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedAdForPayment && (
          <PaymentModal
            ad={selectedAdForPayment}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedAdForPayment(null);
            }}
            onPaymentComplete={handlePaymentComplete}
          />
        )}
      </div>
    </div>
  );
};

export default SellerAds;
