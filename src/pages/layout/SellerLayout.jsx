import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const SellerLayout = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState('-left-64');

    return (
        <div className="flex h-screen bg-background-light font-inter">
            {/* Sidebar */}
            <Sidebar 
                showSidebar={showSidebar} 
                setShowSidebar={setShowSidebar} 
            />
            
            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Navbar */}
                <Navbar 
                    showSidebar={showSidebar} 
                    setShowSidebar={setShowSidebar} 
                />
                
                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SellerLayout;