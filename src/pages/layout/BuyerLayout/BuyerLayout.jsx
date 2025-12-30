import React from "react";
import BuyerNavbar from "./BuyerNavbar.jsx";
import BuyerFooter from "./BuyerFooter.jsx";
import { Outlet } from "react-router-dom";

const BuyerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background-light font-inter">
      {/* Navbar */}
      <BuyerNavbar />

      {/* Main Content - grows to fill available space */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <BuyerFooter />
    </div>
  );
};

export default BuyerLayout;

