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
  FaShoppingCart,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCreditCard,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaStore,
  FaEllipsisV
} from 'react-icons/fa';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [mobileView, setMobileView] = useState(false);

  // Mock orders data
  const mockOrders = [
    {
      id: 'ORD-001',
      customer: {
        id: 101,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        address: '123 Main St, New York, NY 10001'
      },
      products: [
        {
          id: 1,
          name: 'Wireless Bluetooth Headphones',
          price: 129.99,
          quantity: 1,
          image: 'headphones.jpg'
        },
        {
          id: 2,
          name: 'Phone Case - Premium',
          price: 24.99,
          quantity: 2,
          image: 'phone-case.jpg'
        }
      ],
      totalAmount: 179.97,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'credit_card',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      shippingAddress: {
        fullName: 'John Smith',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      trackingNumber: 'TRK789456123',
      notes: 'Customer requested express shipping'
    },
    {
      id: 'ORD-002',
      customer: {
        id: 102,
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1-555-0102',
        address: '456 Oak Ave, Los Angeles, CA 90210'
      },
      products: [
        {
          id: 3,
          name: 'Smart Fitness Watch',
          price: 199.99,
          quantity: 1,
          image: 'smartwatch.jpg'
        }
      ],
      totalAmount: 199.99,
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod: 'paypal',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      shippingAddress: {
        fullName: 'Sarah Johnson',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      trackingNumber: 'TRK123456789',
      notes: ''
    },
    {
      id: 'ORD-003',
      customer: {
        id: 103,
        name: 'Mike Wilson',
        email: 'mike.wilson@email.com',
        phone: '+1-555-0103',
        address: '789 Pine Rd, Chicago, IL 60601'
      },
      products: [
        {
          id: 4,
          name: 'Premium Laptop Backpack',
          price: 79.99,
          quantity: 1,
          image: 'backpack.jpg'
        },
        {
          id: 5,
          name: 'Wireless Mouse',
          price: 29.99,
          quantity: 1,
          image: 'mouse.jpg'
        },
        {
          id: 6,
          name: 'USB-C Hub',
          price: 49.99,
          quantity: 1,
          image: 'usb-hub.jpg'
        }
      ],
      totalAmount: 159.97,
      status: 'shipped',
      paymentStatus: 'paid',
      paymentMethod: 'credit_card',
      createdAt: '2024-01-13T16:45:00Z',
      updatedAt: '2024-01-14T11:30:00Z',
      shippingAddress: {
        fullName: 'Mike Wilson',
        street: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      trackingNumber: 'TRK456789123',
      notes: 'Fragile items included'
    },
    {
      id: 'ORD-004',
      customer: {
        id: 104,
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0104',
        address: '321 Elm St, Miami, FL 33101'
      },
      products: [
        {
          id: 7,
          name: 'Mechanical Keyboard',
          price: 149.99,
          quantity: 1,
          image: 'keyboard.jpg'
        }
      ],
      totalAmount: 149.99,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'credit_card',
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-13T14:20:00Z',
      shippingAddress: {
        fullName: 'Emily Davis',
        street: '321 Elm St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA'
      },
      trackingNumber: 'TRK987654321',
      notes: 'Customer very satisfied'
    },
    {
      id: 'ORD-005',
      customer: {
        id: 105,
        name: 'David Brown',
        email: 'david.brown@email.com',
        phone: '+1-555-0105',
        address: '654 Maple Dr, Seattle, WA 98101'
      },
      products: [
        {
          id: 8,
          name: 'Wireless Charger',
          price: 39.99,
          quantity: 3,
          image: 'charger.jpg'
        }
      ],
      totalAmount: 119.97,
      status: 'cancelled',
      paymentStatus: 'refunded',
      paymentMethod: 'credit_card',
      createdAt: '2024-01-11T11:20:00Z',
      updatedAt: '2024-01-12T10:45:00Z',
      shippingAddress: {
        fullName: 'David Brown',
        street: '654 Maple Dr',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      },
      trackingNumber: '',
      notes: 'Customer changed mind'
    },
    {
      id: 'ORD-006',
      customer: {
        id: 106,
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        phone: '+1-555-0106',
        address: '987 Cedar Ln, Boston, MA 02101'
      },
      products: [
        {
          id: 1,
          name: 'Wireless Bluetooth Headphones',
          price: 129.99,
          quantity: 2,
          image: 'headphones.jpg'
        }
      ],
      totalAmount: 259.98,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'paypal',
      createdAt: '2024-01-15T08:45:00Z',
      updatedAt: '2024-01-15T08:45:00Z',
      shippingAddress: {
        fullName: 'Lisa Anderson',
        street: '987 Cedar Ln',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA'
      },
      trackingNumber: '',
      notes: 'Awaiting payment confirmation'
    }
  ];

  const statusOptions = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setMobileView(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
      } else if (sortBy === 'id') {
        return sortOrder === 'asc' 
          ? a.id.localeCompare(b.id)
          : b.id.localeCompare(a.id);
      }
      return 0;
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, selectedStatus, sortBy, sortOrder]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleView = (order) => {
    setViewOrder(order);
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    if (window.confirm(`Change order status to ${newStatus}?`)) {
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              updatedAt: new Date().toISOString()
            }
          : order
      ));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSortBy('date');
    setSortOrder('desc');
    setSelectedOrders([]);
  };

  const toggleOrderSelection = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === currentOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map(order => order.id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    const newStatus = bulkAction;
    if (window.confirm(`Update ${selectedOrders.length} order(s) to ${newStatus}?`)) {
      setOrders(orders.map(order => 
        selectedOrders.includes(order.id)
          ? {
              ...order,
              status: newStatus,
              updatedAt: new Date().toISOString()
            }
          : order
      ));
      setSelectedOrders([]);
      setBulkAction('');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: FaTruck },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: FaTruck },
      delivered: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${config.color}`}>
        <IconComponent size={10} />
        {!mobileView && <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock },
      failed: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: FaMoneyBillWave }
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {paymentStatus.charAt(0).toUpperCase()}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <FaCreditCard className="text-primary-600" />;
      case 'paypal':
        return <FaMoneyBillWave className="text-primary-500" />;
      default:
        return <FaCreditCard className="text-neutral-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <FaSortAmountDown className="ml-1 text-neutral-400" />;
    return sortOrder === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />;
  };

  // Mobile Order Card
  const MobileOrderCard = ({ order }) => (
    <div className="p-4 mb-4 bg-white border rounded-lg shadow-sm border-neutral-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedOrders.includes(order.id)}
            onChange={() => toggleOrderSelection(order.id)}
            className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
          />
          <span className="font-semibold text-primary-700">{order.id}</span>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(order.status)}
          <button
            onClick={() => handleView(order)}
            className="p-1 rounded text-primary-600 hover:bg-secondary-200"
          >
            <FaEllipsisV size={14} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">Customer:</span>
          <span className="font-medium text-neutral-800">{order.customer.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Items:</span>
          <span className="text-neutral-800">{order.products.length} items</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Amount:</span>
          <span className="font-semibold text-primary-600">${order.totalAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Date:</span>
          <span className="text-neutral-600">{formatDate(order.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Payment:</span>
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>
      </div>

      <div className="flex justify-between pt-3 mt-3 border-t border-neutral-200">
        <button
          onClick={() => handleView(order)}
          className="flex items-center px-3 py-1 text-sm rounded-lg text-primary-600 bg-secondary-200 hover:bg-secondary-300"
        >
          <FaEye className="mr-1" size={12} />
          View
        </button>
        <button
          onClick={() => handleStatusUpdate(order.id, 'processing')}
          className="flex items-center px-3 py-1 text-sm text-green-600 bg-green-100 rounded-lg hover:bg-green-200"
        >
          <FaTruck className="mr-1" size={12} />
          Process
        </button>
      </div>
    </div>
  );

  // Order View Modal
  const OrderViewModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-background-light rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-neutral-300">
          <div className="flex items-center justify-between p-4 border-b md:p-6 border-neutral-300">
            <h2 className="text-lg font-bold md:text-xl text-neutral-800">Order Details - {order.id}</h2>
            <button onClick={onClose} className="p-2 transition text-neutral-500 hover:text-neutral-700">
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Order Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-neutral-800">Order Information</h3>
                  <div className="p-4 rounded-lg bg-background-subtle">
                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium text-neutral-700">Order ID:</span>
                        <p className="text-neutral-800">{order.id}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">Order Date:</span>
                        <p className="text-neutral-800">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">Status:</span>
                        <div className="mt-1">{getStatusBadge(order.status)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">Payment:</span>
                        <div className="mt-1">{getPaymentStatusBadge(order.paymentStatus)}</div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-neutral-700">Payment Method:</span>
                        <div className="flex items-center mt-1 space-x-2">
                          {getPaymentMethodIcon(order.paymentMethod)}
                          <span className="capitalize text-neutral-800">
                            {order.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {order.trackingNumber && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-neutral-700">Tracking Number:</span>
                          <p className="font-mono text-primary-600">{order.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-neutral-800">Customer Information</h3>
                  <div className="p-4 rounded-lg bg-background-subtle">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-neutral-500" />
                        <span className="font-medium text-neutral-800">{order.customer.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="text-neutral-500" />
                        <span className="text-neutral-700">{order.customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaPhone className="text-neutral-500" />
                        <span className="text-neutral-700">{order.customer.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-neutral-800">Shipping Address</h3>
                  <div className="p-4 rounded-lg bg-background-subtle">
                    <div className="flex items-start space-x-2">
                      <FaMapMarkerAlt className="mt-1 text-neutral-500" />
                      <div className="text-sm text-neutral-700">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items & Actions */}
              <div className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-neutral-800">Order Items</h3>
                  <div className="space-y-3">
                    {order.products.map((product, index) => (
                      <div key={index} className="flex items-center p-3 rounded-lg bg-background-subtle">
                        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg md:w-12 md:h-12">
                          <FaBox className="text-neutral-400" />
                        </div>
                        <div className="flex-1 ml-3">
                          <p className="font-medium text-neutral-800">{product.name}</p>
                          <p className="text-sm text-neutral-600">Qty: {product.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-800">${product.price}</p>
                          <p className="text-sm text-neutral-600">
                            Total: ${(product.price * product.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 mt-4 border-t border-neutral-300">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span className="text-neutral-700">Total Amount:</span>
                      <span className="text-primary-600">${order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-neutral-800">Update Status</h3>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(order.id, status)}
                        disabled={order.status === status}
                        className={`p-2 text-xs font-medium rounded-lg transition md:p-3 md:text-sm ${
                          order.status === status
                            ? 'bg-primary-600 text-white'
                            : 'bg-background-subtle text-neutral-700 hover:bg-secondary-200'
                        } disabled:opacity-50`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-neutral-800">Order Notes</h3>
                    <div className="p-4 rounded-lg bg-background-subtle">
                      <p className="text-sm text-neutral-700">{order.notes}</p>
                    </div>
                  </div>
                )}
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
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-neutral-800 md:text-3xl">Manage Orders</h1>
          <p className="text-neutral-600">View and manage customer orders</p>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="p-4 mb-6 border border-primary-600 bg-secondary-200 rounded-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <span className="font-medium text-primary-700">
                  {selectedOrders.length} order(s) selected
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 md:px-4"
                >
                  <option value="">Update status to...</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-3 py-2 text-sm text-white transition rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 md:px-4"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="px-3 py-2 text-sm transition bg-white border rounded-lg text-primary-600 border-primary-600 hover:bg-secondary-200 md:px-4"
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
                  placeholder="Search orders by ID, customer name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent md:py-2.5"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition md:px-4 md:py-2.5 ${
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
                className="flex items-center px-3 py-2 text-sm text-neutral-700 bg-background-subtle rounded-lg transition hover:bg-neutral-200 md:px-4 md:py-2.5"
              >
                <FaTimes className="mr-2" />
                Clear
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 gap-4 p-4 mt-4 rounded-lg bg-background-subtle md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">Order Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="date">Order Date</option>
                  <option value="amount">Total Amount</option>
                  <option value="id">Order ID</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table/Cards */}
        <div className="overflow-hidden bg-white border shadow-sm border-neutral-300 rounded-xl">
          {isLoading ? (
            <div className="p-8 text-center md:p-12">
              <div className="inline-block w-8 h-8 border-2 rounded-full border-primary-600 border-t-transparent animate-spin"></div>
              <p className="mt-3 text-neutral-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center md:p-12">
              <FaShoppingCart className="mx-auto text-4xl text-neutral-400" />
              <p className="mt-3 text-neutral-600">No orders found</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            </div>
          ) : mobileView ? (
            // Mobile View - Cards
            <div className="p-4">
              {currentOrders.map((order) => (
                <MobileOrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            // Desktop View - Table
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-neutral-300 bg-background-subtle">
                    <tr>
                      <th className="w-12 px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                        />
                      </th>
                      <th 
                        className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer text-neutral-700 md:px-6 md:py-4"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          Order ID
                          {getSortIcon('id')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Items
                      </th>
                      <th 
                        className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer text-neutral-700 md:px-6 md:py-4"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center">
                          Amount
                          {getSortIcon('amount')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Payment
                      </th>
                      <th 
                        className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer text-neutral-700 md:px-6 md:py-4"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center">
                          Date
                          {getSortIcon('date')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-300">
                    {currentOrders.map((order) => (
                      <tr key={order.id} className="transition hover:bg-background-subtle">
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-neutral-800 whitespace-nowrap md:px-6 md:py-4">
                          {order.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          <div>
                            <div className="text-sm font-medium text-neutral-800">{order.customer.name}</div>
                            <div className="text-sm text-neutral-600">{order.customer.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-800 whitespace-nowrap md:px-6 md:py-4">
                          {order.products.length} item(s)
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-neutral-800 whitespace-nowrap md:px-6 md:py-4">
                          ${order.totalAmount}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap md:px-6 md:py-4">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap md:px-6 md:py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(order)}
                              className="p-2 transition rounded-lg text-primary-600 hover:text-primary-800 hover:bg-secondary-200"
                              title="View order details"
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'processing')}
                              className="p-2 text-green-600 transition rounded-lg hover:text-green-800 hover:bg-green-100"
                              title="Process order"
                            >
                              <FaTruck size={14} />
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
                  <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <div className="text-sm text-neutral-700">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium bg-white border rounded-lg text-neutral-700 border-neutral-300 hover:bg-background-subtle disabled:opacity-50 md:px-4"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium bg-white border rounded-lg text-neutral-700 border-neutral-300 hover:bg-background-subtle disabled:opacity-50 md:px-4"
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

      {/* Order View Modal */}
      {viewOrder && (
        <OrderViewModal 
          order={viewOrder} 
          onClose={() => setViewOrder(null)} 
        />
      )}
    </div>
  );
};

export default ManageOrders;