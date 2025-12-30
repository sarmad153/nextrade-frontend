import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaBox,
  FaEye,
  FaTimes,
  FaImage,
  FaUser,
  FaStore,
  FaExternalLinkAlt,
  FaSync,
  FaUpload,
  FaTag,
  FaFilter,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../../api/axiosInstance";
import {
  EditProductModal,
  ProductViewModal,
  SellerInfoModal,
} from "../allProductcomponnents";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [categories, setCategories] = useState([]);
  const [selectedSellerFilter, setSelectedSellerFilter] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [viewProduct, setViewProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    featured: false,
    status: "active",
    tags: [],
    images: [],
    salePrice: "",
  });
  const [newTag, setNewTag] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/products/admin/products");
      const productsData = response.data.products || [];

      const productsWithAlerts = productsData.map((product) => {
        let sellerInfo = {
          id: product.seller?._id || "unknown",
          name: product.seller?.name || "Unknown Seller",
          email: product.seller?.email || "No email",
          storeName:
            product.seller?.storeName ||
            product.seller?.name ||
            "Unknown Store",
        };

        let categoryName = "Uncategorized";
        let categoryId = "";
        if (product.category) {
          if (typeof product.category === "object") {
            categoryName = product.category.name || "Uncategorized";
            categoryId = product.category._id || "";
          } else {
            categoryName = product.category;
          }
        }

        let imagesArray = [];
        if (product.images && Array.isArray(product.images)) {
          imagesArray = product.images;
        }

        return {
          id: product._id,
          name: product.name,
          sku: product.sku || `PROD-${product._id.substring(0, 8)}`,
          category: categoryName,
          categoryId: categoryId,
          price: product.price,
          salePrice: product.salePrice || null,
          stock: product.stock,
          status: product.status,
          featured: product.featured,
          description: product.description,
          tags: product.tags || [],
          images: imagesArray,
          sales: product.sales || 0,
          createdAt: product.createdAt,
          seller: sellerInfo,
          lowStockAlert: product.stock > 0 && product.stock <= 10,
        };
      });

      setProducts(productsWithAlerts);
      setFilteredProducts(productsWithAlerts);
    } catch (error) {
      toast.error("Failed to fetch products");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");
      setCategories(response.data || []);
    } catch (error) {
      setCategories([]);
    }
  };

  const handleSellerClick = (seller) => {
    setSelectedSeller(seller);
    setSellerModalOpen(true);
  };

  const handleSellerFilter = (seller) => {
    setSelectedSellerFilter(seller);
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const clearSellerFilter = () => {
    setSelectedSellerFilter(null);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await API.post("/upload/products/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = response.data.imageUrl;

      if (imageUrl) {
        setEditFormData((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }));
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const removeImage = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !editFormData.tags.includes(newTag.trim())) {
      setEditFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const categoryObj = categories.find((cat) => cat.name === product.category);

    setEditFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      category: categoryObj?._id || product.categoryId || "",
      featured: product.featured || false,
      status: product.status || "active",
      tags: product.tags || [],
      images: product.images || [],
      salePrice: product.salePrice?.toString() || "",
    });
    setEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        stock: parseInt(editFormData.stock),
        category: editFormData.category,
        featured: editFormData.featured,
        status: editFormData.status,
        tags: editFormData.tags,
        images: editFormData.images,
        salePrice: editFormData.salePrice
          ? parseFloat(editFormData.salePrice)
          : null,
      };

      const response = await API.put(
        `/products/${editingProduct.id}`,
        updateData
      );

      toast.success("Product updated successfully");
      setEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to update product");
      }
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await API.delete(`/products/${productId}`);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleView = (product) => {
    setViewProduct(product);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedProducts([]);
    setSelectedSellerFilter(null);
  };

  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map((product) => product.id));
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedSellerFilter && selectedSellerFilter.id) {
      filtered = filtered.filter(
        (product) => product.seller.id === selectedSellerFilter.id
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (selectedStatus !== "all") {
      if (selectedStatus === "featured") {
        filtered = filtered.filter((product) => product.featured);
      } else if (selectedStatus === "low-stock") {
        filtered = filtered.filter((product) => product.lowStockAlert);
      } else if (selectedStatus === "out-of-stock") {
        filtered = filtered.filter((product) => product.stock === 0);
      } else {
        filtered = filtered.filter(
          (product) => product.status === selectedStatus
        );
      }
    }

    setFilteredProducts(filtered);
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedSellerFilter,
  ]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleRefresh = () => {
    fetchProducts();
    toast.info("Products refreshed");
  };

  const ProductImage = ({ product, className = "w-8 h-8" }) => {
    const hasImages = product.images && product.images.length > 0;
    const imageUrl = hasImages ? product.images[0] : null;

    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 ${className} overflow-hidden`}
      >
        {imageUrl ? (
          <img
            src={
              imageUrl.startsWith("http")
                ? imageUrl
                : `http://localhost:5000${imageUrl}`
            }
            alt={product.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : null}
        {!imageUrl && <FaImage className="text-gray-400" size={16} />}
      </div>
    );
  };

  const ProductPrice = ({ product }) => {
    const hasDiscount = product.salePrice && product.salePrice < product.price;

    return (
      <div className="flex flex-col">
        {hasDiscount ? (
          <>
            <span className="font-semibold text-green-600">
              Rs {product.salePrice}
            </span>
            <span className="text-sm text-gray-500 line-through">
              Rs {product.price}
            </span>
            <span className="text-xs text-red-600">
              {Math.round(
                ((product.price - product.salePrice) / product.price) * 100
              )}
              % OFF
            </span>
          </>
        ) : (
          <span className="font-semibold text-gray-800">
            Rs {product.price}
          </span>
        )}
      </div>
    );
  };

  const getStatusBadge = (status, stock, featured, lowStockAlert) => {
    if (featured) {
      return (
        <span className="px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
          Featured
        </span>
      );
    }
    if (status === "out-of-stock" || stock === 0) {
      return (
        <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
          Out of Stock
        </span>
      );
    } else if (status === "low-stock" || lowStockAlert) {
      return (
        <span className="px-2 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">
          Low Stock
        </span>
      );
    } else if (status === "inactive") {
      return (
        <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
          Inactive
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
          In Stock
        </span>
      );
    }
  };

  const statusOptions = [
    "all",
    "active",
    "out-of-stock",
    "low-stock",
    "featured",
    "inactive",
  ];

  // Show loading spinner for entire page
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light font-inter">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Product Management
            </h1>
            <p className="text-gray-600">
              Manage your product inventory and listings
            </p>

            {selectedSellerFilter && (
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">
                  Showing products from:{" "}
                </span>
                <div className="flex items-center ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <FaFilter className="mr-1 text-xs" />
                  {selectedSellerFilter.storeName}
                  <button
                    onClick={clearSellerFilter}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 text-sm font-medium transition bg-white border rounded-lg text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              <FaSync className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters*/}
        <div className="p-4 mb-6 bg-white border shadow-sm rounded-xl border-neutral-300 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="relative max-w-md">
                <FaSearch className="absolute transform -translate-y-1/2 text-neutral-400 left-3 top-1/2" />
                <input
                  type="text"
                  className="w-full py-2 pl-10 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent md:py-2.5"
                  placeholder="Search by name, SKU, category, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              {/* Category Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 sm:w-auto"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 sm:w-auto"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "all"
                        ? "All Status"
                        : status.replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={clearFilters}
                className="flex items-center justify-center w-full px-4 py-2.5 text-sm text-neutral-700 rounded-lg bg-background-subtle hover:bg-neutral-200 sm:w-auto"
              >
                <FaTimes className="mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white border shadow-sm border-gray-300 rounded-lg">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center md:p-12">
              <FaBox className="mx-auto text-4xl text-gray-400" />
              <p className="mt-3 text-gray-600">
                {selectedSellerFilter
                  ? `No products found from ${selectedSellerFilter.storeName}`
                  : "No products found"}
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-300 bg-gray-50">
                    <tr>
                      <th className="w-12 px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-gray-700 md:px-6 md:py-4">
                        <input
                          type="checkbox"
                          checked={
                            selectedProducts.length ===
                              currentProducts.length &&
                            currentProducts.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-gray-700 md:px-6 md:py-4">
                        Product
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-gray-700 md:table-cell md:px-6 md:py-4">
                        Category
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-gray-700 md:px-6 md:py-4">
                        Price
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-gray-700 sm:table-cell md:px-6 md:py-4">
                        Stock
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-gray-700 sm:table-cell md:px-6 md:py-4">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-gray-700 md:px-6 md:py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-300">
                    {currentProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          <div className="flex items-center">
                            <ProductImage product={product} />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-800">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-600 md:text-sm">
                                <span className="text-gray-500">by </span>
                                <button
                                  onClick={() =>
                                    handleSellerClick(product.seller)
                                  }
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {product.seller.name}
                                </button>
                              </div>
                              <div className="mt-1 text-xs text-gray-500 md:hidden">
                                {product.category} • Stock: {product.stock}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-gray-800 whitespace-nowrap md:table-cell md:px-6 md:py-4">
                          {product.category}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap md:px-6 md:py-4">
                          <ProductPrice product={product} />
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-gray-800 whitespace-nowrap sm:table-cell md:px-6 md:py-4">
                          <span
                            className={
                              product.lowStockAlert
                                ? "text-orange-600"
                                : "text-gray-800"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 whitespace-nowrap sm:table-cell md:px-6 md:py-4">
                          {getStatusBadge(
                            product.status,
                            product.stock,
                            product.featured,
                            product.lowStockAlert
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap md:px-6 md:py-4">
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <button
                              onClick={() => handleView(product)}
                              className="p-1.5 transition rounded-lg text-primary-600 hover:text-primary-800 hover:bg-secondary-200 md:p-2"
                              title="View product details"
                            >
                              <FaEye size={12} className="md:size-3.5" />
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1.5 text-green-600 transition rounded-lg hover:text-green-800 hover:bg-green-100 md:p-2"
                              title="Edit product"
                            >
                              <FaEdit size={12} className="md:size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 text-red-600 transition rounded-lg hover:text-red-800 hover:bg-red-100 md:p-2"
                              title="Delete product"
                            >
                              <FaTrash size={12} className="md:size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <EditProductModal
        editModalOpen={editModalOpen}
        setEditModalOpen={setEditModalOpen}
        editingProduct={editingProduct}
        editFormData={editFormData}
        handleInputChange={handleInputChange}
        categories={categories}
        handleImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
        removeImage={removeImage}
        newTag={newTag}
        setNewTag={setNewTag}
        addTag={addTag}
        removeTag={removeTag}
        handleUpdateProduct={handleUpdateProduct}
      />

      <ProductViewModal
        viewProduct={viewProduct}
        setViewProduct={setViewProduct}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleSellerClick={handleSellerClick}
        getStatusBadge={getStatusBadge}
        ProductImage={ProductImage}
      />

      <SellerInfoModal
        sellerModalOpen={sellerModalOpen}
        setSellerModalOpen={setSellerModalOpen}
        selectedSeller={selectedSeller}
        products={products}
        setSearchTerm={setSearchTerm}
        onSellerFilter={handleSellerFilter}
      />
    </div>
  );
};

export default AllProducts;
