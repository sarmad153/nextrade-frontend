import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const SellerLayout = () => {
    const [showSidebar, setShowSidebar] = useState('-left-64');

    return (
        <div className="flex h-screen bg-background-light font-inter">
            {/* Sidebar */}
            <Sidebar 
                showSidebar={showSidebar} 
                setShowSidebar={setShowSidebar} 
            />
            
            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-hidden md:ml-64">
                {/* Navbar */}
                <Navbar 
                    showSidebar={showSidebar} 
                    setShowSidebar={setShowSidebar} 
                />
                
                {/* Page Content - Nested routes will render here */}
                <main className="flex-1 p-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SellerLayout;