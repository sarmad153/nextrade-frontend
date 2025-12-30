import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaPaperPlane,
  FaUser,
  FaEnvelope,
  FaTag,
  FaEdit,
  FaCheck,
  FaArrowRight,
  FaHeadset,
  FaShieldAlt,
  FaClock,
  FaWhatsapp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../api/axiosInstance";

const ContactFormModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication and load user data
  useEffect(() => {
    if (isOpen) {
      checkAuthentication();
    }
  }, [isOpen]);

  const checkAuthentication = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (userData && token) {
        setUser(userData);
        setIsLoggedIn(true);
        setFormData((prev) => ({
          ...prev,
          name: userData.name || userData.username || "",
          email: userData.email || "",
        }));
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsLoggedIn(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNameEdit = () => setIsEditingName(true);
  const handleNameSave = () => setIsEditingName(false);

  const handleLoginRedirect = () => {
    onClose();
    navigate("/login");
  };

  const handleWhatsAppRedirect = () => {
    const whatsappNumber = "923121437445";
    const message = "Hello! I need help with my inquiry.";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please login to send a message");
      handleLoginRedirect();
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        userId: user.id || user._id,
        userEmail: user.email,
      };

      const response = await API.post("/contact", requestData);

      if (response.data && response.data.success) {
        setFormData({
          name: user.name || user.username || "",
          email: user.email || "",
          subject: "",
          message: "",
        });
        setIsEditingName(false);
        onClose();
      } else {
        throw new Error(response.data?.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Full error details:", error);
      if (error.response?.status === 404) {
        alert(
          "Contact service is currently unavailable. Please try again later or use WhatsApp support."
        );
      } else if (error.response?.status === 500) {
        alert("Server error. Please try again later.");
      } else if (error.request) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all border border-neutral-200 flex flex-col max-h-[90vh]">
        {/* Header with Gradient */}
        <div className="bg-gradient-primary-vertical rounded-t-xl p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <FaHeadset className="text-2xl text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Contact Support</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Get help with your orders, products, or any questions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div className="flex flex-1 min-h-0">
          {/* Left Side - Support Options */}
          <div className="w-1/3 bg-gradient-to-b from-blue-50 to-purple-50 p-6 border-r border-neutral-200 flex flex-col">
            {/* Authentication Status */}
            {!isLoggedIn && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FaShieldAlt className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-800 font-medium text-sm">
                      Login Required
                    </p>
                    <p className="text-amber-600 text-xs mt-1">
                      Use your account for personalized support
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLoginRedirect}
                  className="w-full mt-3 flex items-center justify-center px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Login to Continue
                  <FaArrowRight className="ml-2 text-xs" />
                </button>
              </div>
            )}

            {isLoggedIn && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FaCheck className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-emerald-800 font-medium text-sm">
                      Welcome back!
                    </p>
                    <p className="text-emerald-600 text-xs mt-1">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Support Options */}
            <div className="space-y-4 flex-1">
              <h3 className="font-semibold text-neutral-700 text-lg">
                Quick Support
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-white border border-neutral-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaHeadset className="text-blue-600 text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800 text-sm">
                        Email Support
                      </p>
                      <p className="text-neutral-600 text-xs">
                        24-48 hour response
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full p-4 bg-white border border-neutral-200 rounded-lg hover:border-green-300 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaWhatsapp className="text-green-600 text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800 text-sm">
                        WhatsApp Chat
                      </p>
                      <p className="text-neutral-600 text-xs">
                        Instant response
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-auto pt-6 border-t border-neutral-200">
                <div className="space-y-3 text-sm text-neutral-600">
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-blue-500 text-xs" />
                    <span>24/7 Email Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaShieldAlt className="text-green-500 text-xs" />
                    <span>Secure & Private</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaHeadset className="text-purple-500 text-xs" />
                    <span>Expert Assistance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="w-2/3 p-6 flex flex-col min-h-0">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 flex-1 min-h-0 flex flex-col"
            >
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                {/* Name Field */}
                <div className="space-y-2">
                  <div className="flex">
                    <label className="flex items-center text-sm font-semibold text-neutral-700">
                      <FaUser className="mr-2 text-blue-500 text-xs" />
                      Your Name
                    </label>
                    {isLoggedIn && !isEditingName && (
                      <button
                        type="button"
                        onClick={handleNameEdit}
                        className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit name"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                    )}
                    {isLoggedIn && isEditingName && (
                      <button
                        type="button"
                        onClick={handleNameSave}
                        className="ml-2 text-green-500 hover:text-green-700 transition-colors flex"
                        title="Save name"
                      >
                        <FaCheck className="text-xs" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoggedIn && !isEditingName}
                    className={`w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-neutral-800 placeholder-neutral-500 text-sm ${
                      isLoggedIn && !isEditingName
                        ? "bg-neutral-100 text-neutral-600 cursor-not-allowed"
                        : "bg-white hover:border-neutral-400"
                    }`}
                    placeholder="Full name"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-neutral-700">
                    <FaEnvelope className="mr-2 text-blue-500 text-xs" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoggedIn}
                    className={`w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-neutral-800 placeholder-neutral-500 text-sm ${
                      isLoggedIn
                        ? "bg-neutral-100 text-neutral-600 cursor-not-allowed"
                        : "bg-white hover:border-neutral-400"
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Subject Field */}
              <div className="space-y-2 flex-shrink-0">
                <label className="flex items-center text-sm font-semibold text-neutral-700">
                  <FaTag className="mr-2 text-blue-500 text-xs" />
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-neutral-800 placeholder-neutral-500 text-sm bg-white hover:border-neutral-400"
                  placeholder="Brief subject of your inquiry"
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                <label className="flex items-center text-sm font-semibold text-neutral-700 flex-shrink-0">
                  <FaPaperPlane className="mr-2 text-blue-500 text-xs" />
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="flex-1 w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-neutral-800 placeholder-neutral-500 text-sm bg-white hover:border-neutral-400 resize-none min-h-[120px]"
                  placeholder="Please describe your issue or question in detail. Include order numbers, product details, or any relevant information to help us assist you better..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isLoggedIn}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center shadow-sm flex-shrink-0 ${
                  !isLoggedIn
                    ? "bg-neutral-400 cursor-not-allowed transform-none"
                    : "bg-gradient-primary-vertical hover:bg-secondary-600 disabled:from-neutral-400 disabled:to-neutral-500 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {!isLoggedIn ? (
                  "Please Login to Send Message"
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                    Sending Your Message...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-3" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactFormModal;
