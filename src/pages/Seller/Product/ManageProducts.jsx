import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaBox,
  FaMoneyBillWave,
  FaChartBar,
  FaArrowLeft,
  FaSpinner,
  FaStar,
  FaBarcode,
  FaUserClock,
  FaExclamationTriangle,
  FaLayerGroup,
  FaPercentage,
  FaMoneyBillWave as FaMoneyBill,
  FaTimes,
  FaFilter,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaMapMarkerAlt,
  FaUser,
  FaImage,
  FaTag,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const ManageProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [categories, setCategories] = useState(["All"]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // View Product Details State
  const [viewProductModal, setViewProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Bulk Pricing State
  const [bulkPricingModal, setBulkPricingModal] = useState(false);
  const [selectedProductForBulk, setSelectedProductForBulk] = useState(null);
  const [bulkTiers, setBulkTiers] = useState([]);
  const [bulkPricingEnabled, setBulkPricingEnabled] = useState(false);

  // Check user role and profile status on component mount
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const currentRole = user?.role;
        setUserRole(currentRole);

        // Fetch profile data to get profile completion status
        if (["seller_pending", "seller_approved"].includes(currentRole)) {
          try {
            const profileResponse = await API.get("/profile/me");
            const profileData = profileResponse.data;
            setProfileComplete(profileData.isProfileComplete || false);
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

  // Fetch seller's products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Only fetch products if user is approved seller with complete profile
        if (userRole === "seller_approved" && profileComplete) {
          // Fetch seller's products
          const productsResponse = await API.get("/products/seller/products");
          const productsData =
            productsResponse.data.products || productsResponse.data || [];

          // Fetch bulk pricing for each product
          const productsWithBulkPricing = await Promise.all(
            productsData.map(async (product) => {
              try {
                const bulkResponse = await API.get(
                  `/products/${product._id}/bulk-pricing`
                );
                return {
                  ...product,
                  bulkPricingEnabled: bulkResponse.data.length > 0,
                  bulkTiers: bulkResponse.data,
                };
              } catch (error) {
                return {
                  ...product,
                  bulkPricingEnabled: false,
                  bulkTiers: [],
                };
              }
            })
          );

          setProducts(productsWithBulkPricing);

          // Fetch categories for filter
          const categoriesResponse = await API.get("/categories");
          const categoriesData = categoriesResponse.data;
          setCategoryOptions(categoriesData);

          const categoryNames = [
            "All",
            ...categoriesData.map((cat) => cat.name),
          ];
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userRole, profileComplete]);

  // Check if the URL contains the Low Stock filter parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get("status");

    if (status === "Low Stock") {
      setSelectedStatus("Low Stock");
    }
  }, [location]);

  // Calculate product status based on stock AND model status
  const getProductStatus = (product) => {
    // Use model status if set, otherwise calculate from stock
    if (product.status && product.status !== "active") {
      return product.status.charAt(0).toUpperCase() + product.status.slice(1);
    }

    if (product.stock === 0) return "Out of Stock";
    if (product.stock < 10) return "Low Stock";
    return "Active";
  };

  // Filter products based on search, category, and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (product.sku || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || product.category?.name === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" || getProductStatus(product) === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique statuses for filter
  const statuses = ["All", "Active", "Low Stock", "Out of Stock", "Inactive"];

  // View Product Details
  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setViewProductModal(true);
  };

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct({
      ...product,
      category: product.category?._id || product.category,
      salePrice: product.salePrice || "",
      sku: product.sku || "",
      featured: product.featured || false,
      status: product.status || "active",
    });
  };

  // Handle save edited product with ALL fields
  const handleSaveEdit = async () => {
    if (editingProduct) {
      try {
        const productData = {
          name: editingProduct.name,
          description: editingProduct.description,
          price: parseFloat(editingProduct.price),
          stock: parseInt(editingProduct.stock),
          category: editingProduct.category,
          salePrice: editingProduct.salePrice
            ? parseFloat(editingProduct.salePrice)
            : undefined,
          sku: editingProduct.sku || undefined,
          featured: editingProduct.featured,
          status: editingProduct.status,
          tags: editingProduct.tags || [],
        };

        const response = await API.put(
          `/products/${editingProduct._id}`,
          productData
        );

        if (response.data.message === "Product updated successfully") {
          // Update local state
          setProducts(
            products.map((product) =>
              product._id === editingProduct._id
                ? response.data.product
                : product
            )
          );
          setEditingProduct(null);
          toast.success("Product updated successfully!");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update product"
        );
      }
    }
  };

  // Handle delete confirmation
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Handle delete product
  const handleDelete = async () => {
    if (productToDelete) {
      try {
        const response = await API.delete(`/products/${productToDelete._id}`);

        if (response.data.message === "Product deleted successfully") {
          // Remove from local state
          setProducts(
            products.filter((product) => product._id !== productToDelete._id)
          );
          setShowDeleteModal(false);
          setProductToDelete(null);
          toast.success("Product deleted successfully!");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete product"
        );
      }
    }
  };

  // Status badge color with all statuses
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "out of stock":
      case "out-of-stock":
        return "bg-red-100 text-red-800";
      case "low stock":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-neutral-300 text-neutral-800";
    }
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return <FaCheckCircle className="mr-1" />;
      case "out of stock":
      case "out-of-stock":
        return <FaTimes className="mr-1" />;
      case "low stock":
        return <FaExclamationTriangle className="mr-1" />;
      case "inactive":
        return <FaClock className="mr-1" />;
      default:
        return <FaBox className="mr-1" />;
    }
  };

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(
    (p) => getProductStatus(p) === "Active"
  ).length;
  const lowStockProducts = products.filter(
    (p) => getProductStatus(p) === "Low Stock"
  ).length;
  const outOfStockProducts = products.filter(
    (p) => getProductStatus(p) === "Out of Stock"
  ).length;

  // Clear filters function
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedStatus("All");
  };

  // Show loading state while fetching categories and user status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Show pending approval message
  if (userRole === "seller_pending") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-4 text-center bg-white rounded-lg shadow-md md:p-6">
          <FaUserClock className="mx-auto mb-4 text-5xl text-blue-500" />
          <h2 className="mb-3 text-2xl font-bold text-neutral-800">
            Approval Pending
          </h2>
          <p className="mb-4 text-neutral-600">
            Your seller application is under review. You need approved seller
            status to manage products.
          </p>
          <div className="p-4 mb-4 bg-blue-50 rounded-lg">
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
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            {profileComplete
              ? "View Business Profile"
              : "Complete Business Profile"}
          </Link>
        </div>
      </div>
    );
  }

  // Show profile incomplete message for approved sellers
  if (userRole === "seller_approved" && !profileComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-md">
          <FaExclamationTriangle className="mx-auto mb-4 text-5xl text-orange-500" />
          <h2 className="mb-3 text-2xl font-bold text-neutral-800">
            Complete Your Business Profile
          </h2>
          <p className="mb-4 text-neutral-600">
            Your seller account is approved! Please complete your business
            profile to start managing products and access all seller features.
          </p>
          <div className="p-4 mb-4 bg-orange-50 rounded-lg">
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

  // Show access denied if not an approved seller with complete profile
  if (userRole !== "seller_approved") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-md">
          <FaExclamationTriangle className="mx-auto mb-4 text-5xl text-red-500" />
          <h2 className="mb-3 text-2xl font-bold text-neutral-800">
            Access Denied
          </h2>
          <p className="mb-4 text-neutral-600">
            You need approved seller privileges to manage products.
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

  return (
    <div className="min-h-screen p-4 bg-background-light md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-800">
            Product Management
          </h1>
          <p className="text-neutral-600">
            Manage and track your product listings
          </p>
        </div>

        {/* Stats Cards  */}
        <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 md:gap-4 md:mb-8">
          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full text-primary-600 bg-secondary-200 md:p-3">
                <FaBox className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Total Products
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-green-600 bg-green-100 rounded-full md:p-3">
                <FaCheckCircle className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Active
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {activeProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-yellow-600 bg-yellow-100 rounded-full md:p-3">
                <FaExclamationTriangle className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Low Stock
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {lowStockProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-red-600 bg-red-100 rounded-full md:p-3">
                <FaTimes className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">
                  Out of Stock
                </h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                  {outOfStockProducts}
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
              placeholder="Search products..."
              className="w-full py-2 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaFilter className="text-neutral-400" />
              </div>
              <select
                className="w-full py-2 pl-10 pr-8 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaFilter className="text-neutral-400" />
              </div>
              <select
                className="w-full py-2 pl-10 pr-8 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
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
                  placeholder="Search products by name, or category"
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
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.slice(1).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaFilter className="text-neutral-400" />
                </div>
                <select
                  className="py-2 pl-10 pr-8 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-neutral-700 border rounded-lg border-neutral-300 hover:bg-neutral-50"
              >
                <FaTimes className="mr-2" />
                Clear
              </button>

              <Link
                to="/seller/add-product"
                className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                <FaPlus className="mr-2" />
                Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6"
                    style={{ minWidth: "250px" }} // Add minimum width
                  >
                    Product Details
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell"
                  >
                    Bulk Pricing
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-neutral-500 md:px-6"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="object-cover w-12 h-12 rounded-lg"
                              src={`https://nextrade-backend-production-a486.up.railway.app/${product.images[0]}`}
                              alt={product.name}
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-primary-100 rounded-lg">
                              <FaBox className="w-6 h-6 text-primary-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <div className="text-sm font-semibold text-neutral-900 truncate pr-4">
                              {product.name}
                            </div>
                            {product.featured && (
                              <FaStar
                                className="ml-1 text-yellow-500 flex-shrink-0"
                                size={14}
                              />
                            )}
                          </div>
                          <div className="text-sm text-neutral-600 line-clamp-2 mt-1">
                            {product.description || "No description"}
                          </div>
                          {/* Mobile-only info */}
                          <div className="mt-2 space-y-1 md:hidden">
                            <div className="text-xs text-neutral-500">
                              <span className="font-medium">Category:</span>{" "}
                              {product.category?.name || "Uncategorized"}
                            </div>
                            <div className="text-xs text-neutral-500">
                              <span className="font-medium">Stock:</span>{" "}
                              {product.stock}
                            </div>
                            <div className="text-xs text-neutral-500">
                              <span className="font-medium">Price:</span> Rs{" "}
                              {product.price?.toFixed(2)}
                              {product.salePrice && (
                                <span className="text-green-600 ml-1">
                                  → Rs {product.salePrice?.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500">
                              <span className="font-medium">Bulk:</span>{" "}
                              {product.bulkPricingEnabled
                                ? "Enabled"
                                : "Disabled"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="flex items-center">
                        <FaBox className="flex-shrink-0 w-4 h-4 mr-2 text-neutral-400" />
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {product.category?.name || "Uncategorized"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm">
                        {product.salePrice ? (
                          <div>
                            <span className="text-red-600 line-through">
                              Rs {product.price?.toFixed(2)}
                            </span>
                            <span className="ml-2 font-semibold text-green-600">
                              Rs {product.salePrice?.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-neutral-900">
                            Rs {product.price?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm font-medium text-neutral-900">
                        {product.stock}
                      </div>
                    </td>

                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm">
                        <span
                          className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                            product.bulkPricingEnabled
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <FaLayerGroup className="mr-1" size={10} />
                          {product.bulkPricingEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap md:px-6">
                      <span
                        className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          getProductStatus(product)
                        )}`}
                      >
                        {getStatusIcon(getProductStatus(product))}
                        {getProductStatus(product)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-right whitespace-nowrap md:px-6">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => viewProductDetails(product)}
                          className="p-2 text-primary-600 rounded-lg hover:bg-secondary-200 transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBulkPricing(product)}
                          className="p-2 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Bulk Pricing"
                        >
                          <FaLayerGroup className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Edit Product"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(product)}
                          className="p-2 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Product"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <FaBox className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                No products found
              </h3>
              <p className="text-neutral-600 max-w-md mx-auto">
                {products.length === 0
                  ? "You haven't added any products yet. Start by adding your first product."
                  : "No products match your current search criteria. Try adjusting your filters."}
              </p>
              {products.length === 0 && (
                <Link
                  to="/seller/add-product"
                  className="inline-flex items-center justify-center px-6 py-3 mt-4 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  <FaPlus className="mr-2" />
                  Add Your First Product
                </Link>
              )}
            </div>
          )}
        </div>

        {viewProductModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-800">
                      Product Details
                    </h2>
                    <p className="text-neutral-600">{selectedProduct.name}</p>
                  </div>
                  <button
                    onClick={() => setViewProductModal(false)}
                    className="p-2 text-neutral-400 hover:text-neutral-500 rounded-lg hover:bg-neutral-100"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Product Info & Status */}
                <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                  <div className="p-4 rounded-lg bg-neutral-50">
                    <h3 className="flex items-center mb-3 text-lg font-semibold text-neutral-800">
                      <FaBox className="mr-2 text-primary-600" />
                      Product Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <strong className="text-neutral-700">Name:</strong>
                        <p className="mt-1 text-neutral-900">
                          {selectedProduct.name}
                        </p>
                      </div>
                      <div>
                        <strong className="text-neutral-700">
                          Description:
                        </strong>
                        <p className="mt-1 text-neutral-900">
                          {selectedProduct.description ||
                            "No description available"}
                        </p>
                      </div>
                      <div>
                        <strong className="text-neutral-700">Category:</strong>
                        <p className="mt-1 text-neutral-900">
                          {selectedProduct.category?.name || "Uncategorized"}
                        </p>
                      </div>
                      <div>
                        <strong className="text-neutral-700">SKU:</strong>
                        <p className="mt-1 text-neutral-900">
                          {selectedProduct.sku || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <strong className="text-neutral-700">Tags:</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedProduct.tags &&
                          selectedProduct.tags.length > 0 ? (
                            selectedProduct.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                              >
                                <FaTag className="inline mr-1" size={8} />
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-500">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-50">
                    <h3 className="flex items-center mb-3 text-lg font-semibold text-neutral-800">
                      <FaMoneyBillWave className="mr-2 text-primary-600" />
                      Pricing & Inventory
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <strong className="text-neutral-700">
                          Regular Price:
                        </strong>
                        <p className="mt-1 text-lg font-bold text-neutral-900">
                          Rs {selectedProduct.price?.toFixed(2)}
                        </p>
                      </div>
                      {selectedProduct.salePrice && (
                        <div>
                          <strong className="text-neutral-700">
                            Sale Price:
                          </strong>
                          <p className="mt-1 text-lg font-bold text-green-600">
                            Rs {selectedProduct.salePrice?.toFixed(2)}
                          </p>
                          <p className="text-sm text-neutral-500">
                            Save Rs{" "}
                            {(
                              selectedProduct.price - selectedProduct.salePrice
                            ).toFixed(2)}{" "}
                            (
                            {Math.round(
                              (1 -
                                selectedProduct.salePrice /
                                  selectedProduct.price) *
                                100
                            )}
                            % off)
                          </p>
                        </div>
                      )}
                      <div>
                        <strong className="text-neutral-700">
                          Stock Quantity:
                        </strong>
                        <p className="mt-1 text-lg font-bold text-neutral-900">
                          {selectedProduct.stock} units
                        </p>
                      </div>
                      <div>
                        <strong className="text-neutral-700">Status:</strong>
                        <span
                          className={`ml-2 px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                            getProductStatus(selectedProduct)
                          )}`}
                        >
                          {getStatusIcon(getProductStatus(selectedProduct))}
                          {getProductStatus(selectedProduct)}
                        </span>
                      </div>
                      <div>
                        <strong className="text-neutral-700">Featured:</strong>
                        <span className="ml-2">
                          {selectedProduct.featured ? (
                            <span className="inline-flex items-center px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                              <FaStar className="mr-1" size={12} />
                              Featured Product
                            </span>
                          ) : (
                            <span className="text-neutral-500">
                              Not featured
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <strong className="text-neutral-700">
                          Bulk Pricing:
                        </strong>
                        <span className="ml-2">
                          {selectedProduct.bulkPricingEnabled ? (
                            <span className="inline-flex items-center px-2 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                              <FaLayerGroup className="mr-1" size={12} />
                              Enabled ({selectedProduct.bulkTiers?.length ||
                                0}{" "}
                              tiers)
                            </span>
                          ) : (
                            <span className="text-neutral-500">Disabled</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Images */}
                <div className="p-4 mb-6 rounded-lg bg-neutral-50">
                  <h3 className="flex items-center mb-3 text-lg font-semibold text-neutral-800">
                    <FaImage className="mr-2 text-primary-600" />
                    Product Images
                  </h3>
                  {selectedProduct.images &&
                  selectedProduct.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {selectedProduct.images.map((image, index) => (
                        <div key={index} className="overflow-hidden rounded-lg">
                          <img
                            src={`https://nextrade-backend-production-a486.up.railway.app/${image}`}
                            alt={`${selectedProduct.name} - ${index + 1}`}
                            className="object-cover w-full h-48 transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-neutral-300 rounded-lg">
                      <FaImage className="w-16 h-16 mb-4 text-neutral-400" />
                      <p className="text-neutral-600">No images available</p>
                    </div>
                  )}
                </div>

                {/* Bulk Pricing Details if Enabled */}
                {selectedProduct.bulkPricingEnabled &&
                  selectedProduct.bulkTiers &&
                  selectedProduct.bulkTiers.length > 0 && (
                    <div className="p-4 mb-6 rounded-lg bg-neutral-50">
                      <h3 className="flex items-center mb-3 text-lg font-semibold text-neutral-800">
                        <FaLayerGroup className="mr-2 text-primary-600" />
                        Bulk Pricing Tiers
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-100">
                            <tr>
                              <th className="px-4 py-2 text-xs font-medium tracking-wider text-left uppercase text-neutral-700">
                                Tier
                              </th>
                              <th className="px-4 py-2 text-xs font-medium tracking-wider text-left uppercase text-neutral-700">
                                Minimum Quantity
                              </th>
                              <th className="px-4 py-2 text-xs font-medium tracking-wider text-left uppercase text-neutral-700">
                                Discount Type
                              </th>
                              <th className="px-4 py-2 text-xs font-medium tracking-wider text-left uppercase text-neutral-700">
                                Discount Value
                              </th>
                              <th className="px-4 py-2 text-xs font-medium tracking-wider text-left uppercase text-neutral-700">
                                Final Price per Unit
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {selectedProduct.bulkTiers.map((tier, index) => {
                              let finalPrice = selectedProduct.price;
                              if (
                                tier.discountType === "percentage" &&
                                tier.discountValue
                              ) {
                                finalPrice =
                                  selectedProduct.price *
                                  (1 - tier.discountValue / 100);
                              } else if (
                                tier.discountType === "fixed" &&
                                tier.discountValue
                              ) {
                                finalPrice =
                                  selectedProduct.price - tier.discountValue;
                              }

                              return (
                                <tr key={index}>
                                  <td className="px-4 py-3 text-sm text-neutral-900">
                                    Tier {index + 1}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                    {tier.minQuantity}+ units
                                  </td>
                                  <td className="px-4 py-3 text-sm text-neutral-900">
                                    {tier.discountType === "percentage"
                                      ? "Percentage"
                                      : "Fixed Amount"}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-green-700">
                                    {tier.discountType === "percentage"
                                      ? `${tier.discountValue}%`
                                      : `Rs ${tier.discountValue}`}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold text-primary-600">
                                    Rs {finalPrice.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setViewProductModal(false);
                      handleEdit(selectedProduct);
                    }}
                    className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    <FaEdit className="mr-2" /> Edit Product
                  </button>

                  <button
                    onClick={() => {
                      setViewProductModal(false);
                      handleBulkPricing(selectedProduct);
                    }}
                    className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <FaLayerGroup className="mr-2" /> Manage Bulk Pricing
                  </button>

                  <button
                    onClick={() => {
                      setViewProductModal(false);
                      // You can add functionality to copy product URL or share
                      navigator.clipboard.writeText(
                        `${window.location.origin}/product/${selectedProduct._id}`
                      );
                      toast.success("Product URL copied to clipboard!");
                    }}
                    className="flex items-center px-4 py-2 text-neutral-700 border rounded-lg border-neutral-300 hover:bg-neutral-50"
                  >
                    <FaBarcode className="mr-2" /> Copy Product URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal*/}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-800">
                    Edit Product
                  </h2>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-2 text-neutral-400 hover:text-neutral-500 rounded-lg hover:bg-neutral-100"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Image Upload Section */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    Product Images
                  </label>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {editingProduct.images?.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`https://nextrade-backend-production-a486.up.railway.app/${image}`}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedImages = [...editingProduct.images];
                            updatedImages.splice(index, 1);
                            setEditingProduct({
                              ...editingProduct,
                              images: updatedImages,
                            });
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {/* Upload new image button */}
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-400">
                        <FaPlus className="w-8 h-8 text-neutral-400 mb-2" />
                        <span className="text-xs text-neutral-500">
                          Add Image
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const formData = new FormData();
                              formData.append("image", file);

                              const response = await API.post(
                                "/upload/products/single",
                                formData,
                                {
                                  headers: {
                                    "Content-Type": "multipart/form-data",
                                  },
                                }
                              );

                              const newImageUrl = response.data.imageUrl;
                              setEditingProduct({
                                ...editingProduct,
                                images: [
                                  ...(editingProduct.images || []),
                                  newImageUrl,
                                ],
                              });

                              toast.success("Image uploaded successfully");
                            } catch (error) {
                              toast.error("Failed to upload image");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Upload product images (JPG, PNG, max 5MB each)
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 md:gap-6">
                  {/* Existing form fields remain the same... */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Category *
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Category</option>
                      {categoryOptions.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      value={editingProduct.status}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Regular Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Sale Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      value={editingProduct.salePrice}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          salePrice: e.target.value
                            ? parseFloat(e.target.value)
                            : "",
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      value={editingProduct.stock}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
                        checked={editingProduct.featured}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            featured: e.target.checked,
                          })
                        }
                      />
                      <span className="flex items-center ml-2 text-sm text-neutral-700">
                        <FaStar className="mr-1 text-yellow-500" />
                        Featured Product
                      </span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Description *
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      rows="4"
                      value={editingProduct.description}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="px-6 py-2 border rounded-lg text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Pricing Modal */}
        {bulkPricingModal && selectedProductForBulk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Bulk Pricing - {selectedProductForBulk.name}
                  </h2>
                  <button
                    onClick={() => setBulkPricingModal(false)}
                    className="p-2 text-neutral-400 hover:text-neutral-500 rounded-lg hover:bg-neutral-100"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="p-4 mb-6 rounded-lg bg-neutral-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center text-lg font-semibold text-neutral-800">
                      <FaLayerGroup className="mr-2 text-primary-600" />
                      Bulk Pricing Configuration
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
                              className="p-4 bg-white rounded-lg"
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
                                  <FaTrash size={14} />
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
                                        <FaMoneyBill
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
                              {tier.calculatedPrice &&
                                selectedProductForBulk.price && (
                                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                    <p className="text-xs text-green-700">
                                      <strong>Final Price:</strong> Rs{" "}
                                      {tier.calculatedPrice} per unit (Regular:
                                      Rs {selectedProductForBulk.price})
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
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setBulkPricingModal(false)}
                    className="px-6 py-2 border rounded-lg text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveBulkPricing}
                    className="px-6 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    Save Bulk Pricing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-800">
                  Confirm Deletion
                </h2>
              </div>

              <div className="p-6">
                <p className="mb-6 text-neutral-600">
                  Are you sure you want to delete "{productToDelete?.name}"?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2 border rounded-lg text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
