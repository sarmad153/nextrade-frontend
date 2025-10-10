import React, { useState, useEffect } from 'react';
import { FaSearch, FaBox, FaMoneyBillWave, FaTruck, FaCheckCircle, FaClock, FaFilter, FaEye, FaTimes, FaEdit, FaChevronDown, FaBars, FaEllipsisV } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const SellerOrders = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const statusFromUrl = queryParams.get('status');
  
  // Sample orders data
  const [orders, setOrders] = useState([
    {
      id: 'ORD-12345',
      customer: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '+1 234-567-8900',
      product: 'Premium Cotton T-Shirt',
      date: '2023-10-15',
      status: 'Processing',
      quantity: 2,
      total: 59.98,
      payment: 'Paid',
      shippingAddress: '123 Main St, Anytown, AN 12345',
      items: [
        { name: 'Premium Cotton T-Shirt (Black, M)', price: 29.99, quantity: 2 }
      ]
    },
    {
      id: 'ORD-12346',
      customer: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1 234-567-8901',
      product: 'Wireless Bluetooth Headphones',
      date: '2023-10-14',
      status: 'Shipped',
      quantity: 1,
      total: 79.99,
      payment: 'Paid',
      shippingAddress: '456 Oak Ave, Somewhere, SW 67890',
      items: [
        { name: 'Wireless Bluetooth Headphones', price: 79.99, quantity: 1 }
      ]
    },
    {
      id: 'ORD-12347',
      customer: 'Michael Brown',
      customerEmail: 'michael@example.com',
      customerPhone: '+1 234-567-8902',
      product: 'Leather Wallet',
      date: '2023-10-13',
      status: 'Delivered',
      quantity: 1,
      total: 49.99,
      payment: 'Paid',
      shippingAddress: '789 Pine Rd, Nowhere, NW 45678',
      items: [
        { name: 'Leather Wallet (Brown)', price: 49.99, quantity: 1 }
      ]
    },
    {
      id: 'ORD-12348',
      customer: 'Emily Davis',
      customerEmail: 'emily@example.com',
      customerPhone: '+1 234-567-8903',
      product: 'Sports Running Shoes',
      date: '2023-10-12',
      status: 'Processing',
      quantity: 1,
      total: 89.99,
      payment: 'Pending',
      shippingAddress: '321 Elm St, Anycity, AC 98765',
      items: [
        { name: 'Sports Running Shoes (Blue, 42)', price: 89.99, quantity: 1 }
      ]
    },
    {
      id: 'ORD-12349',
      customer: 'Robert Wilson',
      customerEmail: 'robert@example.com',
      customerPhone: '+1 234-567-8904',
      product: 'Stainless Steel Water Bottle',
      date: '2023-10-11',
      status: 'Cancelled',
      quantity: 3,
      total: 74.97,
      payment: 'Refunded',
      shippingAddress: '654 Maple Dr, Otherplace, OP 23456',
      items: [
        { name: 'Stainless Steel Water Bottle (1L)', price: 24.99, quantity: 3 }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  // Set default filter to 'Processing' if URL contains ?status=processing
  const [statusFilter, setStatusFilter] = useState(statusFromUrl === 'processing' ? 'Processing' : 'All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrderModal, setViewOrderModal] = useState(false);
  const [editOrderModal, setEditOrderModal] = useState(false);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status counts for stats
  const statusCounts = {
    Processing: orders.filter(order => order.status === 'Processing').length,
    Shipped: orders.filter(order => order.status === 'Shipped').length,
    Delivered: orders.filter(order => order.status === 'Delivered').length,
    Cancelled: orders.filter(order => order.status === 'Cancelled').length,
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // Update order details
  const updateOrderDetails = (updatedOrder) => {
    setOrders(orders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    setEditOrderModal(false);
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setViewOrderModal(true);
  };

  // Edit order details
  const editOrderDetails = (order) => {
    setSelectedOrder({...order});
    setEditOrderModal(true);
  };

  // Status badge color - Updated to use theme colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-300 text-neutral-800';
    }
  };

  // Payment status color - Updated to use theme colors
  const getPaymentColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-300 text-neutral-800';
    }
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Processing': return <FaClock className="mr-1" />;
      case 'Shipped': return <FaTruck className="mr-1" />;
      case 'Delivered': return <FaCheckCircle className="mr-1" />;
      case 'Cancelled': return <FaTimes className="mr-1" />;
      default: return <FaBox className="mr-1" />;
    }
  };

  // Handle form changes for editing
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedOrder(prev => ({
      ...prev,
      [name]: value
    }));
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
              placeholder="Search orders..."
              className="w-full py-2 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaFilter className="text-neutral-400" />
            </div>
            <select
              className="w-full py-2 pl-10 pr-8 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 md:gap-4 md:mb-8">
          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full text-primary-600 bg-secondary-200 md:p-3">
                <FaBox className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Total Orders</h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-yellow-600 bg-yellow-100 rounded-full md:p-3">
                <FaClock className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Processing</h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">{statusCounts.Processing}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-blue-600 bg-blue-100 rounded-full md:p-3">
                <FaTruck className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Shipped</h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">{statusCounts.Shipped}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow md:p-4">
            <div className="flex items-center">
              <div className="p-2 text-green-600 bg-green-100 rounded-full md:p-3">
                <FaCheckCircle className="text-sm md:text-lg" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-neutral-600 md:text-sm">Delivered</h3>
                <p className="text-lg font-bold text-neutral-800 md:text-2xl">{statusCounts.Delivered}</p>
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
                  placeholder="Search orders by ID, customer, or product..."
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6">
                    Order ID
                  </th>
                  <th scope="col" className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6">
                    Product
                  </th>
                  <th scope="col" className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell">
                    Date
                  </th>
                  <th scope="col" className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500 md:px-6 md:table-cell">
                    Total
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
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4 whitespace-nowrap md:px-6">
                      <div className="text-sm font-medium text-primary-600">{order.id}</div>
                      <div className="text-xs text-neutral-500 md:hidden">{order.customer}</div>
                      <div className="text-xs text-neutral-500 md:hidden">{order.date}</div>
                    </td>
                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm text-neutral-900">{order.customer}</div>
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="text-sm text-neutral-900">{order.product}</div>
                      <div className="text-xs text-neutral-500 md:hidden">Qty: {order.quantity}</div>
                    </td>
                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm text-neutral-500">{order.date}</div>
                    </td>
                    <td className="hidden px-4 py-4 whitespace-nowrap md:px-6 md:table-cell">
                      <div className="text-sm font-medium text-neutral-900">Rs {order.total.toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap md:px-6">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        <span className="hidden md:inline">{getStatusIcon(order.status)}</span> {order.status}
                      </span>
                      <div className="mt-1 text-xs text-neutral-500 md:hidden">
                        <span className={`px-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentColor(order.payment)}`}>
                          {order.payment}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-right whitespace-nowrap md:px-6">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="p-1 text-primary-600 rounded hover:bg-secondary-200 md:p-1.5"
                          title="View Details"
                        >
                          <FaEye className="text-sm md:text-base" />
                        </button>
                        <button
                          onClick={() => editOrderDetails(order)}
                          className="p-1 text-primary-600 rounded hover:bg-secondary-200 md:p-1.5"
                          title="Edit Order"
                        >
                          <FaEdit className="text-sm md:text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="py-8 text-center md:py-12">
              <FaBox className="w-10 h-10 mx-auto text-neutral-400 md:w-12 md:h-12" />
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No orders found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {viewOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl">
              <div className="p-4 border-b border-neutral-200 md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-800">Order Details - {selectedOrder.id}</h2>
                  <button
                    onClick={() => setViewOrderModal(false)}
                    className="text-neutral-400 hover:text-neutral-500"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 md:gap-6">
                  <div>
                    <h3 className="mb-2 text-lg font-medium text-neutral-800">Customer Information</h3>
                    <p className="text-neutral-600">{selectedOrder.customer}</p>
                    <p className="text-sm text-neutral-600">{selectedOrder.customerEmail}</p>
                    <p className="text-sm text-neutral-600">{selectedOrder.customerPhone}</p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-medium text-neutral-800">Order Information</h3>
                    <p className="text-neutral-600">
                      <span className="font-medium">Date:</span> {selectedOrder.date}
                    </p>
                    <p className="text-neutral-600">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p className="text-neutral-600">
                      <span className="font-medium">Payment:</span> 
                      <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentColor(selectedOrder.payment)}`}>
                        {selectedOrder.payment}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-medium text-neutral-800">Shipping Address</h3>
                  <p className="text-neutral-600">{selectedOrder.shippingAddress}</p>
                </div>

                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-medium text-neutral-800">Order Items</h3>
                  <div className="p-4 rounded-lg bg-neutral-50">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between py-2">
                        <div>
                          <p className="font-medium text-neutral-900">{item.name}</p>
                          <p className="text-sm text-neutral-600">Qty: {item.quantity} × Rs {item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-medium text-neutral-900">Rs {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-neutral-200">
                      <div className="flex justify-between font-bold text-neutral-900">
                        <p>Total</p>
                        <p>Rs {selectedOrder.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end space-y-2 md:flex-row md:space-y-0 md:space-x-3">
                  <button
                    onClick={() => {
                      setViewOrderModal(false);
                      editOrderDetails(selectedOrder);
                    }}
                    className="flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    <FaEdit className="mr-2" /> Edit Order
                  </button>
                  {selectedOrder.status === 'Processing' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'Shipped');
                        setViewOrderModal(false);
                      }}
                      className="flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                    >
                      <FaTruck className="mr-2" /> Mark as Shipped
                    </button>
                  )}
                  {selectedOrder.status === 'Shipped' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'Delivered');
                        setViewOrderModal(false);
                      }}
                      className="flex items-center justify-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <FaCheckCircle className="mr-2" /> Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl">
              <div className="p-4 border-b border-neutral-200 md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-800">Edit Order - {selectedOrder.id}</h2>
                  <button
                    onClick={() => setEditOrderModal(false)}
                    className="text-neutral-400 hover:text-neutral-500"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateOrderDetails(selectedOrder);
                }}>
                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 md:gap-6">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-neutral-700">Customer Name</label>
                      <input
                        type="text"
                        name="customer"
                        className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        value={selectedOrder.customer}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-neutral-700">Customer Email</label>
                      <input
                        type="email"
                        name="customerEmail"
                        className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        value={selectedOrder.customerEmail}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-neutral-700">Customer Phone</label>
                      <input
                        type="text"
                        name="customerPhone"
                        className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        value={selectedOrder.customerPhone}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-neutral-700">Status</label>
                      <select
                        name="status"
                        className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        value={selectedOrder.status}
                        onChange={handleEditChange}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-1 text-sm font-medium text-neutral-700">Shipping Address</label>
                      <textarea
                        name="shippingAddress"
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        value={selectedOrder.shippingAddress}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditOrderModal(false)}
                      className="px-4 py-2 rounded-lg text-neutral-700 bg-neutral-200 hover:bg-neutral-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;