import React from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingBasket,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";
import MainLogo from "../../../assets/white Logo.png";

const BuyerFooter = () => {
  return (
    <footer className="bg-neutral-800 text-white">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img src={MainLogo} alt="NexTrade Logo" className="h-10 mr-2" />
              <span className="text-xl font-bold">NexTrade</span>
            </div>
            <p className="mb-4 text-neutral-300 max-w-md">
              Your trusted digital marketplace for wholesale trading. Connect
              with verified sellers and discover quality products in bulk.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <FaLinkedin className="text-xl" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <FaInstagram className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-neutral-300 hover:text-white"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-neutral-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-neutral-300 hover:text-white"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-neutral-300 hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
            <ul className="space-y-2 text-neutral-300">
              <li>Email: sarmadofficial.6@gmail.com</li>
              <li>Phone: +92 328-7900729</li>
              <li>Address: University of South Asia</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-neutral-700">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-neutral-400">
              © 2025 NexTrade. All rights reserved.
            </p>
            <div className="flex mt-4 space-x-6 text-sm md:mt-0">
              <Link to="/privacy" className="text-neutral-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-neutral-400 hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BuyerFooter;
