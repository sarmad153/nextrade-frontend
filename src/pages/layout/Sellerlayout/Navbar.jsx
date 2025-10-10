import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch, FaBell, FaUserCircle, FaCog, FaSignOutAlt, FaShoppingBasket } from 'react-icons/fa';

export default function Navbar({ showSidebar, setShowSidebar }) {
    const location = useLocation().pathname;

    return (
        <nav className="px-6 py-4 bg-white shadow-xs md:z-50 ">
            <div className="flex items-center justify-between w-full">
                {/* Left Side - Logo and Mobile Menu */}
                <div className="flex items-center space-x-4">

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            className="p-2 text-2xl transition-colors duration-200 rounded-full text-neutral-700 hover:bg-neutral-100"
                            onClick={() => setShowSidebar('left-0')}
                        >
                            <FaBars />
                        </button>
                        
                        {/* Close Button that appears when sidebar is open */}
                        {showSidebar === 'left-0' && (
                            <div className="absolute z-50 transition-all duration-300 top-2 left-55 md:hidden">
                                <button
                                    className="p-2 text-1.5xl text-black transition-colors duration-200 rounded-full hover:bg-neutral-100"
                                    onClick={() => setShowSidebar('-left-64')}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - User Menu */}
                <div className="flex items-center space-x-6">
                    {/* User Profile Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center p-2 space-x-3 transition-colors duration-200 rounded-lg hover:bg-neutral-100">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-500">
                                <FaUserCircle className="text-lg text-white" />
                            </div>
                            <span className="hidden text-sm font-medium text-neutral-700 lg:block">Seller</span>
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 z-50 invisible w-48 py-2 mt-2 transition-all duration-200 bg-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-hover:visible">
                            <div className="px-4 py-2 border-b border-neutral-200">
                                <p className="text-sm font-medium text-neutral-800">Seller Account</p>
                                <p className="text-xs text-neutral-500">seller@nextrade.com</p>
                            </div>
                            
                            <a
                                href="/seller/profile"
                                className="flex items-center px-4 py-2 text-sm transition-colors duration-200 text-neutral-700 hover:bg-background-subtle"
                            >
                                <FaUserCircle className="mr-3 text-neutral-500" />
                                My Profile
                            </a>
                            
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}