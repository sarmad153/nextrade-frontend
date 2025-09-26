import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaBox, 
  FaFilter,
  FaEye,
  FaArrowUp,
  FaArrowDown,
  FaSortAmountDown,
  FaTimes,
  FaTags,
  FaImage,
  FaCheck,
  FaEyeSlash,
  FaSave,
  FaTimesCircle,
  FaUser,
  FaStore,
  FaExternalLinkAlt,
  FaBars,
  FaTimesCircle as FaClose
} from 'react-icons/fa';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingField, setEditingField] = useState('');
  const [editingValue, setEditingValue] = useState('');
  const [viewProduct, setViewProduct] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Enhanced mock data with simplified seller information
  const mockProducts = [
    {
      id: 1,
      sku: 'ELEC-001',
      name: 'Wireless Bluetooth Headphones',
      category: 'Electronics',
      price: 129.99,
      salePrice: 99.99,
      stock: 45,
      status: 'active',
      visibility: 'public',
      sales: 234,
      revenue: 23400,
      createdAt: '2024-01-15',
      featured: true,
      tags: ['audio', 'wireless', 'bluetooth'],
      images: ['headphones1.jpg', 'headphones2.jpg'],
      description: 'High-quality wireless headphones with noise cancellation technology. Perfect for music lovers and professionals.',
      lowStockAlert: false,
      deleted: false,
      seller: {
        id: 101,
        name: 'TechGadgets Inc.',
        storeName: 'TechGadgets Store',
      }
    },
    {
      id: 2,
      sku: 'ELEC-002',
      name: 'Smart Fitness Watch',
      category: 'Electronics',
      price: 199.99,
      salePrice: null,
      stock: 12,
      status: 'active',
      visibility: 'public',
      sales: 189,
      revenue: 37799,
      createdAt: '2024-01-20',
      featured: false,
      tags: ['fitness', 'smartwatch', 'health'],
      images: ['watch1.jpg', 'watch2.jpg'],
      description: 'Advanced fitness tracking smartwatch with heart rate monitoring and GPS.',
      lowStockAlert: false,
      deleted: false,
      seller: {
        id: 102,
        name: 'FitTech Solutions',
        storeName: 'FitTech World',
      }
    },
    {
      id: 3,
      sku: 'ACC-001',
      name: 'Premium Laptop Backpack',
      category: 'Accessories',
      price: 79.99,
      salePrice: 69.99,
      stock: 0,
      status: 'out-of-stock',
      visibility: 'public',
      sales: 156,
      revenue: 10919,
      createdAt: '2024-01-10',
      featured: true,
      tags: ['laptop', 'travel', 'premium'],
      images: ['backpack1.jpg', 'backpack2.jpg'],
      description: 'Durable laptop backpack with multiple compartments and waterproof material.',
      lowStockAlert: true,
      deleted: false,
      seller: {
        id: 103,
        name: 'UrbanGear Co.',
        storeName: 'UrbanGear Outlet',
      }
    },
    {
      id: 4,
      sku: 'ELEC-003',
      name: 'Wireless Mouse',
      category: 'Electronics',
      price: 29.99,
      salePrice: 24.99,
      stock: 89,
      status: 'active',
      visibility: 'public',
      sales: 321,
      revenue: 8025,
      createdAt: '2024-01-25',
      featured: false,
      tags: ['computer', 'peripheral', 'wireless'],
      images: ['mouse1.jpg'],
      description: 'Ergonomic wireless mouse for enhanced productivity and comfort.',
      lowStockAlert: false,
      deleted: false,
      seller: {
        id: 101,
        name: 'TechGadgets Inc.',
        storeName: 'TechGadgets Store',
      }
    },
    {
      id: 5,
      sku: 'ELEC-004',
      name: 'Mechanical Keyboard',
      category: 'Electronics',
      price: 149.99,
      salePrice: null,
      stock: 23,
      status: 'active',
      visibility: 'public',
      sales: 98,
      revenue: 14699,
      createdAt: '2024-01-18',
      featured: true,
      tags: ['gaming', 'mechanical', 'rgb'],
      images: ['keyboard1.jpg', 'keyboard2.jpg'],
      description: 'RGB mechanical keyboard designed for gaming enthusiasts and typists.',
      lowStockAlert: false,
      deleted: false,
      seller: {
        id: 104,
        name: 'GamingPro Ltd.',
        storeName: 'GamingPro Shop',
      }
    }
  ];

  const categories = ['all', 'Electronics', 'Accessories', 'Clothing', 'Home', 'Sports'];
  const statusOptions = ['all', 'active', 'out-of-stock', 'low-stock', 'featured', 'inactive'];

  // Check if mobile on component mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const productsWithAlerts = mockProducts.map(product => ({
          ...product,
          lowStockAlert: product.stock > 0 && product.stock <= lowStockThreshold
        }));
        setProducts(productsWithAlerts);
        setFilteredProducts(productsWithAlerts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [lowStockThreshold]);

  useEffect(() => {
    let filtered = products.filter(product => !product.deleted);

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'featured') {
        filtered = filtered.filter(product => product.featured);
      } else if (selectedStatus === 'low-stock') {
        filtered = filtered.filter(product => product.lowStockAlert);
      } else {
        filtered = filtered.filter(product => product.status === selectedStatus);
      }
    }

    if (priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (sortBy === 'stock') {
        return sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      } else if (sortBy === 'sales') {
        return sortOrder === 'asc' ? a.sales - b.sales : b.sales - a.sales;
      } else if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder, priceRange]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDelete = (productId, permanent = false) => {
    if (permanent) {
      if (window.confirm('Permanently delete this product?')) {
        setProducts(products.filter(product => product.id !== productId));
        setSelectedProducts(selectedProducts.filter(id => id !== productId));
      }
    } else {
      if (window.confirm('Move product to trash?')) {
        setProducts(products.map(product => 
          product.id === productId ? { ...product, deleted: true } : product
        ));
        setSelectedProducts(selectedProducts.filter(id => id !== productId));
      }
    }
  };

  const handleEdit = (productId) => {
    // In a real application, this would navigate to edit page or open edit modal
    alert(`Edit product with ID: ${productId}\n\nIn a real application, this would open the edit form.`);
    console.log('Edit product:', productId);
  };

  const handleView = (product) => {
    setViewProduct(product);
  };

  const handleSellerClick = (sellerId) => {
    // Navigate to seller profile page
    alert(`View seller profile with ID: ${sellerId}\n\nIn a real application, this would open the seller profile page with all their products.`);
    console.log('View seller:', sellerId);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
    setSortOrder('asc');
    setSelectedProducts([]);
    setMobileFiltersOpen(false);
  };

  const startEditing = (product, field, value) => {
    setEditingProduct(product.id);
    setEditingField(field);
    setEditingValue(value);
  };

  const saveEditing = (productId) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, [editingField]: editingValue }
        : product
    ));
    setEditingProduct(null);
    setEditingField('');
    setEditingValue('');
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditingField('');
    setEditingValue('');
  };

  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map(product => product.id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    switch (bulkAction) {
      case 'delete':
        if (window.confirm(`Delete ${selectedProducts.length} product(s)?`)) {
          setProducts(products.map(product => 
            selectedProducts.includes(product.id) ? { ...product, deleted: true } : product
          ));
          setSelectedProducts([]);
        }
        break;
      case 'activate':
        setProducts(products.map(product => 
          selectedProducts.includes(product.id) ? {...product, status: 'active'} : product
        ));
        setSelectedProducts([]);
        break;
      case 'deactivate':
        setProducts(products.map(product => 
          selectedProducts.includes(product.id) ? {...product, status: 'inactive'} : product
        ));
        setSelectedProducts([]);
        break;
      case 'feature':
        setProducts(products.map(product => 
          selectedProducts.includes(product.id) ? {...product, featured: true} : product
        ));
        setSelectedProducts([]);
        break;
      case 'unfeature':
        setProducts(products.map(product => 
          selectedProducts.includes(product.id) ? {...product, featured: false} : product
        ));
        setSelectedProducts([]);
        break;
      case 'update-stock':
        const newStock = prompt('Enter new stock quantity:');
        if (newStock !== null && !isNaN(newStock)) {
          setProducts(products.map(product => 
            selectedProducts.includes(product.id) ? {...product, stock: parseInt(newStock)} : product
          ));
          setSelectedProducts([]);
        }
        break;
      default:
        break;
    }
    setBulkAction('');
  };

  const getStatusBadge = (status, stock, featured, lowStockAlert) => {
    if (featured) {
      return <span className="px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">Featured</span>;
    }
    if (status === 'out-of-stock' || stock === 0) {
      return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Out of Stock</span>;
    } else if (status === 'low-stock' || lowStockAlert) {
      return <span className="px-2 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">Low Stock</span>;
    } else if (status === 'inactive') {
      return <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">Inactive</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">In Stock</span>;
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <FaSortAmountDown className="ml-1 text-neutral-400" />;
    return sortOrder === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOnSale = (product) => {
    return product.salePrice && product.salePrice < product.price;
  };

  // Mobile Filters Sidebar
  const MobileFilters = () => {
    return (
      <div className="fixed inset-0 z-40 lg:hidden">
        {/* Semi-transparent overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-30"
          onClick={() => setMobileFiltersOpen(false)}
        ></div>
        
        <div className="absolute top-0 right-0 h-full overflow-y-auto bg-white shadow-xl w-80">
          <div className="flex items-center justify-between p-4 border-b border-neutral-300">
            <h3 className="text-lg font-semibold text-neutral-800">Filters</h3>
            <button 
              onClick={() => setMobileFiltersOpen(false)}
              className="p-2 text-neutral-500 hover:text-neutral-700"
            >
              <FaClose size={20} />
            </button>
          </div>
          
          <div className="p-4 space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-neutral-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-neutral-700">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-neutral-700">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 text-sm transition rounded-lg text-neutral-700 bg-background-subtle hover:bg-neutral-200"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 px-4 py-2 text-sm text-white transition rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Product View Modal with Simplified Seller Information
  const ProductViewModal = ({ product, onClose }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-background-light rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-neutral-300">
          <div className="flex items-center justify-between p-6 border-b border-neutral-300">
            <h2 className="text-xl font-bold text-neutral-800">Product Details</h2>
            <button onClick={onClose} className="p-2 transition text-neutral-500 hover:text-neutral-700">
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Product Information */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-neutral-800">Product Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-background-subtle">
                      <FaImage className="text-2xl text-neutral-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-800">{product.name}</h4>
                      <p className="text-sm text-neutral-600">SKU: {product.sku}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Category</label>
                      <p className="mt-1 text-sm text-neutral-800">{product.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Stock</label>
                      <p className="mt-1 text-sm text-neutral-800">{product.stock} units</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Price</label>
                    <p className="mt-1 text-lg font-semibold text-neutral-800">
                      ${product.price} 
                      {isOnSale(product) && (
                        <span className="ml-2 text-sm text-green-600">Sale: ${product.salePrice}</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Description</label>
                    <p className="mt-1 text-sm text-neutral-600">{product.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 text-xs font-medium rounded-full bg-secondary-200 text-primary-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Status</label>
                      <p className="mt-1">
                        {getStatusBadge(product.status, product.stock, product.featured, product.lowStockAlert)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Sales</label>
                      <p className="mt-1 text-sm text-neutral-800">{product.sales} units sold</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Information - Simplified */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-neutral-800">Seller Information</h3>
                <div className="p-4 rounded-lg bg-background-subtle">
                  <div className="flex items-center mb-4 space-x-3">
                    <div className="p-2 rounded-full bg-secondary-200">
                      <FaStore className="text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-800">{product.seller.storeName}</h4>
                      <p className="text-sm text-neutral-600">by {product.seller.name}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Seller Name</span>
                      <span className="text-sm font-medium text-neutral-800">{product.seller.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Store Name</span>
                      <span className="text-sm text-neutral-800">{product.seller.storeName}</span>
                    </div>
                    
                    <button
                      onClick={() => handleSellerClick(product.seller.id)}
                      className="flex items-center justify-center w-full px-4 py-2 mt-4 transition bg-white border rounded-lg text-primary-600 border-primary-600 hover:bg-secondary-200"
                    >
                      <FaUser className="mr-2" />
                      View Seller Profile
                      <FaExternalLinkAlt className="ml-2 text-xs" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => {
                      onClose();
                      handleEdit(product.id);
                    }}
                    className="w-full px-4 py-2 text-white transition rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      handleDelete(product.id);
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

  return (
    <div className="min-h-screen bg-background-light font-inter">
      <div className="p-4 md:p-6">
        {/* Simplified Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-neutral-800 md:text-3xl">Product Management</h1>
          <p className="text-neutral-600">Manage your product inventory efficiently</p>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="p-4 mb-6 border border-primary-600 bg-secondary-200 rounded-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <span className="font-medium text-primary-700">
                  {selectedProducts.length} product(s) selected
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-4 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose action...</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="feature">Mark as Featured</option>
                  <option value="unfeature">Remove Featured</option>
                  <option value="update-stock">Update Stock</option>
                  <option value="delete">Delete</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 text-sm text-white transition rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="px-4 py-2 text-sm transition bg-white border rounded-lg text-primary-600 border-primary-600 hover:bg-secondary-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="p-4 mb-6 bg-white border shadow-sm border-neutral-300 rounded-xl md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="relative max-w-md">
                <FaSearch className="absolute transform -translate-y-1/2 text-neutral-400 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition bg-background-subtle text-neutral-700 hover:bg-neutral-200 md:hidden"
              >
                <FaBars className="mr-2" />
                Filters
              </button>
              
              {/* Desktop Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`hidden md:flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                  showFilters 
                    ? 'bg-secondary-200 text-primary-700 border border-primary-600' 
                    : 'bg-background-subtle text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <FaFilter className="mr-2" />
                Filters
              </button>
              
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2.5 text-sm text-neutral-700 bg-background-subtle rounded-lg transition hover:bg-neutral-200"
              >
                <FaTimes className="mr-2" />
                Clear
              </button>
            </div>
          </div>

          {/* Desktop Filters */}
          {showFilters && !isMobile && (
            <div className="grid grid-cols-1 gap-4 p-4 mt-4 rounded-lg bg-background-subtle md:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="overflow-hidden bg-white border shadow-sm border-neutral-300 rounded-xl">
          {isLoading ? (
            <div className="p-8 text-center md:p-12">
              <div className="inline-block w-8 h-8 border-2 rounded-full border-primary-600 border-t-transparent animate-spin"></div>
              <p className="mt-3 text-neutral-600">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center md:p-12">
              <FaBox className="mx-auto text-4xl text-neutral-400" />
              <p className="mt-3 text-neutral-600">No products found</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-neutral-300 bg-background-subtle">
                    <tr>
                      <th className="w-12 px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Product
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:table-cell md:px-6 md:py-4">
                        Category
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Price
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 sm:table-cell md:px-6 md:py-4">
                        Stock
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 sm:table-cell md:px-6 md:py-4">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-300">
                    {currentProducts.map((product) => (
                      <tr key={product.id} className="transition hover:bg-background-subtle">
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-background-subtle md:w-10 md:h-10">
                              <FaImage className="text-neutral-400" />
                            </div>
                            <div className="ml-3 md:ml-4">
                              <div className="text-sm font-medium text-neutral-800">{product.name}</div>
                              <div className="text-xs text-neutral-600 md:text-sm">
                                <span className="text-neutral-500">by </span>
                                <button
                                  onClick={() => handleSellerClick(product.seller.id)}
                                  className="text-primary-600 hover:text-primary-700 hover:underline"
                                >
                                  {product.seller.name}
                                </button>
                              </div>
                              {/* Mobile-only category display */}
                              <div className="mt-1 text-xs text-neutral-500 md:hidden">
                                {product.category}
                              </div>
                              {/* Mobile-only status display */}
                              <div className="mt-1 md:hidden">
                                {getStatusBadge(product.status, product.stock, product.featured, product.lowStockAlert)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-neutral-800 whitespace-nowrap md:table-cell md:px-6 md:py-4">
                          {product.category}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-800 whitespace-nowrap md:px-6 md:py-4">
                          <div className="flex flex-col space-y-1 md:flex-row md:items-center md:space-y-0 md:space-x-2">
                            <span className="font-semibold">${product.price}</span>
                            {isOnSale(product) && (
                              <span className="px-1 py-0.5 text-xs text-green-600 bg-green-100 rounded md:px-2 md:py-1">
                                Sale: ${product.salePrice}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-neutral-800 whitespace-nowrap sm:table-cell md:px-6 md:py-4">
                          <span className={`font-medium ${product.lowStockAlert ? 'text-orange-600' : 'text-neutral-800'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 whitespace-nowrap sm:table-cell md:px-6 md:py-4">
                          {getStatusBadge(product.status, product.stock, product.featured, product.lowStockAlert)}
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
                              onClick={() => handleEdit(product.id)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-neutral-300 md:px-6 md:py-4">
                  <div className="flex flex-col items-center justify-between space-y-3 sm:flex-row sm:space-y-0">
                    <div className="text-sm text-neutral-700">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm font-medium bg-white border rounded-lg text-neutral-700 border-neutral-300 hover:bg-background-subtle disabled:opacity-50 md:px-4 md:py-2"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm font-medium bg-white border rounded-lg text-neutral-700 border-neutral-300 hover:bg-background-subtle disabled:opacity-50 md:px-4 md:py-2"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Sidebar */}
      {mobileFiltersOpen && <MobileFilters />}

      {/* Enhanced Product View Modal */}
      {viewProduct && (
        <ProductViewModal 
          product={viewProduct} 
          onClose={() => setViewProduct(null)} 
        />
      )}
    </div>
  );
};

export default AllProducts;