import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaArrowLeft,
  FaUpload,
  FaImage,
  FaBox,
  FaTag,
  FaTimes,
  FaSpinner,
  FaStar,
  FaBarcode,
  FaUserClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPercentage,
  FaMoneyBillWave,
  FaLayerGroup,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import API from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    tags: "",
    salePrice: "",
    featured: false,
    status: "active",
  });
  const [userRole, setUserRole] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bulk Pricing State
  const [bulkPricingEnabled, setBulkPricingEnabled] = useState(false);
  const [bulkTiers, setBulkTiers] = useState([]);

  // Check user role and profile status on component mount
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const currentRole = user?.role;
        setUserRole(currentRole);

        // Fetch profile data to get approval status and profile completion
        if (["seller_pending", "seller_approved"].includes(currentRole)) {
          try {
            const profileResponse = await API.get("/profile/me");
            const profileData = profileResponse.data;

            // Set approval status based on role
            if (currentRole === "seller_approved") {
              setApprovalStatus("approved");
            } else if (currentRole === "seller_pending") {
              setApprovalStatus("pending");
            }

            // Check if profile is complete for sellers
            setProfileComplete(profileData.isProfileComplete || false);

            console.log("Profile status:", {
              role: currentRole,
              profileComplete: profileData.isProfileComplete,
              approvalStatus:
                currentRole === "seller_approved" ? "approved" : "pending",
            });
          } catch (profileError) {
            console.error("Profile fetch error:", profileError);
          }
        }
      } catch (error) {
        console.error("User status check error:", error);
      }
    };

    checkUserStatus();
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get("/categories");
        setCategories(response.data);
      } catch (error) {
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Bulk Pricing Functions
  const addBulkTier = () => {
    const newTier = {
      minQuantity: 2,
      discountType: "percentage",
      discountValue: "",
      calculatedPrice: "",
    };
    setBulkTiers([...bulkTiers, newTier]);
  };

  const updateBulkTier = (index, field, value) => {
    const updatedTiers = [...bulkTiers];
    updatedTiers[index][field] = value;

    // Calculate final price if we have all required data
    if (
      formData.price &&
      value &&
      (field === "discountValue" || field === "discountType")
    ) {
      const price = parseFloat(formData.price);
      const tier = updatedTiers[index];

      if (tier.discountValue && tier.discountType) {
        if (tier.discountType === "percentage") {
          const discount = price * (parseFloat(tier.discountValue) / 100);
          updatedTiers[index].calculatedPrice = (price - discount).toFixed(2);
        } else {
          updatedTiers[index].calculatedPrice = (
            price - parseFloat(tier.discountValue)
          ).toFixed(2);
        }
      }
    }

    setBulkTiers(updatedTiers);
  };

  const removeBulkTier = (index) => {
    const updatedTiers = bulkTiers.filter((_, i) => i !== index);
    setBulkTiers(updatedTiers);
  };

  const validateBulkTiers = () => {
    if (!bulkPricingEnabled) return true;

    if (bulkTiers.length === 0) {
      toast.error("Please add at least one bulk pricing tier");
      return false;
    }

    // Check for duplicate min quantities
    const quantities = bulkTiers.map((tier) => tier.minQuantity);
    const uniqueQuantities = new Set(quantities);
    if (uniqueQuantities.size !== quantities.length) {
      toast.error(
        "Duplicate quantity tiers found. Each tier must have a unique minimum quantity."
      );
      return false;
    }

    // Validate each tier
    for (let i = 0; i < bulkTiers.length; i++) {
      const tier = bulkTiers[i];

      if (!tier.minQuantity || tier.minQuantity < 2) {
        toast.error(`Tier ${i + 1}: Minimum quantity must be at least 2`);
        return false;
      }

      if (!tier.discountValue || parseFloat(tier.discountValue) <= 0) {
        toast.error(`Tier ${i + 1}: Please enter a valid discount value`);
        return false;
      }

      if (
        tier.discountType === "percentage" &&
        parseFloat(tier.discountValue) >= 100
      ) {
        toast.error(
          `Tier ${i + 1}: Discount percentage cannot be 100% or more`
        );
        return false;
      }

      if (
        tier.discountType === "fixed" &&
        parseFloat(tier.discountValue) >= parseFloat(formData.price)
      ) {
        toast.error(
          `Tier ${i + 1}: Fixed discount cannot be greater than product price`
        );
        return false;
      }
    }

    // Check if tiers are in ascending order
    const sortedTiers = [...bulkTiers].sort(
      (a, b) => a.minQuantity - b.minQuantity
    );
    for (let i = 1; i < sortedTiers.length; i++) {
      if (sortedTiers[i].minQuantity <= sortedTiers[i - 1].minQuantity) {
        toast.error(
          "Bulk tiers must be in ascending order of minimum quantity"
        );
        return false;
      }
    }

    return true;
  };

  // Show loading state while fetching categories and user status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading product form...</p>
        </div>
      </div>
    );
  }

  // Show pending approval message
  if (userRole === "seller_pending") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-4 text-center bg-white rounded-lg shadow-lg md:p-6">
          <FaUserClock className="mx-auto mb-4 text-4xl text-blue-600 md:text-5xl" />
          <h2 className="mb-2 text-xl font-bold text-neutral-800 md:text-2xl">
            Approval Pending
          </h2>
          <p className="mb-4 text-neutral-600 md:mb-6">
            Your seller application is under review. You need approved seller
            status to add products.
          </p>
          <div className="p-3 mb-4 bg-blue-50 rounded-lg md:p-4">
            <p className="text-sm text-blue-700">
              <strong>Status:</strong> Pending Review
            </p>
            {!profileComplete && (
              <p className="mt-2 text-sm text-orange-700">
                <strong>Note:</strong> Complete your business profile for faster
                approval
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              {profileComplete
                ? "View Business Profile"
                : "Complete Business Profile"}
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
            >
              Check Approval Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show profile incomplete message for approved sellers
  if (userRole === "seller_approved" && !profileComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-4 text-center bg-white rounded-lg shadow-lg md:p-6">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-orange-500 md:text-5xl" />
          <h2 className="mb-2 text-xl font-bold text-neutral-800 md:text-2xl">
            Complete Your Business Profile
          </h2>
          <p className="mb-4 text-neutral-600 md:mb-6">
            Your seller account is approved! Please complete your business
            profile to start adding products and access all seller features.
          </p>
          <div className="p-3 mb-4 bg-orange-50 rounded-lg md:p-4">
            <p className="text-sm text-orange-700">
              <strong>Required:</strong> Business details, CNIC verification,
              and contact information
            </p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Complete Business Profile
          </Link>
        </div>
      </div>
    );
  }

  // Show access denied if not an approved seller
  if (userRole !== "seller_approved") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-4 text-center bg-white rounded-lg shadow-lg md:p-6">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-red-500 md:text-5xl" />
          <h2 className="mb-2 text-xl font-bold text-neutral-800 md:text-2xl">
            Access Denied
          </h2>
          <p className="mb-4 text-neutral-600 md:mb-6">
            You need approved seller privileges to add products.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Apply as Seller
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Upload main image
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload JPEG, PNG, or WebP images."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const response = await API.post(
        "/upload/products/single",
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      if (response.data.imageUrl && response.data.publicId) {
        setMainImage({
          url: response.data.imageUrl,
          publicId: response.data.publicId,
        });
        toast.success("Main image uploaded successfully");
      } else {
        throw new Error("No image data returned from server");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload main image"
      );
    } finally {
      setUploading(false);
    }
  };

  // Upload gallery images
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length + galleryImages.length > 10) {
      toast.error("Maximum 10 gallery images allowed");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      toast.error(
        "Invalid file types. Please upload only JPEG, PNG, or WebP images."
      );
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Some files are too large. Maximum size is 10MB per file.");
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      files.forEach((file) => uploadFormData.append("images", file));

      const response = await API.post(
        "/upload/products/multiple",
        uploadFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );

      // Directly append the returned URLs
      if (response.data.images && Array.isArray(response.data.images)) {
        // Add to gallery images - response.data.images already has {url, publicId} objects
        setGalleryImages((prev) => [...prev, ...response.data.images]);
        toast.success(`${response.data.count} images uploaded successfully`);
      } else {
        throw new Error("No image data returned from server");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload gallery images"
      );
    } finally {
      setUploading(false);
    }
  };

  const removeMainImage = () => {
    setMainImage(null);
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Double-check user status before submission
    if (userRole !== "seller_approved" || !profileComplete) {
      toast.error(
        "You need approved seller status with complete profile to add products"
      );
      return;
    }

    // Validation
    if (!mainImage) {
      toast.error("Please upload a main product image");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a product description");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    // Validate sale price if provided
    if (
      formData.salePrice &&
      parseFloat(formData.salePrice) >= parseFloat(formData.price)
    ) {
      toast.error("Sale price must be less than regular price");
      return;
    }

    // Validate bulk pricing tiers
    if (bulkPricingEnabled && !validateBulkTiers()) {
      return;
    }

    setIsLoading(true);

    try {
      // Combine main image and gallery images
      const allImages = [mainImage, ...galleryImages].filter(
        (img) => img !== null
      );

      console.log("=== FRONTEND SUBMISSION ===");
      console.log("All images to send:", allImages);
      console.log("Main image:", mainImage);
      console.log("Gallery images:", galleryImages);
      console.log("=== END LOG ===");

      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        images: allImages, // This should be array of {url, publicId} objects
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag !== "")
          : [],
        salePrice: formData.salePrice
          ? parseFloat(formData.salePrice)
          : undefined,
        featured: formData.featured,
        status: formData.status,
      };

      console.log("Product data being sent:", productData);

      // Send product data to backend
      const response = await API.post("/products", productData);

      if (response.data.message === "Product created successfully") {
        const productId = response.data.product._id;

        // Create bulk pricing tiers if enabled
        if (bulkPricingEnabled && bulkTiers.length > 0) {
          try {
            // enable bulk pricing for the product
            await API.patch(`/products/${productId}/bulk-pricing/toggle`, {
              enabled: true,
            });

            // create bulk tiers
            await Promise.all(
              bulkTiers.map((tier) =>
                API.post(`/products/${productId}/bulk-pricing`, tier)
              )
            );

            toast.success("Product and bulk pricing tiers added successfully!");
          } catch (tierError) {
            console.error("Error creating bulk tiers:", tierError);
            toast.success(
              "Product added, but there was an issue with bulk pricing tiers"
            );
          }
        } else {
          toast.success("Product added successfully!");
        }

        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          category: "",
          tags: "",
          salePrice: "",

          featured: false,
          status: "active",
        });
        setMainImage(null);
        setGalleryImages([]);
        setBulkPricingEnabled(false);
        setBulkTiers([]);

        // Redirect to products page
        setTimeout(() => {
          navigate("/seller/manage-products");
        }, 2000);
      }
    } catch (error) {
      console.error("Full error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          "Failed to add product. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light font-inter overflow-y-auto overflow-x-hidden">
      <div className="container p-6 mx-auto h-full">
        {/* Header with Status Indicator */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-neutral-600 hover:text-neutral-800"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-neutral-800">
                Add New Product
              </h1>
              <p className="text-neutral-600">
                Add a new product to your store
              </p>
            </div>
          </div>

          {/* Status Indicator - Small and subtle when everything is OK */}
          <div className="flex items-center px-3 py-2 bg-green-50 border border-green-100 rounded-lg md:px-4 md:py-2.5">
            <FaCheckCircle className="text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-700 md:text-base">
              Account Active
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-neutral-300">
            <h2 className="text-xl font-semibold text-neutral-800">
              Product Information
            </h2>
            <p className="text-sm text-neutral-600">
              Fill in the details of your product
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Product Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaTag className="text-neutral-400" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    className="w-full py-3 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Category *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaBox className="text-neutral-400" />
                  </div>
                  <select
                    name="category"
                    className="w-full py-3 pl-10 pr-10 border rounded-lg appearance-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Regular Price */}
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Regular Price (PKR) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-neutral-400">Rs</span>
                  </div>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full py-3 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              {/* Sale Price */}
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Sale Price (PKR) - Optional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-neutral-400">Rs</span>
                  </div>
                  <input
                    name="salePrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full py-3 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                    value={formData.salePrice}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Discounted price for sales
                </p>
              </div>
              {/* Stock Quantity */}
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Stock Quantity *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaBox className="text-neutral-400" />
                  </div>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    className="w-full py-3 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              {/* Status */}
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Product Status
                </label>
                <select
                  name="status"
                  className="w-full py-3 px-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
              {/* Tags */}
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Tags
                </label>
                <input
                  name="tags"
                  type="text"
                  className="w-full py-3 px-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="tag1, tag2, tag3 (comma separated)"
                  value={formData.tags}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Separate tags with commas
                </p>
              </div>
              {/* Featured Product Checkbox */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    name="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="flex items-center ml-2 text-sm text-neutral-700">
                    <FaStar className="mr-1 text-yellow-500" />
                    Feature this product on homepage
                  </span>
                </label>
                <p className="mt-1 text-xs text-neutral-500">
                  Featured products will be highlighted on the homepage
                </p>
              </div>
              {/* Description */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows="4"
                  className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your product in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {/* Bulk Pricing Section */}
              <div className="md:col-span-2">
                <div className="p-6 border rounded-lg border-neutral-200 bg-background-subtle">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800 flex items-center">
                      <FaLayerGroup className="mr-2 text-primary-600" />
                      Bulk Pricing
                    </h3>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={bulkPricingEnabled}
                          onChange={(e) =>
                            setBulkPricingEnabled(e.target.checked)
                          }
                          className="sr-only"
                        />
                        <div
                          className={`block w-10 h-6 rounded-full transition-colors ${
                            bulkPricingEnabled
                              ? "bg-primary-600"
                              : "bg-neutral-300"
                          }`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            bulkPricingEnabled ? "transform translate-x-4" : ""
                          }`}
                        ></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-neutral-700">
                        Enable Bulk Pricing
                      </span>
                    </label>
                  </div>

                  {bulkPricingEnabled && (
                    <div className="space-y-4">
                      <p className="text-sm text-neutral-600">
                        Set quantity-based discounts to encourage bulk
                        purchases. Customers will automatically get better
                        prices when ordering larger quantities.
                      </p>

                      {bulkTiers.length > 0 && (
                        <div className="space-y-3">
                          {bulkTiers.map((tier, index) => (
                            <div
                              key={index}
                              className="p-4 border rounded-lg bg-white border-neutral-200"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-neutral-800">
                                  Tier {index + 1}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => removeBulkTier(index)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <FaTimes size={14} />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div>
                                  <label className="block mb-1 text-xs font-medium text-neutral-700">
                                    Minimum Quantity *
                                  </label>
                                  <input
                                    type="number"
                                    min="2"
                                    value={tier.minQuantity}
                                    onChange={(e) =>
                                      updateBulkTier(
                                        index,
                                        "minQuantity",
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="w-full p-2 text-sm border rounded border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    placeholder="e.g., 10"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-xs font-medium text-neutral-700">
                                    Discount Type
                                  </label>
                                  <select
                                    value={tier.discountType}
                                    onChange={(e) =>
                                      updateBulkTier(
                                        index,
                                        "discountType",
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-2 text-sm border rounded border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                  >
                                    <option value="percentage">
                                      Percentage
                                    </option>
                                    <option value="fixed">Fixed Amount</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block mb-1 text-xs font-medium text-neutral-700">
                                    Discount Value *
                                  </label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                                      {tier.discountType === "percentage" ? (
                                        <FaPercentage
                                          className="text-neutral-400"
                                          size={12}
                                        />
                                      ) : (
                                        <FaMoneyBillWave
                                          className="text-neutral-400"
                                          size={12}
                                        />
                                      )}
                                    </div>
                                    <input
                                      type="number"
                                      step={
                                        tier.discountType === "percentage"
                                          ? "0.1"
                                          : "0.01"
                                      }
                                      min="0"
                                      value={tier.discountValue}
                                      onChange={(e) =>
                                        updateBulkTier(
                                          index,
                                          "discountValue",
                                          e.target.value
                                        )
                                      }
                                      className="w-full p-2 pl-8 text-sm border rounded border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                      placeholder={
                                        tier.discountType === "percentage"
                                          ? "e.g., 10"
                                          : "e.g., 50"
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              {tier.calculatedPrice && formData.price && (
                                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                  <p className="text-xs text-green-700">
                                    <strong>Final Price:</strong> Rs{" "}
                                    {tier.calculatedPrice} per unit (Regular: Rs{" "}
                                    {formData.price})
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={addBulkTier}
                        className="flex items-center px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
                      >
                        <FaPlus className="mr-2" size={12} />
                        Add Bulk Tier
                      </button>

                      {bulkTiers.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-700">
                            <strong>Note:</strong> Tiers will be automatically
                            sorted by quantity. Customers will get the best
                            applicable discount based on their order quantity.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Image Upload */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Main Product Image *
                </label>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-neutral-300">
                  {mainImage ? (
                    <div className="relative w-full text-center">
                      <img
                        src={mainImage?.url}
                        alt="Main product"
                        className="object-cover w-32 h-32 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeMainImage}
                        className="absolute p-1 text-white transform -translate-y-1/2 bg-red-500 rounded-full top-1/2 right-4 hover:bg-red-600"
                        title="Remove image"
                      >
                        <FaTimes size={12} />
                      </button>
                      <div className="mt-2 text-xs text-neutral-500">
                        Main product image
                      </div>
                    </div>
                  ) : (
                    <>
                      <FaImage className="mb-3 text-3xl text-neutral-400" />
                      <p className="mb-2 text-sm text-neutral-600">
                        Set main product image
                      </p>
                      <p className="mb-2 text-xs text-neutral-500">
                        Supports: JPEG, PNG, WebP (Max: 10MB)
                      </p>
                      <input
                        type="file"
                        accept="image/jpeg, image/jpg, image/png, image/webp"
                        onChange={handleMainImageUpload}
                        className="absolute opacity-0 cursor-pointer"
                        id="main-image-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="main-image-upload"
                        className={`px-4 py-2 mt-2 text-sm font-medium text-white transition duration-300 rounded-lg cursor-pointer ${
                          uploading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700"
                        }`}
                      >
                        {uploading ? (
                          <>
                            <FaSpinner className="inline mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Main Image"
                        )}
                      </label>
                    </>
                  )}
                </div>
              </div>
              {/* Gallery Images Upload */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Gallery Images (Optional)
                </label>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-neutral-300">
                  <FaUpload className="mb-3 text-3xl text-neutral-400" />
                  <p className="mb-2 text-sm text-neutral-600">
                    Click to upload additional product images
                  </p>
                  <p className="text-xs text-neutral-500">
                    Maximum 10 images (JPEG, PNG, JPG, WebP) - 10MB each
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    onChange={handleGalleryUpload}
                    className="absolute opacity-0 cursor-pointer"
                    id="gallery-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="gallery-upload"
                    className={`px-4 py-2 mt-4 text-sm font-medium text-white transition duration-300 rounded-lg cursor-pointer ${
                      uploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-primary-600 hover:bg-primary-700"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="inline mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Gallery Images"
                    )}
                  </label>
                </div>

                {/* Gallery Preview */}
                {galleryImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium text-neutral-700">
                      Gallery Images ({galleryImages.length}/10):
                    </h4>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {galleryImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl?.url}
                            alt={`Gallery ${index + 1}`}
                            className="object-cover w-full h-24 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100 hover:bg-red-600"
                            title="Remove image"
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-8 space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 transition duration-300 border rounded-lg border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || uploading || !mainImage}
                className="flex items-center px-6 py-3 font-medium text-white transition duration-300 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
