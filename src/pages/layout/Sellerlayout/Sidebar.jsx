import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt,
  FaPlus,
  FaBox,
  FaShoppingCart,
  FaAd,
  FaSignOutAlt,
  FaShoppingBasket
} from 'react-icons/fa';

export default function Sidebar({ showSidebar, setShowSidebar }) {
    
    return (
        <div
            className={`h-screen fixed top-0 md:left-0 ${showSidebar} overflow-y-auto flex-row flex-nowrap overflow-hidden shadow-xs bg-white w-64 py-10 px-6 transition-all duration-300 md:py-8`}
        >
            <div className="relative flex-col items-stretch min-h-full px-0 flex-nowrap">
                {/* Logo - Visible on both desktop and mobile */}
                <div className="flex items-center justify-center">
                    <FaShoppingBasket className="mr-2 text-3xl text-primary-600" />
                    <span className="text-xl font-bold text-primary-900">NexTrade Seller</span>
                </div>

                <div className="flex flex-col">
                    <hr className="my-4 border-neutral-300" />

                    <ul className="flex flex-col min-w-full space-y-1 list-none">
                        {/* Seller Dashboard */}
                        <li className="rounded-lg">
                            <NavLink
                                to="/seller/dashboard"
                                exact
                                className="flex items-center gap-4 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg text-neutral-700 hover:bg-background-subtle hover:text-primary-600"
                                activeClassName="bg-primary-600 text-white shadow-md hover:bg-primary-700"
                            >
                                <FaTachometerAlt className="text-lg" />
                                Seller Dashboard
                            </NavLink>
                        </li>

                        {/* Add Product */}
                        <li className="rounded-lg">
                            <NavLink
                                to="/seller/add-product"
                                className="flex items-center gap-4 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg text-neutral-700 hover:bg-background-subtle hover:text-primary-600"
                                activeClassName="bg-primary-600 text-white shadow-md hover:bg-primary-700"
                            >
                                <FaPlus className="text-lg" />
                                Add Product
                            </NavLink>
                        </li>

                        {/* Manage Products */}
                        <li className="rounded-lg">
                            <NavLink
                                to="/seller/manage-products"
                                className="flex items-center gap-4 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg text-neutral-700 hover:bg-background-subtle hover:text-primary-600"
                                activeClassName="bg-primary-600 text-white shadow-md hover:bg-primary-700"
                            >
                                <FaBox className="text-lg" />
                                Manage Products
                            </NavLink>
                        </li>

                        {/* View Orders */}
                        <li className="rounded-lg">
                            <NavLink
                                to="/seller/orders"
                                className="flex items-center gap-4 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg text-neutral-700 hover:bg-background-subtle hover:text-primary-600"
                                activeClassName="bg-primary-600 text-white shadow-md hover:bg-primary-700"
                            >
                                <FaShoppingCart className="text-lg" />
                                View Orders
                            </NavLink>
                        </li>

                        {/* Manage Advertisements */}
                        <li className="rounded-lg">
                            <NavLink
                                to="/seller/advertisements"
                                className="flex items-center gap-4 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg text-neutral-700 hover:bg-background-subtle hover:text-primary-600"
                                activeClassName="bg-primary-600 text-white shadow-md hover:bg-primary-700"
                            >
                                <FaAd className="text-lg" />
                                Advertisements
                            </NavLink>
                        </li>

                        {/* Logout Button - As part of sidebar menu */}
                        <li className="mt-auto rounded-lg">
                            <button
                                onClick={() => {
                                    // Add logout logic here
                                    console.log('Logging out...');
                                    // In real app: handle logout (clear tokens, redirect, etc.)
                                }}
                                className="flex items-center w-full gap-4 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg text-neutral-700 hover:bg-red-50 hover:text-red-600"
                            >
                                <FaSignOutAlt className="text-lg" />
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}