import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaStore,
  FaShoppingCart,
  FaChevronDown,
} from "react-icons/fa";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/register", formData);

      if (res.data?.message === "User registered successfully") {
        toast.success("Account created successfully!");

        if (formData.role === "seller") {
          toast.info("Please complete your business profile to start selling");
        }

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(res.data?.message || "Registration failed!");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      toast.error(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background-light font-inter">
      <div className="w-full max-w-7xl rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg">
        {/* Left Side - Form */}
        <div
          className={`w-full p-4 md:p-8 ${
            formData.role === "seller"
              ? "md:w-2/5 lg:w-2/5"
              : "md:w-2/5 lg:w-2/5"
          }`}
        >
          <div className="mb-6 text-center md:mb-5">
            <h1 className="text-2xl font-bold text-neutral-800 md:text-[28px] lg:text-3xl">
              Create Your New Account
            </h1>
            <p className="mt-2 text-sm text-neutral-600 md:text-base">
              Join Pakistan's premier wholesale marketplace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-3">
            {/* Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-neutral-700 md:mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaUser className="text-sm text-neutral-400 md:text-base" />
                </div>
                <input
                  name="name"
                  type="text"
                  className="w-full py-3 pl-10 pr-4 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent md:text-base"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-neutral-700 md:mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaEnvelope className="text-sm text-neutral-400 md:text-base" />
                </div>
                <input
                  name="email"
                  type="email"
                  className="w-full py-3 pl-10 pr-4 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent md:text-base"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-neutral-700 md:mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaLock className="text-sm text-neutral-400 md:text-base" />
                </div>
                <input
                  name="password"
                  type="password"
                  className="w-full py-3 pl-10 pr-4 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent md:text-base"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block mb-2 text-sm font-medium text-neutral-700 md:mb-1">
                Register As
              </label>
              <div className="relative">
                <select
                  name="role"
                  className="w-full py-3 pl-10 pr-10 text-sm border rounded-lg appearance-none border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent md:text-base"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="buyer">
                    Buyer (I want to purchase products)
                  </option>
                  <option value="seller">
                    Seller (I want to sell products)
                  </option>
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {formData.role === "buyer" ? (
                    <FaShoppingCart className="text-sm text-neutral-400 md:text-base" />
                  ) : (
                    <FaStore className="text-sm text-neutral-400 md:text-base" />
                  )}
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaChevronDown className="text-sm text-neutral-400 md:text-base" />
                </div>
              </div>
            </div>

            {/* Seller info message */}
            {formData.role === "seller" && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 md:text-sm">
                  <strong>Note for Sellers:</strong> After registration, you'll
                  need to complete your business profile with shop details,
                  business type, and verification documents to start selling.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-bold text-white transition-colors rounded-lg shadow-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50 md:text-base md:py-3"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center md:mt-5">
            <p className="text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side Image - Hidden on mobile, dynamic sizing on desktop */}
        <div className={`hidden md:block overflow-hidden rounded-r-xl`}>
          <div className="relative w-full h-full min-h-[500px]">
            <img
              src="./Images/RegisterImg.png"
              alt="NexTrade Registration"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-300
                ${
                  formData.role === "seller"
                    ? "object-center scale-105"
                    : "object-center"
                }`}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
            {/* Fallback if image fails to load */}
            <div className="hidden absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 flex-col items-center justify-center text-white p-6">
              <h2 className="text-2xl font-bold mb-3">Welcome to NexTrade</h2>
              <p className="text-center text-lg">
                {formData.role === "seller"
                  ? "Start your wholesale business journey with us"
                  : "Discover amazing wholesale products"}
              </p>
            </div>

            {/* Overlay with text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-2 md:text-3xl">
                  {formData.role === "seller"
                    ? "Become a Wholesale Seller"
                    : "Join as a Buyer"}
                </h2>
                <p className="text-sm md:text-base opacity-90">
                  {formData.role === "seller"
                    ? "Reach thousands of buyers across Pakistan. Start your wholesale business today."
                    : "Access thousands of wholesale products at best prices from verified sellers."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Image - Only for buyer role, hidden for seller */}
        {formData.role === "buyer" && (
          <div className="mt-6 md:hidden">
            <div className="relative rounded-lg overflow-hidden shadow-md">
              <img
                src="./Images/RegisterImg.png"
                alt="NexTrade Registration"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
              />
              {/* Fallback for mobile */}
              <div className="hidden bg-gradient-to-r from-primary-500 to-primary-600 h-48 w-full flex-col items-center justify-center text-white p-4">
                <h2 className="text-xl font-bold mb-2">Welcome to NexTrade</h2>
                <p className="text-center text-sm">
                  Discover amazing wholesale products
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium">
                  Join thousands of buyers finding wholesale deals
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile seller info card */}
        {formData.role === "seller" && (
          <div className="mt-6 md:hidden">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaStore className="text-blue-600 text-lg" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-blue-800 mb-1">
                    Seller Registration
                  </h3>
                  <p className="text-sm text-blue-700">
                    Complete your business profile after signup to start
                    selling. You'll need shop details, business type, and
                    verification documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
