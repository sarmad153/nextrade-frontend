import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [showSidebar, setShowSidebar] = useState("-left-64");

  return (
    <div className="flex min-h-screen bg-background-light font-inter">
      {/* Sidebar */}
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden md:ml-64">
        {showSidebar === "left-0" && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setShowSidebar("-left-64")}
          ></div>
        )}

        {/* Navbar */}
        <Navbar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

        {/* Page Content*/}
        <main className="flex-1 p-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
