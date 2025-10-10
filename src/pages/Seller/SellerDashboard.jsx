import React, { useState, useEffect } from 'react';
import { 
  FaBox, 
  FaMoneyBillWave, 
  FaShoppingCart, 
  FaTruck, 
  FaExclamationTriangle, 
  FaArrowRight, 
  FaPlus, 
  FaEdit, 
  FaChartLine 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  // Sample data - in a real app, this would come from API
  const sampleStats = {
    totalProducts: 24,
    totalOrders: 156,
    totalRevenue: 12540.75,
    pendingOrders: 12
  };

  const recentOrders = [
    { id: 'ORD-12345', customer: 'John Smith', product: 'Premium T-Shirt', amount: 59.98, status: 'Processing' },
    { id: 'ORD-12346', customer: 'Sarah Johnson', product: 'Wireless Headphones', amount: 79.99, status: 'Shipped' },
    { id: 'ORD-12347', customer: 'Michael Brown', product: 'Leather Wallet', amount: 49.99, status: 'Delivered' },
    { id: 'ORD-12348', customer: 'Emily Davis', product: 'Running Shoes', amount: 89.99, status: 'Processing' }
  ];

  const lowStockProducts = [
    { name: 'Sports Running Shoes', stock: 8, threshold: 10 },
    { name: 'Designer Handbag', stock: 3, threshold: 5 },
    { name: 'Wireless Earbuds', stock: 12, threshold: 15 }
  ];

  // Check user role on component mount
  useEffect(() => {
    // Simulate API call to check user role
    const checkUserRole = () => {
      setTimeout(() => {
        // In a real app, this would come from authentication context or API
        const role = localStorage.getItem('userRole') || 'seller';
        
        if (role !== 'seller') {
          // Redirect or show error if not a seller
          console.log('Access denied. Seller role required.');
        }
        
        setUserRole(role);
        setStats(sampleStats);
        setLoading(false);
      }, 500);
    };

    checkUserRole();
  }, []);

  // Show loading state while checking role
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not a seller
  if (userRole !== 'seller') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="max-w-md p-4 text-center bg-white rounded-lg shadow-md md:p-6">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-red-500 md:text-5xl" />
          <h2 className="mb-2 text-xl font-bold text-neutral-800 md:text-2xl">Access Denied</h2>
          <p className="mb-4 text-neutral-600 md:mb-6">You need seller privileges to access this dashboard.</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-background-light md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:mb-8">
          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-secondary-200 text-primary-600 md:p-3">
                <FaBox className="text-sm md:text-lg" />
              </div>
              <div className="ml-2 md:ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Total Products</h3>
                <p className="text-lg font-bold text-neutral-800 md:text-xl lg:text-2xl">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-green-600 bg-green-100 rounded-full md:p-3">
                <FaShoppingCart className="text-sm md:text-lg" />
              </div>
              <div className="ml-2 md:ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Total Orders</h3>
                <p className="text-lg font-bold text-neutral-800 md:text-xl lg:text-2xl">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-blue-600 bg-blue-100 rounded-full md:p-3">
                <FaMoneyBillWave className="text-sm md:text-lg" />
              </div>
              <div className="ml-2 md:ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Total Revenue</h3>
                <p className="text-lg font-bold text-neutral-800 md:text-xl lg:text-2xl">Rs {stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-yellow-600 bg-yellow-100 rounded-full md:p-3">
                <FaTruck className="text-sm md:text-lg" />
              </div>
              <div className="ml-2 md:ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Pending Orders</h3>
                <p className="text-lg font-bold text-neutral-800 md:text-xl lg:text-2xl">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2 lg:gap-6 lg:mb-8">
          {/* Recent Orders */}
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-4 border-b border-neutral-200 md:p-6">
              <h2 className="flex items-center text-lg font-bold text-neutral-800 md:text-xl">
                <FaShoppingCart className="mr-2 text-primary-600" />
                Recent Orders
              </h2>
            </div>
            <div className="divide-y divide-neutral-200">
              {recentOrders.map((order, index) => (
                <div key={index} className="p-4 md:p-6">
                  <div className="flex flex-col justify-between md:flex-row md:items-start">
                    <div className="mb-2 md:mb-0">
                      <h3 className="font-medium text-neutral-900">{order.id}</h3>
                      <p className="text-sm text-neutral-600">{order.customer} - {order.product}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-semibold text-neutral-900">Rs {order.amount}</p>
                      <span className={`inline-block px-2 py-1 mt-1 text-xs rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-neutral-200 md:p-6">
              <Link to="/seller/orders" className="flex items-center justify-center text-primary-600 hover:text-primary-700">
                View all orders <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-4 border-b border-neutral-200 md:p-6">
              <h2 className="flex items-center text-lg font-bold text-neutral-800 md:text-xl">
                <FaExclamationTriangle className="mr-2 text-yellow-600" />
                Low Stock Alert
              </h2>
            </div>
            <div className="divide-y divide-neutral-200">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="p-4 md:p-6">
                  <div className="flex flex-col justify-between md:flex-row md:items-center">
                    <div className="mb-2 md:mb-0">
                      <h3 className="font-medium text-neutral-900">{product.name}</h3>
                      <p className="text-sm text-neutral-600">Only {product.stock} left in stock</p>
                    </div>
                    <div className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full md:text-sm md:px-3">
                      Restock needed
                    </div>
                  </div>
                  <div className="w-full h-2 mt-2 rounded-full bg-neutral-200">
                    <div 
                      className="h-2 bg-red-500 rounded-full" 
                      style={{ width: `${(product.stock / product.threshold) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-neutral-200 md:p-6">
              <Link to="/seller/manage-products?status=Low Stock" className="flex items-center justify-center text-primary-600 hover:text-primary-700">
                Manage inventory <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-white rounded-lg shadow md:p-6 md:mb-8">
          <h2 className="flex items-center mb-4 text-lg font-bold text-neutral-800 md:text-xl">
            <FaChartLine className="mr-2 text-primary-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            <Link 
              to="/seller/add-product" 
              className="p-3 transition-colors border rounded-lg border-neutral-200 hover:border-primary-300 hover:bg-primary-50 md:p-4"
            >
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-secondary-200 text-primary-600 md:p-2">
                  <FaPlus className="text-sm md:text-base" />
                </div>
                <div className="ml-2 md:ml-3">
                  <h3 className="text-sm font-medium text-neutral-900 md:text-base">Add New Product</h3>
                  <p className="text-xs text-neutral-600 md:text-sm">Create a new listing</p>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/seller/manage-products" 
              className="p-3 transition-colors border rounded-lg border-neutral-200 hover:border-primary-300 hover:bg-primary-50 md:p-4"
            >
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-secondary-200 text-primary-600 md:p-2">
                  <FaEdit className="text-sm md:text-base" />
                </div>
                <div className="ml-2 md:ml-3">
                  <h3 className="text-sm font-medium text-neutral-900 md:text-base">Manage Products</h3>
                  <p className="text-xs text-neutral-600 md:text-sm">Edit existing listings</p>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/seller/orders?status=processing" 
              className="p-3 transition-colors border rounded-lg border-neutral-200 hover:border-primary-300 hover:bg-primary-50 md:p-4"
            >
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-secondary-200 text-primary-600 md:p-2">
                  <FaTruck className="text-sm md:text-base" />
                </div>
                <div className="ml-2 md:ml-3">
                  <h3 className="text-sm font-medium text-neutral-900 md:text-base">Process Orders</h3>
                  <p className="text-xs text-neutral-600 md:text-sm">Manage pending orders</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;