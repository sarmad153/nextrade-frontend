import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBox, FaMoneyBillWave, FaChartBar, FaArrowLeft, FaFilter } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const ManageProducts = () => {
  const location = useLocation();
  
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
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Check if the URL contains the Low Stock filter parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    
    if (status === 'Low Stock') {
      setSelectedStatus('Low Stock');
    }
  }, [location]);

  // Filter products based on search, category, and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter
  const categories = ['All', ...new Set(products.map(product => product.category))];
  
  // Get unique statuses for filter
  const statuses = ['All', ...new Set(products.map(product => product.status))];

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
      default: return 'bg-neutral-300 text-neutral-800';
    }
  };

  return (
    <div className="min-h-screen p-4 bg-background-light md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Mobile Filter Section - Always Visible */}
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
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
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
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards - Fixed horizontal scrolling */}
        <div className="mb-6 md:mb-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <div className="p-3 bg-white rounded-lg shadow md:p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full text-primary-600 bg-secondary-200 md:p-3">
                  <FaBox className="text-sm md:text-lg" />
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Total Products</h3>
                  <p className="text-lg font-bold text-neutral-800 md:text-2xl">{products.length}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg shadow md:p-4">
              <div className="flex items-center">
                <div className="p-2 text-green-600 bg-green-100 rounded-full md:p-3">
                  <FaMoneyBillWave className="text-sm md:text-lg" />
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Active Listings</h3>
                  <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                    {products.filter(p => p.status === 'Active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg shadow md:p-4">
              <div className="flex items-center">
                <div className="p-2 text-yellow-600 bg-yellow-100 rounded-full md:p-3">
                  <FaChartBar className="text-sm md:text-lg" />
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Low Stock</h3>
                  <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                    {products.filter(p => p.status === 'Low Stock').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg shadow md:p-4">
              <div className="flex items-center">
                <div className="p-2 text-red-600 bg-red-100 rounded-full md:p-3">
                  <FaBox className="text-sm md:text-lg" />
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Out of Stock</h3>
                  <p className="text-lg font-bold text-neutral-800 md:text-2xl">
                    {products.filter(p => p.status === 'Out of Stock').length}
                  </p>
                </div>
              </div>
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
                  placeholder="Search products..."
                  className="w-full py-2 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                className="px-4 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                className="px-4 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <Link to="/add-product" className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700" >
                <FaPlus className="mr-2" /> Add New Product
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
                  <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6">
                    Product
                  </th>
                  <th scope="col" className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell">
                    Category
                  </th>
                  <th scope="col" className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell">
                    Price
                  </th>
                  <th scope="col" className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell">
                    Stock
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-neutral-500 md:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4 whitespace-nowrap md:px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <img className="object-cover w-10 h-10 rounded-md" src={product.image} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">{product.name}</div>
                          <div className="text-xs text-neutral-500 md:hidden">{product.category}</div>
                          <div className="text-xs text-neutral-500 md:hidden">Rs {product.price.toFixed(2)} | Stock: {product.stock}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm text-neutral-500">{product.category}</div>
                    </td>
                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm text-neutral-900">Rs {product.price.toFixed(2)}</div>
                    </td>
                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm text-neutral-900">{product.stock}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap md:px-6">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-right whitespace-nowrap md:px-6">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 text-primary-600 rounded hover:bg-secondary-200 md:p-1.5"
                          title="Edit Product"
                        >
                          <FaEdit className="text-sm md:text-base" />
                        </button>
                        <button
                          onClick={() => confirmDelete(product)}
                          className="p-1 text-red-600 rounded hover:bg-red-100 md:p-1.5"
                          title="Delete Product"
                        >
                          <FaTrash className="text-sm md:text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-8 text-center md:py-12">
              <FaBox className="w-10 h-10 mx-auto text-neutral-400 md:w-12 md:h-12" />
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No products found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-neutral-800">Edit Product</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-neutral-700">Product Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-neutral-700">Category</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-neutral-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-neutral-700">Stock</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-neutral-700">Status</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({...editingProduct, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Low Stock">Low Stock</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border rounded-lg text-neutral-700 border-neutral-300 hover:bg-neutral-50"
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
              <h2 className="mb-2 text-xl font-bold text-neutral-800">Confirm Deletion</h2>
              <p className="mb-6 text-neutral-600">
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border rounded-lg text-neutral-700 border-neutral-300 hover:bg-neutral-50"
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