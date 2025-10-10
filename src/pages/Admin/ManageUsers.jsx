import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaStore,
  FaFilter,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaUserCheck,
  FaUserSlash,
  FaLock,
  FaUnlock,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaKey,
  FaCheck,
  FaTimesCircle,
  FaUserTag,
  FaBan,
  FaBars
} from 'react-icons/fa';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewUser, setViewUser] = useState(null);
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Mock Data
  const mockUsers = [
    {
      id: 1, userId: 'USR001', name: 'John Smith', email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567', role: 'buyer', status: 'active',
      registrationDate: '2024-01-15', lastLogin: '2024-03-20 14:30:00',
      avatar: 'JS', location: 'New York, USA', isVerified: true,
      totalOrders: 15, totalSpent: 2450.75, loyaltyPoints: 1250
    },
    {
      id: 2, userId: 'USR002', name: 'Sarah Johnson', email: 'sarah.j@email.com',
      phone: '+1 (555) 987-6543', role: 'seller', status: 'pending',
      registrationDate: '2024-03-01', lastLogin: '2024-03-19 10:15:00',
      avatar: 'SJ', storeName: 'TechGadgets Store', totalProducts: 5,
      totalRevenue: 0, subscription: 'basic'
    },
    {
      id: 3, userId: 'USR003', name: 'Mike Chen', email: 'mike.chen@email.com',
      phone: '+1 (555) 456-7890', role: 'buyer', status: 'blocked',
      registrationDate: '2024-02-10', lastLogin: '2024-02-28 16:45:00',
      avatar: 'MC', location: 'Toronto, Canada', isVerified: false,
      totalOrders: 3, totalSpent: 450.25, blockReason: 'Suspicious activity'
    },
    {
      id: 4, userId: 'USR004', name: 'Emma Davis', email: 'emma.davis@email.com',
      phone: '+1 (555) 234-5678', role: 'seller', status: 'active',
      registrationDate: '2024-01-20', lastLogin: '2024-03-20 09:20:00',
      avatar: 'ED', storeName: 'Fashion Boutique', storeRating: 4.5,
      totalProducts: 23, totalSales: 67, totalRevenue: 12800.00
    }
  ];

  const roles = ['all', 'buyer', 'seller'];
  const statusOptions = ['all', 'active', 'pending', 'blocked', 'rejected'];

  // Check screen size
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
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.storeName && user.storeName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus]);

  // User Management Functions
  const approveUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'active', isVerified: true } : user
    ));
  };

  const rejectUser = (userId, reason) => {
    const rejectionReason = reason || 'Registration rejected by admin';
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'rejected', rejectionReason } : user
    ));
  };

  const blockUser = (userId, reason) => {
    const blockReason = reason || 'Account blocked by admin';
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'blocked', blockReason } : user
    ));
  };

  const unblockUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'active', blockReason: '' } : user
    ));
  };

  const changeUserRole = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const deleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    setSelectedUsers(selectedUsers.filter(id => id !== userId));
  };

  const resetPassword = (userId) => {
    alert(`Password reset link sent to user ${userId}`);
  };

  // Bulk Operations
  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    switch (bulkAction) {
      case 'activate':
        selectedUsers.forEach(id => approveUser(id));
        break;
      case 'block':
        selectedUsers.forEach(id => blockUser(id, 'Bulk action by admin'));
        break;
      case 'delete':
        if (window.confirm(`Delete ${selectedUsers.length} user(s)?`)) {
          selectedUsers.forEach(id => deleteUser(id));
        }
        break;
      case 'approve_sellers':
        selectedUsers.forEach(id => approveUser(id));
        break;
      default:
        break;
    }
    
    setSelectedUsers([]);
    setBulkAction('');
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setShowMobileFilters(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'Active', icon: FaUserCheck },
      pending: { color: 'orange', text: 'Pending', icon: FaUserCheck },
      blocked: { color: 'red', text: 'Blocked', icon: FaBan },
      rejected: { color: 'gray', text: 'Rejected', icon: FaTimesCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <IconComponent className="mr-1" size={10} />
        {config.text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const isSeller = role === 'seller';
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isSeller ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {isSeller ? <FaStore className="mr-1" size={10} /> : <FaUser className="mr-1" size={10} />}
        {isSeller ? 'Seller' : 'Buyer'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Mobile Filters Component
  const MobileFilters = () => (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div 
        className="absolute inset-0 bg-[#000000c7]"
        onClick={() => setShowMobileFilters(false)}
      ></div>
      
      <div className="absolute top-0 right-0 h-full overflow-y-auto bg-white border-l shadow-xl w-80 border-neutral-300">
        <div className="flex items-center justify-between p-4 border-b border-neutral-300">
          <h3 className="text-lg font-semibold text-neutral-800">Filters</h3>
          <button 
            onClick={() => setShowMobileFilters(false)}
            className="p-2 text-neutral-500 hover:text-neutral-700"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-neutral-700">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
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
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2 text-sm rounded-lg text-neutral-700 bg-background-subtle hover:bg-neutral-200"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 px-4 py-2 text-sm text-white rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Modals
  const UserActionsModal = () => {
    if (!actionUser) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000c7]">
        <div className="w-full max-w-md mx-4 bg-white border shadow-2xl rounded-xl border-neutral-300">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-800">
              {actionType === 'approve' ? 'Approve User' : 
               actionType === 'reject' ? 'Reject User' : 
               actionType === 'block' ? 'Block User' : 
               actionType === 'unblock' ? 'Unblock User' :
               actionType === 'delete' ? 'Delete User' :
               actionType === 'role' ? 'Change User Role' : 'Reset Password'}
            </h3>
            
            {(actionType === 'reject' || actionType === 'block') && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-neutral-700">Reason</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`Enter reason for ${actionType}...`}
                  rows="3"
                />
              </div>
            )}

            {actionType === 'role' && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-neutral-700">New Role</label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Role</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => { setActionUser(null); setReason(''); }}
                className="px-4 py-2 text-sm font-medium border rounded-lg text-neutral-700 bg-background-subtle border-neutral-300 hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (actionType === 'approve') approveUser(actionUser.id);
                  if (actionType === 'reject') rejectUser(actionUser.id, reason);
                  if (actionType === 'block') blockUser(actionUser.id, reason);
                  if (actionType === 'unblock') unblockUser(actionUser.id);
                  if (actionType === 'delete') deleteUser(actionUser.id);
                  if (actionType === 'role') changeUserRole(actionUser.id, reason);
                  if (actionType === 'reset_password') resetPassword(actionUser.id);
                  setActionUser(null);
                  setReason('');
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                  actionType === 'delete' || actionType === 'reject' || actionType === 'block' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : actionType === 'role' || actionType === 'reset_password'
                    ? 'bg-primary-600 hover:bg-primary-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UserDetailModal = () => {
    if (!viewUser) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000c7]">
        <div className="bg-white rounded-xl shadow-2xl w-4/5 mx-4 max-h-[90vh] overflow-y-auto border border-neutral-300">
          <div className="flex items-center justify-between p-4 border-b border-neutral-300 md:p-6">
            <h2 className="text-lg font-semibold text-neutral-800 md:text-xl">User Profile - {viewUser.name}</h2>
            <button 
              onClick={() => setViewUser(null)}
              className="p-2 transition text-neutral-500 hover:text-neutral-700"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex items-start mb-6 space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 text-lg font-semibold rounded-full text-primary-600 bg-secondary-200 md:w-16 md:h-16 md:text-xl">
                    {viewUser.avatar}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-neutral-800 md:text-lg">{viewUser.name}</h3>
                    <p className="text-sm text-neutral-600 md:text-base">{viewUser.email}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      {getRoleBadge(viewUser.role)}
                      {getStatusBadge(viewUser.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">User ID</label>
                      <p className="mt-1 text-sm text-neutral-800">{viewUser.userId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Phone</label>
                      <p className="mt-1 text-sm text-neutral-800">{viewUser.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Location</label>
                      <p className="mt-1 text-sm text-neutral-800">{viewUser.location}</p>
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Registration Date</label>
                      <p className="mt-1 text-sm text-neutral-800">{formatDate(viewUser.registrationDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Last Login</label>
                      <p className="mt-1 text-sm text-neutral-800">{viewUser.lastLogin.split(' ')[0]}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Verification</label>
                      <p className="mt-1 text-sm text-neutral-800">
                        {viewUser.isVerified ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>
                  </div>
                </div>

                {viewUser.role === 'buyer' ? (
                  <div className="mt-6">
                    <h4 className="mb-4 text-base font-medium text-neutral-800 md:text-lg">Purchase History</h4>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4">
                      <div className="p-3 rounded-lg bg-background-subtle md:p-4">
                        <p className="text-xs text-neutral-600 md:text-sm">Total Orders</p>
                        <p className="text-lg font-semibold text-neutral-800 md:text-xl">{viewUser.totalOrders}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background-subtle md:p-4">
                        <p className="text-xs text-neutral-600 md:text-sm">Total Spent</p>
                        <p className="text-lg font-semibold text-neutral-800 md:text-xl">Rs {viewUser.totalSpent?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    <h4 className="mb-4 text-base font-medium text-neutral-800 md:text-lg">Store Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">Store Name</label>
                        <p className="mt-1 text-sm text-neutral-800">{viewUser.storeName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                        <div className="p-3 rounded-lg bg-background-subtle">
                          <p className="text-xs text-neutral-600 md:text-sm">Products</p>
                          <p className="text-base font-semibold text-neutral-800 md:text-lg">{viewUser.totalProducts}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-background-subtle">
                          <p className="text-xs text-neutral-600 md:text-sm">Total Sales</p>
                          <p className="text-base font-semibold text-neutral-800 md:text-lg">{viewUser.totalSales || 0}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-background-subtle">
                          <p className="text-xs text-neutral-600 md:text-sm">Revenue</p>
                          <p className="text-base font-semibold text-neutral-800 md:text-lg">Rs {viewUser.totalRevenue?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-background-subtle md:p-4">
                  <h4 className="mb-3 text-sm font-medium text-neutral-800 md:text-base">Quick Actions</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => { setActionUser(viewUser); setActionType('reset_password'); }}
                      className="flex items-center justify-center w-full px-3 py-2 text-xs text-white rounded-lg bg-primary-600 hover:bg-primary-700 md:text-sm"
                    >
                      <FaKey className="mr-2" />
                      Reset Password
                    </button>
                    <button 
                      onClick={() => { setActionUser(viewUser); setActionType('role'); }}
                      className="flex items-center justify-center w-full px-3 py-2 text-xs text-white rounded-lg bg-primary-600 hover:bg-primary-700 md:text-sm"
                    >
                      <FaUserTag className="mr-2" />
                      Change Role
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background-subtle md:p-4">
                  <h4 className="mb-3 text-sm font-medium text-neutral-800 md:text-base">Account Status</h4>
                  <div className="space-y-2">
                    {viewUser.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => { setActionUser(viewUser); setActionType('approve'); }}
                          className="flex items-center justify-center w-full px-3 py-2 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 md:text-sm"
                        >
                          <FaCheck className="mr-2" />
                          Approve
                        </button>
                        <button 
                          onClick={() => { setActionUser(viewUser); setActionType('reject'); }}
                          className="flex items-center justify-center w-full px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 md:text-sm"
                        >
                          <FaTimesCircle className="mr-2" />
                          Reject
                        </button>
                      </>
                    )}
                    {viewUser.status === 'active' && (
                      <button 
                        onClick={() => { setActionUser(viewUser); setActionType('block'); }}
                        className="flex items-center justify-center w-full px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 md:text-sm"
                      >
                        <FaLock className="mr-2" />
                        Block User
                      </button>
                    )}
                    {viewUser.status === 'blocked' && (
                      <button 
                        onClick={() => { setActionUser(viewUser); setActionType('unblock'); }}
                        className="flex items-center justify-center w-full px-3 py-2 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 md:text-sm"
                      >
                        <FaUnlock className="mr-2" />
                        Unblock User
                      </button>
                    )}
                  </div>
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
        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="p-3 mb-4 border border-primary-600 rounded-xl bg-secondary-200 md:p-4 md:mb-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-primary-700 md:text-base">
                  {selectedUsers.length} user(s) selected
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 md:px-4"
                >
                  <option value="">Choose bulk action...</option>
                  <option value="activate">Activate Selected</option>
                  <option value="block">Block Selected</option>
                  <option value="approve_sellers">Approve Sellers</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-3 py-2 text-sm text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 md:px-4"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-3 py-2 text-sm bg-white border rounded-lg text-primary-600 border-primary-600 hover:bg-secondary-200 md:px-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="p-4 mb-4 bg-white border shadow-sm rounded-xl border-neutral-300 md:p-6 md:mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="relative max-w-md">
                <FaSearch className="absolute transform -translate-y-1/2 text-neutral-400 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, user ID, store..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent md:py-2.5"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-background-subtle text-neutral-700 hover:bg-neutral-200 md:hidden"
              >
                <FaBars className="mr-2" />
                Filters
              </button>
              
              {/* Desktop Filters */}
              <div className="hidden md:flex md:items-center md:gap-3">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Roles</option>
                  <option value="buyer">Buyers</option>
                  <option value="seller">Sellers</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="blocked">Blocked</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2.5 text-sm text-neutral-700 rounded-lg bg-background-subtle hover:bg-neutral-200"
                >
                  <FaTimes className="mr-2" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-neutral-300">
          {isLoading ? (
            <div className="p-8 text-center md:p-12">
              <div className="inline-block w-8 h-8 border-2 rounded-full border-primary-600 border-t-transparent animate-spin"></div>
              <p className="mt-3 text-neutral-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center md:p-12">
              <FaUser className="mx-auto text-4xl text-neutral-400" />
              <p className="mt-3 text-neutral-600">No users found matching your criteria</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-primary-600 hover:text-primary-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-neutral-300 bg-background-subtle">
                  <tr>
                    <th className="w-12 px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">User</th>
                    <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:table-cell md:px-6 md:py-4">Role</th>
                    <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 sm:table-cell md:px-6 md:py-4">Status</th>
                    <th className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 lg:table-cell md:px-6 md:py-4">Registration</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-700 md:px-6 md:py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-300">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition hover:bg-background-subtle">
                      <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap md:px-6 md:py-4">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-semibold rounded-full bg-secondary-200 text-primary-600 md:w-10 md:h-10">
                            {user.avatar}
                          </div>
                          <div className="ml-3 md:ml-4">
                            <div className="text-sm font-medium text-neutral-800">{user.name}</div>
                            <div className="text-xs text-neutral-600 md:text-sm">{user.email}</div>
                            <div className="text-xs text-neutral-500 md:hidden">
                              {user.role === 'seller' ? 'Seller' : 'Buyer'} • {user.status}
                            </div>
                            <div className="mt-1 text-xs text-neutral-500 lg:hidden">
                              Reg: {formatDate(user.registrationDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 whitespace-nowrap md:table-cell md:px-6 md:py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="hidden px-4 py-3 whitespace-nowrap sm:table-cell md:px-6 md:py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-neutral-800 whitespace-nowrap lg:table-cell md:px-6 md:py-4">
                        {formatDate(user.registrationDate)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap md:px-6 md:py-4">
                        <div className="flex items-center space-x-1 md:space-x-2">
                          <button
                            onClick={() => setViewUser(user)}
                            className="p-1.5 transition rounded-lg text-primary-600 hover:text-primary-800 hover:bg-secondary-200 md:p-2"
                            title="View Profile"
                          >
                            <FaEye size={12} className="md:size-3.5" />
                          </button>
                          <button
                            onClick={() => { setActionUser(user); setActionType('role'); }}
                            className="p-1.5 text-purple-600 transition rounded-lg hover:text-purple-800 hover:bg-purple-100 md:p-2"
                            title="Change Role"
                          >
                            <FaUserTag size={12} className="md:size-3.5" />
                          </button>
                          <button
                            onClick={() => { setActionUser(user); setActionType('reset_password'); }}
                            className="p-1.5 text-orange-600 transition rounded-lg hover:text-orange-800 hover:bg-orange-100 md:p-2"
                            title="Reset Password"
                          >
                            <FaKey size={12} className="md:size-3.5" />
                          </button>
                          <button
                            onClick={() => { setActionUser(user); setActionType('delete'); }}
                            className="p-1.5 text-red-600 transition rounded-lg hover:text-red-800 hover:bg-red-100 md:p-2"
                            title="Delete User"
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
          )}
        </div>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && <MobileFilters />}

      {/* Modals */}
      <UserActionsModal />
      <UserDetailModal />
    </div>
  );
};

export default ManageUsers;