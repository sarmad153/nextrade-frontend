import React, { useState, useRef } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaCamera, FaCog, FaBuilding, FaLock } from 'react-icons/fa';

export default function AdminProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "Admin User",
        email: "admin@nextrade.com",
        phone: "+1 234 567 8900",
        role: "Super Administrator",
        department: "Management",
        address: "123 Admin Street, City, State 12345",
        joinDate: "January 2022",
        profileImage: null
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [tempData, setTempData] = useState({ ...profileData });
    const fileInputRef = useRef(null);

    const handleEdit = () => {
        setTempData({ ...profileData });
        setIsEditing(true);
    };

    const handleSave = () => {
        setProfileData({ ...tempData });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempData({ ...profileData });
        setIsEditing(false);
    };

    const handleChange = (field, value) => {
        setTempData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordReset = () => {
        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords don't match!");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            alert("Password must be at least 8 characters long!");
            return;
        }

        // Here you would typically make an API call to update the password
        console.log('Password reset data:', passwordData);
        
        // Reset form and show success message
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setShowPasswordReset(false);
        alert('Password updated successfully!');
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setTempData(prev => ({
                    ...prev,
                    profileImage: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeProfileImage = () => {
        setTempData(prev => ({
            ...prev,
            profileImage: null
        }));
    };

    return (
        <div className="min-h-screen bg-background-light">
            <div className="max-w-6xl p-6 mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-800">Admin Profile</h1>
                    <p className="mt-2 text-neutral-600">Manage your administrator account and system settings</p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky p-6 bg-white rounded-lg shadow-lg top-6">
                            {/* Profile Image */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative">
                                    {tempData.profileImage ? (
                                        <div className="relative">
                                            <img 
                                                src={tempData.profileImage} 
                                                alt="Profile" 
                                                className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
                                            />
                                            {isEditing && (
                                                <button 
                                                    onClick={removeProfileImage}
                                                    className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                                                >
                                                    <FaTimes className="text-xs" />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center w-32 h-32 border-4 border-white rounded-full shadow-lg bg-secondary-200">
                                            <FaUser className="text-6xl text-primary-600" />
                                        </div>
                                    )}
                                    
                                    {isEditing && (
                                        <>
                                            <button 
                                                onClick={triggerFileInput}
                                                className="absolute p-2 text-white transition-colors rounded-full shadow-lg bottom-2 right-2 bg-primary-600 hover:bg-primary-700"
                                            >
                                                <FaCamera className="text-sm" />
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </>
                                    )}
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-neutral-800">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={tempData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="px-2 py-1 text-center border rounded bg-background-subtle border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        profileData.name
                                    )}
                                </h2>
                                <div className="inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full bg-primary-100">
                                    <FaCog className="text-xs text-primary-600" />
                                    <span className="text-sm font-medium text-primary-700">{profileData.role}</span>
                                </div>
                            </div>

                            {/* Admin Info */}
                            <div className="mb-5 space-y-3">
                                <div className="flex items-center text-neutral-700">
                                    <FaBuilding className="mr-3 text-primary-600" />
                                    <span className="text-sm">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={tempData.department}
                                                onChange={(e) => handleChange('department', e.target.value)}
                                                className="w-full px-2 py-1 border rounded bg-background-subtle border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        ) : (
                                            profileData.department
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center text-neutral-700">
                                    <FaEnvelope className="mr-3 text-primary-600" />
                                    <span className="text-sm">{profileData.email}</span>
                                </div>
                                <div className="flex items-center text-neutral-700">
                                    <FaUser className="mr-3 text-primary-600" />
                                    <span className="text-sm">Admin since {profileData.joinDate}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!isEditing ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleEdit}
                                        className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                                    >
                                        <FaEdit />
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => setShowPasswordReset(true)}
                                        className="flex items-center justify-center w-full gap-2 py-3 font-medium transition-colors border rounded-lg text-primary-600 border-primary-600 hover:bg-primary-50"
                                    >
                                        <FaLock />
                                        Change Password
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        <FaSave />
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        <FaTimes />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2">
                        {/* Password Reset Form */}
                        {showPasswordReset && (
                            <div className="p-6 mb-6 bg-white rounded-lg shadow-lg">
                                <h3 className="mb-6 text-xl font-bold text-neutral-800">Change Password</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-neutral-700">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                            className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-neutral-700">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                            className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Enter new password"
                                        />
                                        <p className="mt-1 text-xs text-neutral-500">Password must be at least 8 characters long</p>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-neutral-700">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                            className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handlePasswordReset}
                                            className="px-6 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                                        >
                                            Update Password
                                        </button>
                                        <button
                                            onClick={() => setShowPasswordReset(false)}
                                            className="px-6 py-3 transition-colors border rounded-lg text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Personal Information */}
                        <div className="p-6 mb-4 bg-white rounded-lg shadow-lg">
                            <h3 className="mb-6 text-xl font-bold text-neutral-800">Administrator Information</h3>
                            
                            <div className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                                        Email Address
                                    </label>
                                    <div className="flex items-center p-3 rounded-lg bg-background-subtle">
                                        <FaEnvelope className="mr-3 text-primary-600" />
                                        <span className="text-neutral-800">{profileData.email}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500">Administrative email cannot be changed</p>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={tempData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="w-full p-3 bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <div className="flex items-center p-3 rounded-lg bg-background-subtle">
                                            <FaPhone className="mr-3 text-primary-600" />
                                            <span className="text-neutral-800">{profileData.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                                        Office Address
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={tempData.address}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            rows="3"
                                            className="w-full p-3 bg-white border rounded-lg resize-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <div className="flex items-start p-3 rounded-lg bg-background-subtle">
                                            <FaMapMarkerAlt className="mt-1 mr-3 text-primary-600" />
                                            <span className="text-neutral-800">{profileData.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Admin Stats Card */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="p-6 text-center bg-white rounded-lg shadow-lg">
                                <div className="text-2xl font-bold text-primary-600">1,256</div>
                                <div className="mt-1 text-sm text-neutral-600">Total Users</div>
                            </div>
                            <div className="p-6 text-center bg-white rounded-lg shadow-lg">
                                <div className="text-2xl font-bold text-primary-600">89</div>
                                <div className="mt-1 text-sm text-neutral-600">Active Sellers</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}