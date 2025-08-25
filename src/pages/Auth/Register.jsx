import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaStore, FaShoppingCart, FaChevronDown } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration submitted:', formData);
    // Add registration logic here
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background-light font-inter">
      {/* Main Container */}
      <div className="w-full max-w-7xl rounded-xl overflow-hidden flex flex-col md:flex-row h-[550px]">
        
        {/* Left Side - Form (smaller width) */}
        <div className="p-3 md:w-2/5 md:p-8">
          <div className="mb-5 text-center">
            <h1 className="text-[28px] font-bold text-neutral-800 md:text-3xl">Create Your New Account</h1>
            <p className="mt-2 text-neutral-600">Join Pakistan's premier wholesale marketplace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Field */}
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaUser className="text-neutral-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  className="w-full py-3 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaEnvelope className="text-neutral-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  className="w-full py-3 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaLock className="text-neutral-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  className="w-full py-3 pl-10 pr-4 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Register As</label>
              <div className="relative">
                <select
                  name="role"
                  className="w-full py-3 pl-10 pr-10 border rounded-lg appearance-none border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="buyer">Buyer (I want to purchase products)</option>
                  <option value="seller">Seller (I want to sell products)</option>
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {formData.role === 'buyer' ? (
                    <FaShoppingCart className="text-neutral-400" />
                  ) : (
                    <FaStore className="text-neutral-400" />
                  )}
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaChevronDown className="text-neutral-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-3 font-bold text-white transition-colors rounded-lg shadow-md bg-primary-600 hover:bg-primary-700"
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-5 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image (larger width) */}
        <div className="relative hidden ml-20 md:block md:w-3/5">
          <img 
            src="./Images/RegisterImg.png"
            alt="NexTrade Registration" 
            className="absolute inset-0 object-contain w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;