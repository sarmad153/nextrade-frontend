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
      <div className="w-full max-w-7xl rounded-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Form */}
        <div className="w-full p-4 md:p-8 md:w-2/5 lg:w-2/5">
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
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Complete business profile after signup.
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

        {/* Right Side Image */}
        <div className="hidden md:block md:w-3/5">
          <img
            src="./Images/RegisterImg.png"
            alt="NexTrade Registration"
            className="object-cover w-full h-full rounded-r-xl"
          />
        </div>
      </div>

      {/* Mobile Image*/}
      <div className="mt-6 md:hidden">
        <img
          src="./Images/RegisterImg.png"
          alt="NexTrade Registration"
          className="w-full max-w-xs mx-auto rounded-lg"
        />
      </div>
    </div>
  );
};

export default Register;
