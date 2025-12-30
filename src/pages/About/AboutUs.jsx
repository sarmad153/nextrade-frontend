import React from "react";
import { FaChartLine, FaShieldAlt } from "react-icons/fa";
import aboutUsImage from "../../assets/About-us.png";

const AboutUs = () => {
  return (
    <div>
      {/* About NexTrade Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column  */}
            <div className="relative flex items-center justify-center">
              {/* Image Container */}
              <div className="relative max-w-full">
                <img
                  src={aboutUsImage}
                  alt="NexTrade B2B Marketplace Platform"
                  className="w-full max-w-lg mx-auto drop-shadow-2xl"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML = `
                      <div class="w-full max-w-lg h-[400px] bg-gradient-primary-vertical rounded-2xl flex items-center justify-center mx-auto">
                        <div class="text-center p-8">
                          <h3 class="text-2xl font-bold text-white mb-2">NexTrade Platform</h3>
                          <p class="text-white/80">B2B Wholesale Marketplace</p>
                        </div>
                      </div>
                    `;
                  }}
                />

                {/* Subtle glow behind Image*/}
                <div className="absolute inset-0 -z-10 bg-gradient-primary/10 blur-3xl opacity-30 rounded-full transform scale-90"></div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-100 hidden lg:block">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">B2B</span>
                    </div>
                  </div>
                </div>

                {/* Stats at bottom  */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-lg p-3 shadow-lg border border-gray-100 min-w-[200px]">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-600">
                        10K+
                      </div>
                      <div className="text-xs text-gray-600">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-600">
                        500+
                      </div>
                      <div className="text-xs text-gray-600">Businesses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-600">
                        60%
                      </div>
                      <div className="text-xs text-gray-600">Savings</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column*/}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-primary/10 rounded-full mb-4">
                  <span className="text-sm font-semibold text-primary-700">
                    About NexTrade
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold font-poppins mb-6">
                  Transforming{" "}
                  <span className="bg-gradient-primary-diagonal bg-clip-text text-transparent">
                    Wholesale Commerce
                  </span>
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    NexTrade is more than just a marketplace - it's a
                    comprehensive B2B ecosystem that bridges the gap between
                    manufacturers, wholesalers, and retailers through
                    intelligent technology.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    We provide businesses with AI-powered product
                    recommendations, transparent bulk pricing, and secure trade
                    environments to help them scale efficiently and profitably.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Our platform simplifies wholesale trading, eliminates
                    middlemen, and ensures that businesses of all sizes get
                    access to the best deals and reliable suppliers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaChartLine className="text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Growth Focused
                    </h4>
                    <p className="text-sm text-gray-600">Scale your business</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaShieldAlt className="text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Secure Trading
                    </h4>
                    <p className="text-sm text-gray-600">
                      Protected transactions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
