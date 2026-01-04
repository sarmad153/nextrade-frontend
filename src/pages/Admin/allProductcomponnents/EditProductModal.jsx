import React from "react";
import { FaTimes, FaUpload, FaTag } from "react-icons/fa";

const EditProductModal = ({
  editModalOpen,
  setEditModalOpen,
  editingProduct,
  editFormData,
  handleInputChange,
  categories,
  handleImageUpload,
  uploadingImage,
  removeImage,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  handleUpdateProduct,
}) => {
  if (!editModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h2 className="text-xl font-bold text-gray-800">
            Edit Product - {editingProduct?.name}
          </h2>
          <button
            onClick={() => setEditModalOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Basic Information
              </h3>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  name="name"
                  type="text"
                  value={editFormData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Regular Price (Rs) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={editFormData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Sale Price (Rs)
                  </label>
                  <input
                    name="salePrice"
                    type="number"
                    value={editFormData.salePrice}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Stock *
                  </label>
                  <input
                    name="stock"
                    type="number"
                    value={editFormData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    name="featured"
                    type="checkbox"
                    checked={editFormData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Featured Product
                  </label>
                </div>
              </div>
            </div>

            {/* Images & Tags */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                  Product Images
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center px-4 py-2 text-sm text-white transition rounded-lg cursor-pointer bg-blue-600 hover:bg-blue-700">
                      <FaUpload className="mr-2" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    {uploadingImage && (
                      <div className="text-sm text-gray-600">Uploading...</div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {editFormData.images.map((image, index) => {
                      const imageUrl =
                        typeof image === "string" ? image : image?.url;

                      return (
                        <div key={index} className="relative group">
                          <img
                            src={
                              imageUrl &&
                              typeof imageUrl === "string" &&
                              imageUrl.startsWith("http")
                                ? imageUrl
                                : imageUrl
                                ? `https://nextrade-backend-production-a486.up.railway.app/${imageUrl}`
                                : "https://via.placeholder.com/80"
                            }
                            alt={`Product ${index + 1}`}
                            className="object-cover w-20 h-20 rounded-lg"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/80";
                            }}
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full opacity-0 group-hover:opacity-100"
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                  Product Tags
                </h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Add a tag and press Enter"
                      className="flex-1 px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 text-white transition rounded-lg bg-blue-600 hover:bg-blue-700"
                    >
                      <FaTag />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editFormData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(index)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <FaTimes size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleUpdateProduct}
              className="flex-1 px-4 py-2 text-white transition rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              Update Product
            </button>
            <button
              onClick={() => setEditModalOpen(false)}
              className="flex-1 px-4 py-2 text-gray-700 transition bg-white border rounded-lg border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
