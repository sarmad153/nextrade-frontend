import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaSearch,
  FaChartLine,
  FaPercentage,
  FaRobot,
} from "react-icons/fa";
import heroBackground from "../../assets/HeroBackgroun.jpeg";

const AboutHero = () => {
  const navigate = useNavigate();

  const handleExplorePlatform = () => {
    navigate("/");
  };

  const handleBulkDeals = () => {
    navigate("/products?bulkPricing=yes");
  };

  return (
    <div className="relative text-white overflow-hidden">
      {/* Main Background*/}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overly */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Subtle Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-medium">Welcome to NexTrade</span>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-poppins leading-tight">
                Revolutionizing
                <span className="block bg-gradient-primary-diagonal bg-clip-text text-transparent">
                  B2B Wholesale Trade
                </span>
              </h1>

              <div className="bg-white/10 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-white/10">
                <p className="text-base lg:text-lg text-gray-100 leading-relaxed">
                  NexTrade is an intelligent B2B marketplace platform that
                  <span className="text-white font-semibold">
                    {" "}
                    connects manufacturers, wholesalers, and retailers{" "}
                  </span>
                  through AI-powered recommendations, competitive bulk pricing,
                  and seamless trade experiences.
                </p>
                <p className="text-sm lg:text-base text-gray-200 mt-3 leading-relaxed">
                  Founded to transform traditional wholesale trading, we empower
                  businesses to scale efficiently with data-driven insights and
                  exclusive bulk deals.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-2">
              <button
                onClick={handleExplorePlatform}
                className="px-5 py-3 lg:px-6 lg:py-3 bg-white text-primary-600 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center group text-sm lg:text-base"
              >
                <FaSearch className="mr-2" />
                Explore Platform
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/register"
                className="px-5 py-3 lg:px-6 lg:py-3 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm lg:text-base"
              >
                Register Your Business
              </Link>
            </div>
          </div>

          {/* Right Side  */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-4 lg:p-6 border border-white/20 shadow-xl">
              <div className="space-y-4">
                <div className="text-center pb-2">
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-1">
                    Why Choose NexTrade?
                  </h3>
                  <p className="text-gray-300 text-xs lg:text-sm">
                    Intelligent features for business growth
                  </p>
                </div>

                {/* Compact Features Grid */}
                <div className="space-y-3">
                  {/* AI Recommendations Feature */}
                  <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <FaRobot className="text-lg text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm lg:text-base mb-1 leading-tight">
                        AI-Powered Recommendations
                      </h4>
                      <p className="text-gray-300 text-xs lg:text-sm leading-relaxed">
                        Smart product suggestions based on your business needs
                      </p>
                    </div>
                  </div>

                  {/* Bulk Deals Feature */}
                  <div
                    className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                    onClick={handleBulkDeals}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <FaChartLine className="text-lg text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm lg:text-base mb-1 leading-tight">
                        Exclusive Bulk Deals
                      </h4>
                      <p className="text-gray-300 text-xs lg:text-sm leading-relaxed">
                        Volume pricing with up to 60% discounts on large orders
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                          15-40% OFF
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Better Pricing Feature */}
                  <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <FaPercentage className="text-lg text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm lg:text-base mb-1 leading-tight">
                        Competitive Pricing
                      </h4>
                      <p className="text-gray-300 text-xs lg:text-sm leading-relaxed">
                        Direct manufacturer prices eliminating middlemen
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleBulkDeals}
                    className="w-full bg-white/20 text-white py-2.5 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 text-sm lg:text-base"
                  >
                    View All Features
                  </button>
                </div>
              </div>
            </div>

            {/* Small Floating Elements */}
            <div className="absolute -top-2 -left-2 bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-xl shadow-lg transform rotate-3 animate-float z-20 hidden lg:block">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AI</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-2 -right-2 bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-xl shadow-lg transform -rotate-3 animate-float-delayed z-20 hidden lg:block">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">B2B</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-8 lg:h-12 text-white transform rotate-180"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default AboutHero;
