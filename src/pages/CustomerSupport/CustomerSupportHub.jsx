import React, { useState } from "react";
import { FaWhatsapp, FaEnvelope, FaHeadset, FaTimes } from "react-icons/fa";
import ContactFormModal from "./ContactFormModal";
import { useRoute } from "../../context/RouteContext";

const CustomerSupportHub = () => {
  const { getUserType } = useRoute();
  const userType = getUserType();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const whatsappNumber = "923121437445";

  const supportOptions = [
    {
      label: "Order Help",
      message: "Hello! I need help with my order.",
    },
    {
      label: "Product Info",
      message: "Hello! I have a question about a product.",
    },
    {
      label: "Bulk Order",
      message: "Hello! I want to place a bulk order.",
    },
    {
      label: "General Help",
      message: "Hello! I need general assistance.",
    },
  ];

  const getPositionClass = () => {
    if (userType === "seller") return "fixed bottom-6 left-6 z-[9999]";
    if (userType === "buyer") return "fixed bottom-6 right-6 z-[9999]";
    return "hidden";
  };

  const getExpandedPosition = () => {
    if (userType === "seller") {
      return "left-0 bottom-20"; // Position on left for seller
    } else {
      return "right-0 bottom-20"; // Position on right for buyer
    }
  };

  const getExpandedWidthClass = () => {
    if (userType === "seller") {
      return "w-64"; // Fixed width for expanded panel
    } else {
      return "w-64";
    }
  };

  const handleWhatsAppClick = (customMessage = null) => {
    const message = customMessage || "Hello! I need help.";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    setIsExpanded(false);
  };

  const handleContactFormClick = () => {
    setShowContactForm(true);
    setIsExpanded(false);
  };

  if (userType === "admin") return null;

  return (
    <>
      <div className={getPositionClass()}>
        {/* Expanded Options - Position based on user type */}
        {isExpanded && (
          <div
            className={`absolute ${getExpandedPosition()} bg-white rounded-lg shadow-xl p-4 ${getExpandedWidthClass()} border border-gray-200 z-[10000]`}
            style={
              userType === "seller"
                ? { left: "0", bottom: "80px" }
                : { right: "0", bottom: "80px" }
            }
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Customer Service</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            {/* Support Options */}
            <div className="space-y-2 mb-4">
              {supportOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleWhatsAppClick(option.message)}
                  className="w-full text-left p-3 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200 flex items-center"
                >
                  <FaWhatsapp className="mr-2 text-green-500" />
                  {option.label}
                </button>
              ))}
            </div>

            {/* Contact Form Button */}
            <button
              onClick={handleContactFormClick}
              className="w-full p-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 flex items-center justify-center"
            >
              <FaEnvelope className="mr-2 text-blue-500" />
              Email Support
            </button>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Choose your preferred support method
              </p>
            </div>
          </div>
        )}

        {/* Main Support Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          title="Customer Service"
        >
          <FaHeadset className="text-2xl" />

          {/* Hover Tooltip - Position based on user type */}
          <div
            className={`absolute bottom-16 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ${
              userType === "seller" ? "left-0" : "right-0"
            }`}
          >
            Customer Service
          </div>
        </button>

        {/* Pulse Effect */}
        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 z-[-1]"></div>
      </div>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
      />
    </>
  );
};

export default CustomerSupportHub;
