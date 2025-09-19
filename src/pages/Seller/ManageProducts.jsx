import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBox, FaMoneyBillWave, FaChartBar, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ManageProducts = () => {
  // Sample product data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Premium Cotton T-Shirt',
      category: 'Clothing',
      price: 29.99,
      stock: 150,
      image: 'https://via.placeholder.com/80',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Wireless Bluetooth Headphones',
      category: 'Electronics',
      price: 79.99,
      stock: 75,
      image: 'https://via.placeholder.com/80',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Stainless Steel Water Bottle',
      category: 'Accessories',
      price: 24.99,
      stock: 0,
      image: 'https://via.placeholder.com/80',
      status: 'Out of Stock'
    },
    {
      id: 4,
      name: 'Leather Wallet',
      category: 'Accessories',
      price: 49.99,
      stock: 42,
      image: 'https://via.placeholder.com/80',
      status: 'Active'
    },
    {
      id: 5,
      name: 'Sports Running Shoes',
      category: 'Footwear',
      price: 89.99,
      stock: 28,
      image: 'https://via.placeholder.com/80',
      status: 'Low Stock'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['All', ...new Set(products.map(product => product.category))];

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct({...product});
  };

  // Handle save edited product
  const handleSaveEdit = () => {
    if (editingProduct) {
      setProducts(products.map(product => 
        product.id === editingProduct.id ? editingProduct : product
      ));
      setEditingProduct(null);
    }
  };

  // Handle delete confirmation
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Handle delete product
  const handleDelete = () => {
    if (productToDelete) {
      setProducts(products.filter(product => product.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background-light">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <button className="flex items-center mr-4 text-primary-600 hover:text-primary-700">
              <FaArrowLeft className="mr-1" /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Manage My Products</h1>
          </div>
          <p className="text-gray-600">View, edit, and manage your product listings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 text-indigo-600 bg-indigo-100 rounded-full">
                <FaBox className="text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 text-green-600 bg-green-100 rounded-full">
                <FaMoneyBillWave className="text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Active Listings</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {products.filter(p => p.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 text-yellow-600 bg-yellow-100 rounded-full">
                <FaChartBar className="text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Low Stock</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {products.filter(p => p.status === 'Low Stock').length}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 text-red-600 bg-red-100 rounded-full">
                <FaBox className="text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Out of Stock</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {products.filter(p => p.status === 'Out of Stock').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <Link to="/addproduct" className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700" >
                <FaPlus className="mr-2" /> Add New Product
              </Link>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <img className="object-cover w-10 h-10 rounded-md" src={product.image} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(product)}
                        className="mr-3 text-indigo-600 hover:text-indigo-900"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => confirmDelete(product)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <FaBox className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
              <h2 className="mb-4 text-xl font-bold">Edit Product</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
              <h2 className="mb-2 text-xl font-bold">Confirm Deletion</h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;