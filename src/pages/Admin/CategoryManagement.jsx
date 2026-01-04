import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaSearch,
  FaSave,
  FaStar,
  FaImage,
  FaUpload,
  FaTimes,
} from "react-icons/fa";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { getImageUrl } from "../../../utils/imageHelper";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("list");
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("FaShoppingBag");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Available icons for dropdown
  const availableIcons = [
    { value: "FaShoppingBag", label: "Shopping Bag" },
    { value: "FaMobile", label: "Mobile" },
    { value: "FaTshirt", label: "T-Shirt" },
    { value: "FaHome", label: "Home" },
    { value: "FaUtensils", label: "Utensils" },
    { value: "FaFutbol", label: "Sports" },
    { value: "FaBook", label: "Book" },
    { value: "FaLaptop", label: "Laptop" },
    { value: "FaHeadphones", label: "Headphones" },
    { value: "FaCar", label: "Car" },
  ];

  const extractImageFromResponse = (data) => {
    if (!data) return "";

    console.log("Extract function called with:", {
      data: data,
      image: data.image,
      type: typeof data.image,
    });

    // If image is already a string
    if (typeof data.image === "string") {
      return data.image;
    }

    // If data itself is a string (shouldn't happen but just in case)
    if (typeof data === "string") {
      return data;
    }

    // If image is an object with url property
    if (data.image && typeof data.image === "object" && data.image.url) {
      return data.image.url;
    }

    // If data has url property directly
    if (data.url && typeof data.url === "string") {
      return data.url;
    }

    return "";
  };
  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await API.get("/categories/with-counts");

      // DEBUG: Check what we get from API
      console.log("API Response:", response.data);
      if (response.data.length > 0) {
        console.log("First category from API:", {
          name: response.data[0].name,
          image: response.data[0].image,
          type: typeof response.data[0].image,
          isString: typeof response.data[0].image === "string",
          isObject: typeof response.data[0].image === "object",
        });
      }

      // Format categories to ensure consistent image structure
      const formattedCategories = response.data.map((category) => {
        const extractedImage = extractImageFromResponse(category);
        console.log(`Category "${category.name}":`, {
          original: category.image,
          extracted: extractedImage,
          originalType: typeof category.image,
          extractedType: typeof extractedImage,
        });

        return {
          ...category,
          image: extractedImage,
        };
      });

      setCategories(formattedCategories);
      setFilteredCategories(formattedCategories);
    } catch (err) {
      // Fallback to basic categories without counts
      try {
        const basicResponse = await API.get("/categories");
        const categoriesWithDefaultCounts = basicResponse.data.map((cat) => ({
          ...cat,
          image: extractImageFromResponse(cat),
          productCount: 0,
        }));
        setCategories(categoriesWithDefaultCounts);
        setFilteredCategories(categoriesWithDefaultCounts);
      } catch (basicError) {
        toast.error("Failed to load categories");
        setCategories([]);
        setFilteredCategories([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  // Handle create category
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("icon", icon);
      formData.append("isFeatured", isFeatured);

      // Append image if selected
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      setUploading(true);

      await API.post("/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchCategories();
      toast.success("Category created successfully!");
      resetForm();
      setCurrentView("list");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setUploading(false);
    }
  };

  // Handle edit category
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("icon", icon);
      formData.append("isFeatured", isFeatured);

      // Append new image if selected
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      setUploading(true);

      await API.put(`/categories/${currentCategory._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchCategories();
      toast.success("Category updated successfully!");
      resetForm();
      setCurrentView("list");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await API.delete(`/categories/${id}`);
      await fetchCategories();
      toast.success("Category deleted successfully!");
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("Cannot delete category with associated products");
      } else {
        toast.error(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, JPG, PNG)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Set up edit form
  const setupEditForm = (category) => {
    setCurrentCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    setIcon(category.icon || "FaShoppingBag");
    setIsFeatured(category.isFeatured || false);
    setCurrentView("edit");
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("FaShoppingBag");
    setIsFeatured(false);
    setSelectedFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Go back to list
  const handleBackToList = () => {
    resetForm();
    setCurrentView("list");
  };

  // Toggle featured status
  const toggleFeatured = async (id) => {
    try {
      const category = categories.find((cat) => cat._id === id);
      await API.put(`/categories/${id}`, {
        name: category.name,
        description: category.description,
        icon: category.icon,
        isFeatured: !category.isFeatured,
      });

      await fetchCategories();
      toast.success(
        `Category ${
          category.isFeatured ? "removed from" : "added to"
        } featured!`
      );
    } catch (err) {
      toast.error("Failed to update featured status");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light font-inter">
      <div className="p-4 md:p-6">
        {/* Header  */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Category Management
            </h1>
            <p className="text-gray-600">
              Manage product categories and organization
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView("create")}
              className="flex items-center px-4 py-2 font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              <FaPlus className="mr-2" /> Add New
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 mb-6 bg-white border shadow-sm rounded-xl border-neutral-300 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="relative max-w-md">
                <FaSearch className="absolute transform -translate-y-1/2 text-neutral-400 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent md:py-2.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* List View */}
        {currentView === "list" && (
          <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-neutral-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-neutral-300 bg-background-subtle">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                      Image
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                      Name
                    </th>
                    <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:table-cell md:px-6 md:py-4">
                      Description
                    </th>
                    <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 sm:table-cell md:px-6 md:py-4">
                      Featured
                    </th>
                    <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 lg:table-cell md:px-6 md:py-4">
                      Products
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-300">
                  {filteredCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="transition hover:bg-background-subtle"
                    >
                      <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                        <div className="relative w-10 h-10 md:w-12 md:h-12">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="object-cover w-10 h-10 rounded-lg md:w-12 md:h-12"
                              onError={(e) => {
                                e.target.src = "/placeholder-category.jpg";
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 bg-neutral-200 rounded-lg md:w-12 md:h-12">
                              <FaImage className="text-neutral-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                        <div className="text-sm font-medium text-neutral-800">
                          {category.name}
                        </div>
                        <div className="text-xs text-neutral-600 md:text-sm">
                          {category.description
                            ? category.description.substring(0, 50) + "..."
                            : "No description"}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500 md:hidden">
                          {category.isFeatured ? "Featured" : "Standard"} •{" "}
                          {category.productCount || 0} products
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-neutral-800 whitespace-nowrap md:table-cell md:px-6 md:py-4">
                        {category.description || "No description"}
                      </td>
                      <td className="hidden px-4 py-3 whitespace-nowrap sm:table-cell md:px-6 md:py-4">
                        <button
                          onClick={() => toggleFeatured(category._id)}
                          className={`p-2 rounded-full ${
                            category.isFeatured
                              ? "text-yellow-500 bg-yellow-100"
                              : "text-neutral-400 bg-neutral-100"
                          }`}
                        >
                          <FaStar />
                        </button>
                      </td>
                      <td className="hidden px-4 py-3 whitespace-nowrap lg:table-cell md:px-6 md:py-4">
                        <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                          {category.productCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap md:px-6 md:py-4">
                        <div className="flex items-center space-x-1 md:space-x-2">
                          <button
                            onClick={() => setupEditForm(category)}
                            className="p-1.5 transition rounded-lg text-primary-600 hover:text-primary-800 hover:bg-secondary-200 md:p-2"
                            title="Edit Category"
                          >
                            <FaEdit size={12} className="md:size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="p-1.5 text-red-600 transition rounded-lg hover:text-red-800 hover:bg-red-100 md:p-2"
                            title="Delete Category"
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

            {filteredCategories.length === 0 && (
              <div className="p-8 text-center md:p-12">
                <FaImage className="mx-auto text-4xl text-gray-400" />
                <p className="mt-3 text-gray-600">
                  {searchTerm
                    ? `No categories found matching "${searchTerm}"`
                    : "No categories found"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setCurrentView("create")}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Create your first category
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit View */}
        {(currentView === "create" || currentView === "edit") && (
          <div className="bg-white border shadow-sm rounded-xl border-neutral-300">
            <div className="flex items-center p-4 border-b border-neutral-300 md:p-6">
              <button
                onClick={handleBackToList}
                className="p-2 mr-3 text-primary-600 rounded-full hover:bg-primary-100"
              >
                <FaArrowLeft />
              </button>
              <h3 className="text-lg font-semibold text-neutral-800 md:text-xl">
                {currentView === "create"
                  ? "Create New Category"
                  : "Edit Category"}
              </h3>
            </div>

            <form
              onSubmit={currentView === "create" ? handleCreate : handleEdit}
              className="p-4 md:p-6"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter category name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Description *
                    </label>
                    <textarea
                      rows="4"
                      className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter category description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Icon
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                    >
                      {availableIcons.map((iconOption) => (
                        <option key={iconOption.value} value={iconOption.value}>
                          {iconOption.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                      />
                      <span className="text-sm font-medium text-neutral-700">
                        Featured Category
                      </span>
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Category Image
                    </label>
                    <div className="mb-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg, image/jpg, image/png"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-400"
                      >
                        <FaUpload className="mr-2 text-neutral-500" />
                        <span className="text-sm text-neutral-600">
                          Choose Image
                        </span>
                      </label>
                      {selectedFile && (
                        <div className="flex items-center mt-3 gap-3">
                          <span className="text-sm text-neutral-600 truncate">
                            {selectedFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="p-1 text-neutral-500 hover:text-neutral-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>

                    {(imagePreview ||
                      (currentView === "edit" && currentCategory?.image)) && (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-neutral-700">
                          {imagePreview ? "Upload Preview" : "Current Image"}
                        </label>
                        <div className="p-4 bg-neutral-100 rounded-lg">
                          <img
                            src={
                              imagePreview ||
                              getImageUrl(
                                currentCategory?.image,
                                "/placeholder-category.jpg"
                              )
                            }
                            alt="Preview"
                            onError={(e) => {
                              console.error(
                                "Failed to load image:",
                                currentCategory?.image
                              );
                              e.target.src = "/placeholder-category.jpg";
                            }}
                            className="object-cover w-full h-32 rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 mt-6 space-x-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="px-6 py-3 border rounded-lg border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center px-6 py-3 font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {uploading
                    ? "Uploading..."
                    : currentView === "create"
                    ? "Create Category"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
