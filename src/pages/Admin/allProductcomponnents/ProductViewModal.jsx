import React from "react";
import { FaTimes, FaUser, FaStore, FaExternalLinkAlt } from "react-icons/fa";

const ProductViewModal = ({
  viewProduct,
  setViewProduct,
  handleEdit,
  handleDelete,
  handleSellerClick,
  getStatusBadge,
  ProductImage,
}) => {
  if (!viewProduct) return null;

  const hasDiscount =
    viewProduct.salePrice && viewProduct.salePrice < viewProduct.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((viewProduct.price - viewProduct.salePrice) / viewProduct.price) * 100
      )
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
          <button
            onClick={() => setViewProduct(null)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Product Information */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Product Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <ProductImage product={viewProduct} className="w-16 h-16" />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {viewProduct.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      SKU: {viewProduct.sku}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <p className="mt-1 text-sm text-gray-800">
                      {viewProduct.category}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock
                    </label>
                    <p className="mt-1 text-sm text-gray-800">
                      {viewProduct.stock} units
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <div className="mt-1">
                    {hasDiscount ? (
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-green-600">
                          Rs {viewProduct.salePrice}
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          Rs {viewProduct.price}
                        </p>
                        <p className="text-xs font-semibold text-red-600">
                          {discountPercentage}% OFF
                        </p>
                      </div>
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">
                        Rs {viewProduct.price}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <p className="mt-1 text-sm text-gray-600">
                    {viewProduct.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewProduct.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600"
                      >
                        {tag}
                      </span>
                    )) || (
                      <span className="text-sm text-gray-500">No tags</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <p className="mt-1">
                      {getStatusBadge(
                        viewProduct.status,
                        viewProduct.stock,
                        viewProduct.featured,
                        viewProduct.lowStockAlert
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sales
                    </label>
                    <p className="mt-1 text-sm text-gray-800">
                      {viewProduct.sales || 0} units sold
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Seller Information
              </h3>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <FaStore className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {viewProduct.seller?.storeName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      by {viewProduct.seller?.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Seller Name</span>
                    <span className="text-sm font-medium text-gray-800">
                      {viewProduct.seller?.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email</span>
                    <span className="text-sm text-gray-800">
                      {viewProduct.seller?.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Store Name</span>
                    <span className="text-sm text-gray-800">
                      {viewProduct.seller?.storeName}
                    </span>
                  </div>

                  {/* Updated button to use the new modal */}
                  <button
                    onClick={() => {
                      setViewProduct(null); // Close product modal
                      handleSellerClick(viewProduct.seller); // Open seller modal
                    }}
                    className="flex items-center justify-center w-full px-4 py-2 mt-4 transition bg-white border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <FaUser className="mr-2" />
                    View Seller Profile
                    <FaExternalLinkAlt className="ml-2 text-xs" />
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    setViewProduct(null);
                    handleEdit(viewProduct);
                  }}
                  className="w-full px-4 py-2 text-white transition rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => {
                    setViewProduct(null);
                    handleDelete(viewProduct.id);
                  }}
                  className="w-full px-4 py-2 text-red-600 transition bg-red-100 border border-red-200 rounded-lg hover:bg-red-200"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;
