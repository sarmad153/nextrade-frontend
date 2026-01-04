import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaImage,
  FaCalendarAlt,
  FaLink,
  FaMoneyBillWave,
  FaCheck,
  FaExclamationTriangle,
  FaStar,
  FaClock,
  FaFire,
  FaCalendar,
  FaSpinner,
  FaCrown,
  FaGem,
  FaRocket,
} from "react-icons/fa";
import API from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const CreateAd = ({ onClose, onAdCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    targetCategory: "",
    startDate: "",
    duration: "",
    endDate: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [dateSelectionMode, setDateSelectionMode] = useState("duration");

  //  Load categories and pricing data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const categoriesResponse = await API.get("/categories");
        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];
        setCategories(categoriesData);

        // Load pricing tiers
        const pricingResponse = await API.get("/pricing");

        // Handle different possible response structures
        let pricingData = [];
        if (Array.isArray(pricingResponse.data)) {
          pricingData = pricingResponse.data;
        } else if (
          pricingResponse.data &&
          Array.isArray(pricingResponse.data.pricing)
        ) {
          pricingData = pricingResponse.data.pricing;
        } else if (
          pricingResponse.data &&
          Array.isArray(pricingResponse.data.data)
        ) {
          pricingData = pricingResponse.data.data;
        }

        // If no pricing data from API, use default pricing
        if (pricingData.length === 0) {
          pricingData = [
            { duration: 7, price: 500, name: "Starter" },
            { duration: 14, price: 900, name: "Popular" },
            { duration: 30, price: 1500, name: "Professional" },
            { duration: 60, price: 2500, name: "Business" },
            { duration: 90, price: 3000, name: "Enterprise" },
          ];
        }

        // Transform pricing data with enhanced styling
        const transformedPricing = pricingData.map((tier) => ({
          duration: tier.duration,
          price: tier.price,
          name: tier.name || `${tier.duration} Days`,
          description: getTierDescription(tier.duration),
          popular: tier.duration === 30,
          featured: tier.duration === 60,
          savings: calculateSavings(tier.duration, tier.price),
          icon: getTierIcon(tier.duration),
          dailyRate: (tier.price / tier.duration).toFixed(2),
          gradient: getTierGradient(tier.duration),
          badge: getTierBadge(tier.duration),
        }));

        setPricingTiers(transformedPricing);
      } catch (error) {
        console.error("Failed to load data:", error);
        // Use default data if API fails
        setCategories([
          { _id: "1", name: "Electronics" },
          { _id: "2", name: "Fashion & Clothing" },
          { _id: "3", name: "Home & Garden" },
        ]);

        const defaultPricing = [
          { duration: 7, price: 500, name: "Starter", dailyRate: "71.43" },
          { duration: 14, price: 900, name: "Popular", dailyRate: "64.29" },
          {
            duration: 30,
            price: 1500,
            name: "Professional",
            dailyRate: "50.00",
          },
          { duration: 60, price: 2500, name: "Business", dailyRate: "41.67" },
          { duration: 90, price: 3000, name: "Enterprise", dailyRate: "33.33" },
        ].map((tier) => ({
          ...tier,
          description: getTierDescription(tier.duration),
          popular: tier.duration === 30,
          featured: tier.duration === 60,
          savings: calculateSavings(tier.duration, tier.price),
          icon: getTierIcon(tier.duration),
          gradient: getTierGradient(tier.duration),
          badge: getTierBadge(tier.duration),
        }));

        setPricingTiers(defaultPricing);
        toast.info("Using default pricing plans");
      }
    };

    loadData();
  }, []);

  // Enhanced helper functions for pricing tiers
  const getTierDescription = (duration) => {
    const descriptions = {
      7: "Perfect for testing new products",
      14: "Great value for growing businesses",
      30: "Most popular choice for sellers",
      60: "Extended reach with premium placement",
      90: "Maximum exposure and best value",
    };
    return descriptions[duration] || "Great advertising plan";
  };

  const getTierIcon = (duration) => {
    switch (duration) {
      case 7:
        return <FaClock className="text-blue-500" />;
      case 14:
        return <FaStar className="text-green-500" />;
      case 30:
        return <FaFire className="text-orange-500" />;
      case 60:
        return <FaGem className="text-purple-500" />;
      case 90:
        return <FaCrown className="text-yellow-500" />;
      default:
        return <FaRocket className="text-gray-500" />;
    }
  };

  const getTierGradient = (duration) => {
    switch (duration) {
      case 7:
        return "from-blue-50 to-blue-100 border-blue-200";
      case 14:
        return "from-green-50 to-green-100 border-green-200";
      case 30:
        return "from-orange-50 to-orange-100 border-orange-200";
      case 60:
        return "from-purple-50 to-purple-100 border-purple-200";
      case 90:
        return "from-yellow-50 to-yellow-100 border-yellow-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  const getTierBadge = (duration) => {
    switch (duration) {
      case 7:
        return { text: "Starter", color: "bg-blue-500" };
      case 14:
        return { text: "Value", color: "bg-green-500" };
      case 30:
        return { text: "Popular", color: "bg-orange-500" };
      case 60:
        return { text: "Featured", color: "bg-purple-500" };
      case 90:
        return { text: "Premium", color: "bg-yellow-500" };
      default:
        return { text: "Basic", color: "bg-gray-500" };
    }
  };

  const calculateSavings = (duration, price) => {
    const standardCost = duration * 50;
    const savings = ((standardCost - price) / standardCost) * 100;
    return savings > 0 ? `${Math.round(savings)}%` : "0%";
  };

  //  Calculate price based on selected duration or custom dates
  useEffect(() => {
    if (
      dateSelectionMode === "duration" &&
      selectedDuration &&
      formData.startDate
    ) {
      const selectedTier = pricingTiers.find(
        (tier) => tier.duration === parseInt(selectedDuration)
      );

      if (selectedTier) {
        setCalculatedPrice(selectedTier.price);
        setFormData((prev) => ({ ...prev, duration: selectedDuration }));

        // Calculate end date
        const startDate = new Date(formData.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + parseInt(selectedDuration));
        setFormData((prev) => ({
          ...prev,
          endDate: endDate.toISOString().split("T")[0],
        }));
      }
    } else if (
      dateSelectionMode === "custom" &&
      formData.startDate &&
      formData.endDate
    ) {
      calculateCustomPrice();
    }
  }, [
    selectedDuration,
    formData.startDate,
    formData.endDate,
    dateSelectionMode,
    pricingTiers,
  ]);

  //  Calculate price for custom date range
  const calculateCustomPrice = () => {
    if (!formData.startDate || !formData.endDate) return;

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      setErrors((prev) => ({
        ...prev,
        endDate: "End date must be after start date",
      }));
      return;
    }

    // Calculate duration in days
    const durationMs = endDate - startDate;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    if (durationDays < 1) {
      setErrors((prev) => ({ ...prev, endDate: "Minimum duration is 1 day" }));
      return;
    }

    // Clear errors
    setErrors((prev) => ({ ...prev, endDate: "" }));

    // Calculate price based on duration
    let calculatedPrice = 0;

    // Find the best pricing tier for custom duration
    const matchingTier = pricingTiers.find(
      (tier) => tier.duration === durationDays
    );
    if (matchingTier) {
      calculatedPrice = matchingTier.price;
    } else {
      // Calculate based on daily rate of the closest tier
      const closestTier = pricingTiers.reduce((prev, curr) =>
        Math.abs(curr.duration - durationDays) <
        Math.abs(prev.duration - durationDays)
          ? curr
          : prev
      );
      const dailyRate = closestTier.price / closestTier.duration;
      calculatedPrice = Math.round(durationDays * dailyRate);
    }

    setCalculatedPrice(calculatedPrice);
    setFormData((prev) => ({
      ...prev,
      duration: durationDays.toString(),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
    setDateSelectionMode("duration");
    setErrors((prev) => ({ ...prev, duration: "", endDate: "" }));
  };

  const handleCustomDateSelect = () => {
    setDateSelectionMode("custom");
    setSelectedDuration("");
    setErrors((prev) => ({ ...prev, duration: "" }));
  };

  //  Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select an image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear image error
      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Ad title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters long";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Ad description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters long";
    }

    if (!formData.link.trim()) {
      newErrors.link = "Link is required";
    } else if (!isValidUrl(formData.link)) {
      newErrors.link = "Please enter a valid URL";
    }

    if (!formData.targetCategory) {
      newErrors.targetCategory = "Please select a target category";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else if (new Date(formData.startDate) < new Date()) {
      newErrors.startDate = "Start date cannot be in the past";
    }

    if (dateSelectionMode === "duration" && !selectedDuration) {
      newErrors.duration = "Please select ad duration";
    }

    if (dateSelectionMode === "custom" && !formData.endDate) {
      newErrors.endDate = "End date is required for custom range";
    } else if (
      dateSelectionMode === "custom" &&
      formData.endDate &&
      formData.startDate
    ) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (!imageFile) {
      newErrors.image = "Ad image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const calculateEndDate = () => {
    if (formData.startDate && selectedDuration) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(selectedDuration));
      return endDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return "Select start date and duration";
  };

  //  Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setLoading(true);

    try {
      let imageData = null;

      // Upload image first
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        const uploadResponse = await API.post(
          "/upload/products/single",
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Get the full image object from upload response
        imageData = {
          url: uploadResponse.data.imageUrl,
          publicId: uploadResponse.data.publicId,
        };

        setImageUrl(uploadResponse.data.imageUrl);
      }

      // Calculate end date based on selection mode
      const startDate = new Date(formData.startDate);
      let endDate;

      if (dateSelectionMode === "duration") {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + parseInt(selectedDuration));
      } else {
        endDate = new Date(formData.endDate);
      }

      // Create the ad using correct data structure
      const adData = {
        title: formData.title,
        description: formData.description,
        link: formData.link,
        targetCategory: formData.targetCategory,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: parseInt(formData.duration),
        totalCost: calculatedPrice,
        images: imageData ? [imageData] : [],
      };

      console.log("Creating ad with data:", adData);

      const adFormData = new FormData();
      adFormData.append("title", formData.title);
      adFormData.append("description", formData.description);
      adFormData.append("link", formData.link);
      adFormData.append("targetCategory", formData.targetCategory);
      adFormData.append("startDate", startDate.toISOString());
      adFormData.append("endDate", endDate.toISOString());
      adFormData.append("duration", parseInt(formData.duration));
      adFormData.append("totalCost", calculatedPrice);

      if (imageFile) {
        adFormData.append("image", imageFile);
      }

      const createAdResponse = await API.post("/ads", adFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Call the success callback with correct response structure
      if (createAdResponse.data && createAdResponse.data.ad) {
        onAdCreated(createAdResponse.data.ad);
      } else {
        onAdCreated(createAdResponse.data);
      }

      toast.success("Ad created successfully! It's now pending approval.");
    } catch (error) {
      console.error("Error creating ad:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create advertisement. Please try again.";
      setErrors({
        submit: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageUrl("");
  };

  const getMinStartDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum start date is tomorrow
    return today.toISOString().split("T")[0];
  };

  const getMinEndDate = () => {
    if (!formData.startDate) return getMinStartDate();
    const startDate = new Date(formData.startDate);
    startDate.setDate(startDate.getDate() + 1);
    return startDate.toISOString().split("T")[0];
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Pricing grid
  const PricingGrid = () => (
    <div className="grid grid-cols-5 gap-3">
      {pricingTiers.map((tier) => (
        <div
          key={tier.duration}
          onClick={() => handleDurationSelect(tier.duration)}
          className={`aspect-square p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center justify-center relative ${
            selectedDuration === tier.duration.toString()
              ? "border-primary-600 bg-gradient-to-br from-primary-50 to-blue-50 shadow-lg scale-[1.05] ring-2 ring-primary-200"
              : "border-neutral-300 hover:border-primary-400 bg-white hover:shadow-md"
          } ${tier.popular ? "border-yellow-400" : ""}`}
        >
          {/* Icon */}
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 ${
              selectedDuration === tier.duration.toString()
                ? "bg-secondary-200"
                : tier.popular
                ? "bg-yellow-100"
                : "bg-neutral-300"
            }`}
          >
            <div
              className={`text-lg ${
                selectedDuration === tier.duration.toString()
                  ? "text-primary-600"
                  : tier.popular
                  ? "text-yellow-600"
                  : "text-neutral-700"
              }`}
            >
              {tier.icon}
            </div>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-neutral-800 text-xs text-center mb-1 line-clamp-1">
            {tier.name}
          </h4>

          {/* Price */}
          <p className="text-base font-bold text-primary-600 mb-0.5">
            Rs {tier.price}
          </p>

          {/* Duration */}
          <p className="text-xs text-neutral-500 mb-2">{tier.duration} days</p>

          {/* Daily Rate */}
          <p className="text-xs text-neutral-600 mb-2">
            Rs {tier.dailyRate}/day
          </p>

          {/* Selected Check or Badge */}
          {selectedDuration === tier.duration.toString() ? (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow-md">
              <FaCheck className="text-white text-xs" />
            </div>
          ) : (
            <>
              {tier.popular && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                  <FaStar className="text-white text-xs" />
                </div>
              )}
              {!tier.popular && tier.savings !== "0%" && (
                <div className="absolute -top-1 -right-1">
                  <span className="px-1.5 py-0.5 text-xs bg-green-500 text-white rounded-full shadow-sm">
                    {tier.savings}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-2 sm:py-5 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Form Container */}
          <div className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Ad Basic Information */}
              <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <div className="w-2 h-6 sm:h-8 bg-primary-500 rounded-full mr-3"></div>
                      Ad Information
                    </h3>

                    {/* Title */}
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Ad Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                          errors.title
                            ? "border-red-500"
                            : "border-gray-300 hover:border-primary-400"
                        }`}
                        placeholder="Enter a compelling ad title..."
                        maxLength={100}
                      />
                      {errors.title && (
                        <p className="mt-1 sm:mt-2 text-sm text-red-600 flex items-center">
                          <FaExclamationTriangle className="mr-2" />
                          {errors.title}
                        </p>
                      )}
                      <p className="mt-1 sm:mt-2 text-xs text-gray-500">
                        {formData.title.length}/100 characters
                      </p>
                    </div>

                    {/* Description */}
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                          errors.description
                            ? "border-red-500"
                            : "border-gray-300 hover:border-primary-400"
                        }`}
                        placeholder="Describe your product or service in detail..."
                        maxLength={500}
                      />
                      {errors.description && (
                        <p className="mt-1 sm:mt-2 text-sm text-red-600 flex items-center">
                          <FaExclamationTriangle className="mr-2" />
                          {errors.description}
                        </p>
                      )}
                      <p className="mt-1 sm:mt-2 text-xs text-gray-500">
                        {formData.description.length}/500 characters
                      </p>
                    </div>

                    {/* Link */}
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Destination Link *
                      </label>
                      <div className="relative">
                        <FaLink className="absolute transform -translate-y-1/2 text-gray-400 left-3 sm:left-4 top-1/2 text-sm sm:text-base" />
                        <input
                          type="text"
                          name="link"
                          value={formData.link}
                          onChange={handleInputChange}
                          className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                            errors.link
                              ? "border-red-500"
                              : "border-gray-300 hover:border-primary-400"
                          }`}
                          placeholder="https://example.com/your-product"
                        />
                      </div>
                      {errors.link && (
                        <p className="mt-1 sm:mt-2 text-sm text-red-600 flex items-center">
                          <FaExclamationTriangle className="mr-2" />
                          {errors.link}
                        </p>
                      )}
                    </div>

                    {/* Target Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Target Category *
                      </label>
                      <select
                        name="targetCategory"
                        value={formData.targetCategory}
                        onChange={handleInputChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                          errors.targetCategory
                            ? "border-red-500"
                            : "border-gray-300 hover:border-primary-400"
                        }`}
                      >
                        <option value="">Choose a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.targetCategory && (
                        <p className="mt-1 sm:mt-2 text-sm text-red-600 flex items-center">
                          <FaExclamationTriangle className="mr-2" />
                          {errors.targetCategory}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <div className="w-2 h-6 sm:h-8 bg-primary-500 rounded-full mr-3"></div>
                      Ad Image
                    </h3>
                    <div className="flex flex-col items-center justify-center p-4 sm:p-8 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl hover:border-primary-400 transition-all duration-300 bg-white relative min-h-[200px] sm:min-h-[250px]">
                      {imagePreview ? (
                        <div className="relative w-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <FaTimes className="text-xs sm:text-sm" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <FaImage className="text-4xl sm:text-5xl text-gray-400 mb-3 sm:mb-4" />
                          <p className="text-base sm:text-lg font-medium text-gray-600 text-center mb-1 sm:mb-2">
                            Click to upload ad image
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 text-center">
                            PNG, JPG, JPEG up to 5MB
                          </p>
                          <input
                            key={imageFile ? imageFile.name : "no-image"}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                    {errors.image && (
                      <p className="mt-2 sm:mt-3 text-sm text-red-600 flex items-center">
                        <FaExclamationTriangle className="mr-2" />
                        {errors.image}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column - Pricing and Schedule */}
                <div className="space-y-6">
                  {/* Duration & Pricing Cards */}
                  <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center mb-3 sm:mb-0">
                        <div className="w-2 h-6 sm:h-8 bg-primary-500 rounded-full mr-3"></div>
                        Choose Your Plan
                      </h3>
                    </div>

                    {/* Date Selection Mode Toggle */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <button
                        type="button"
                        onClick={() => setDateSelectionMode("duration")}
                        className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base ${
                          dateSelectionMode === "duration"
                            ? "border-primary-600 bg-primary-50 text-primary-700 font-semibold"
                            : "border-gray-300 bg-white text-gray-700 hover:border-primary-400"
                        }`}
                      >
                        <FaClock className="inline mr-2" />
                        Pre-defined
                      </button>
                      <button
                        type="button"
                        onClick={handleCustomDateSelect}
                        className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base ${
                          dateSelectionMode === "custom"
                            ? "border-primary-600 bg-primary-50 text-primary-700 font-semibold"
                            : "border-gray-300 bg-white text-gray-700 hover:border-primary-400"
                        }`}
                      >
                        <FaCalendar className="inline mr-2" />
                        Custom
                      </button>
                    </div>

                    {errors.duration && (
                      <p className="mb-3 sm:mb-4 text-sm text-red-600 flex items-center">
                        <FaExclamationTriangle className="mr-2" />
                        {errors.duration}
                      </p>
                    )}

                    {/* Pre-defined Duration Plans  */}
                    {dateSelectionMode === "duration" && (
                      <div className="space-y-4">
                        <PricingGrid />
                      </div>
                    )}

                    {/* Custom Date Range */}
                    {dateSelectionMode === "custom" && (
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Date *
                          </label>
                          <div className="relative">
                            <FaCalendarAlt className="absolute transform -translate-y-1/2 text-gray-400 left-3 top-1/2" />
                            <input
                              type="date"
                              name="startDate"
                              value={formData.startDate}
                              onChange={handleInputChange}
                              min={getMinStartDate()}
                              className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                                errors.startDate
                                  ? "border-red-500"
                                  : "border-gray-300 hover:border-primary-400"
                              }`}
                            />
                          </div>
                          {errors.startDate && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <FaExclamationTriangle className="mr-2" />
                              {errors.startDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            End Date *
                          </label>
                          <div className="relative">
                            <FaCalendarAlt className="absolute transform -translate-y-1/2 text-gray-400 left-3 top-1/2" />
                            <input
                              type="date"
                              name="endDate"
                              value={formData.endDate}
                              onChange={handleInputChange}
                              min={getMinEndDate()}
                              className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                                errors.endDate
                                  ? "border-red-500"
                                  : "border-gray-300 hover:border-primary-400"
                              }`}
                            />
                          </div>
                          {errors.endDate && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <FaExclamationTriangle className="mr-2" />
                              {errors.endDate}
                            </p>
                          )}
                        </div>

                        {formData.startDate &&
                          formData.endDate &&
                          !errors.endDate && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <strong>Custom Duration:</strong>{" "}
                                {formData.duration} days
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Schedule & Summary */}
                  <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <div className="w-2 h-6 sm:h-8 bg-primary-500 rounded-full mr-3"></div>
                      Schedule & Summary
                    </h3>

                    {/* Start Date (shown for both modes) */}
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Start Date *
                      </label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute transform -translate-y-1/2 text-gray-400 left-3 sm:left-4 top-1/2" />
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          min={getMinStartDate()}
                          className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                            errors.startDate
                              ? "border-red-500"
                              : "border-gray-300 hover:border-primary-400"
                          }`}
                        />
                      </div>
                      {errors.startDate && (
                        <p className="mt-1 sm:mt-2 text-sm text-red-600 flex items-center">
                          <FaExclamationTriangle className="mr-2" />
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-primary-200">
                      <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-center text-sm sm:text-base">
                        Order Summary
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">
                            Duration:
                          </span>
                          <span className="font-medium text-gray-800 text-sm">
                            {formData.duration
                              ? `${formData.duration} days`
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">
                            Start Date:
                          </span>
                          <span className="font-medium text-gray-800 text-sm">
                            {formatDate(formData.startDate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">
                            End Date:
                          </span>
                          <span className="font-medium text-gray-800 text-sm">
                            {formatDate(formData.endDate) ||
                              (dateSelectionMode === "duration"
                                ? calculateEndDate()
                                : "-")}
                          </span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 sm:pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-base sm:text-lg font-semibold text-gray-800">
                              Total Cost:
                            </span>
                            <span className="text-xl sm:text-2xl font-bold text-primary-600">
                              Rs {calculatedPrice}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
                    <h4 className="font-semibold text-yellow-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                      <FaExclamationTriangle className="mr-2" />
                      Important Information
                    </h4>
                    <ul className="text-xs sm:text-sm text-yellow-700 space-y-1 sm:space-y-2">
                      <li>• Your ad will be reviewed by our admin team</li>
                      <li>
                        • Payment instructions sent via email after approval
                      </li>
                      <li>• Ad goes live only after payment confirmation</li>
                      <li>• No refunds once ad period starts</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                  <p className="text-red-700 flex items-center text-sm sm:text-base">
                    <FaExclamationTriangle className="mr-2" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 sm:px-8 py-2 sm:py-3 text-gray-600 border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 font-semibold text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center px-4 sm:px-8 py-2 sm:py-3 text-white bg-primary-600 rounded-lg sm:rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 font-semibold shadow-lg text-sm sm:text-base order-1 sm:order-2 mb-3 sm:mb-0"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                      Creating Ad...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Create Advertisement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAd;
