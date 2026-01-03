import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
  FaAward,
  FaArrowRight,
  FaStar,
  FaShoppingBag,
  FaPercentage,
  FaLayerGroup,
} from "react-icons/fa";
import API from "../../../api/axiosInstance";
import heroBackground from "../../../assets/HeroBackgroun.jpeg";

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [featuredStats] = useState([
    { number: "10K+", label: "Happy Customers", icon: FaStar },
    { number: "5K+", label: "Products", icon: FaShoppingBag },
    { number: "100+", label: "Brands", icon: FaAward },
    { number: "24/7", label: "Support", icon: FaHeadset },
  ]);

  const features = [
    {
      icon: FaShippingFast,
      title: "Free Shipping",
      description: "Free delivery on orders over ₹499",
    },
    {
      icon: FaShieldAlt,
      title: "Secure Payment",
      description: "100% secure payment processing",
    },
    {
      icon: FaAward,
      title: "Quality Assurance",
      description: "30-day return policy",
    },
    {
      icon: FaHeadset,
      title: "24/7 Support",
      description: "Round-the-clock customer service",
    },
  ];

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true);
        const response = await API.get("/products/trending/products?limit=6");

        if (response.data.trendingProducts?.length > 0) {
          const productNames = response.data.trendingProducts.map(
            (product) => product.name
          );
          setTrendingSearches(productNames);
        } else {
          setTrendingSearches([
            "Wireless Headphones",
            "Summer Dresses",
            "Smart Watches",
            "Fitness Trackers",
            "Home Decor",
            "Kitchen Appliances",
          ]);
        }
      } catch (error) {
        setTrendingSearches([
          "Wireless Headphones",
          "Summer Dresses",
          "Smart Watches",
          "Fitness Trackers",
          "Home Decor",
          "Kitchen Appliances",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleBusinessPricing = () => {
    navigate("/products?bulkPricing=yes");
  };

  const handleTrendingSearch = (search) => {
    setSearchTerm(search);
    navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <div
      className="relative text-white overflow-hidden"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2%, transparent 0%), 
                           radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)`,
            backgroundSize: "100px 100px",
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] lg:min-h-[600px] py-8 lg:py-12">
          <div className="space-y-6 lg:space-y-8 z-10">
            <div className="inline-flex items-center px-3 py-1 lg:px-4 lg:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-xs lg:text-sm font-medium">
                Welcome to NexTrade
              </span>
            </div>

            <div className="space-y-3 lg:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-poppins leading-tight">
                Discover Amazing
                <span className="block bg-gradient-primary-diagonal bg-clip-text text-transparent">
                  Products & Deals
                </span>
              </h1>

              <p className="text-base lg:text-xl text-gray-200 leading-relaxed max-w-2xl">
                Shop from thousands of trusted sellers. Find the best prices,
                exclusive offers, and quality products delivered right to your
                doorstep.
              </p>
            </div>

            <div className="max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <FaSearch className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 text-sm lg:text-base" />
                  <input
                    type="text"
                    placeholder="Search for products, brands, and categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 lg:pl-12 pr-28 lg:pr-32 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl lg:rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 text-sm lg:text-lg"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 lg:right-2 top-1/2 transform -translate-y-1/2 bg-gradient-primary text-white px-3 lg:px-6 py-1.5 lg:py-2 rounded-lg lg:rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center text-xs lg:text-base"
                  >
                    Search
                    <FaArrowRight className="ml-1 lg:ml-2 text-xs lg:text-base" />
                  </button>
                </div>
              </form>

              <div className="mt-3 lg:mt-4 flex flex-wrap gap-1 lg:gap-2 items-center">
                <span className="text-gray-300 text-xs lg:text-sm">
                  Trending:
                </span>
                {loading ? (
                  <div className="flex flex-wrap gap-1 lg:gap-2">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className="h-5 lg:h-6 w-16 lg:w-20 bg-white/10 rounded-full animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : (
                  trendingSearches.slice(0, 4).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleTrendingSearch(search)}
                      className="text-xs lg:text-sm bg-white/5 hover:bg-white/10 px-2 lg:px-3 py-1 rounded-full border border-white/10 transition-all duration-200 hover:scale-105"
                    >
                      {search.length > 15
                        ? `${search.substring(0, 15)}...`
                        : search}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="hidden md:grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-6 pt-2 lg:pt-4">
              {featuredStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 lg:w-12 lg:h-12 bg-white/60 rounded-lg lg:rounded-xl mx-auto mb-1 lg:mb-2">
                    <stat.icon className="text-lg lg:text-2xl text-secondary-500" />
                  </div>
                  <div className="text-lg lg:text-2xl font-bold">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-xs lg:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="md:hidden flex flex-wrap gap-4 pt-4 justify-center">
              {featuredStats.slice(0, 2).map((stat, index) => (
                <div key={index} className="text-center flex-1 min-w-[120px]">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/60 rounded-lg mx-auto mb-2">
                    <stat.icon className="text-xl text-secondary-500" />
                  </div>
                  <div className="text-xl font-bold">{stat.number}</div>
                  <div className="text-gray-300 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center">
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl lg:rounded-3xl p-4 lg:p-8 border-2 border-white/20 shadow-2xl w-full max-w-sm lg:max-w-md transform hover:scale-105 transition-transform duration-500">
                  <div className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3 bg-gradient-primary text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-bold shadow-lg">
                    🏢 B2B Exclusive
                  </div>

                  <div className="text-center space-y-4 lg:space-y-6">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-primary rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <FaLayerGroup className="text-white text-2xl lg:text-3xl" />
                    </div>

                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-1 lg:mb-2">
                        Bulk Pricing
                      </h3>
                      <p className="text-gray-200 text-sm lg:text-lg mb-3 lg:mb-4">
                        Scale Your Business
                      </p>

                      <div className="space-y-2 lg:space-y-3 mb-3 lg:mb-4">
                        <div className="flex justify-between items-center text-xs lg:text-sm">
                          <span className="text-gray-300">10-49 units</span>
                          <span className="text-green-400 font-semibold">
                            15% OFF
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs lg:text-sm">
                          <span className="text-gray-300">50-99 units</span>
                          <span className="text-green-400 font-semibold">
                            25% OFF
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs lg:text-sm bg-white/10 p-1.5 lg:p-2 rounded-lg">
                          <span className="text-white font-medium">
                            100+ units
                          </span>
                          <span className="text-green-400 font-bold">
                            40% OFF
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleBusinessPricing}
                      className="w-full bg-white/50 text-primary-600 py-2 lg:py-3 rounded-lg lg:rounded-xl font-bold text-sm lg:text-lg hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Browse Bulk Deals
                    </button>
                  </div>
                </div>

                <div className="absolute top-2 -left-2 lg:top-3 lg:-left-0 bg-white text-gray-800 p-2 lg:p-4 rounded-xl lg:rounded-2xl shadow-2xl transform rotate-6 animate-float z-20">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaShieldAlt className="text-green-600 text-sm lg:text-base" />
                    </div>
                    <div>
                      <div className="font-bold text-sm lg:text-base">
                        Verified
                      </div>
                      <div className="text-xs text-gray-600">Suppliers</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-2 -right-2 lg:bottom-3 lg:-right-0 bg-white text-gray-800 p-2 lg:p-4 rounded-xl lg:rounded-2xl shadow-2xl transform -rotate-6 animate-float-delayed z-20">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaPercentage className="text-blue-600 text-sm lg:text-base" />
                    </div>
                    <div>
                      <div className="font-bold text-sm lg:text-base">
                        Save 60%
                      </div>
                      <div className="text-xs text-gray-600">Max Discount</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -inset-4 lg:-inset-8 bg-gradient-primary/20 rounded-2xl lg:rounded-3xl blur-2xl lg:blur-3xl -z-10"></div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 lg:pt-12 pb-6 lg:pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-white/60 rounded-xl lg:rounded-2xl mb-2 lg:mb-4 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="text-lg lg:text-2xl text-secondary-500" />
                </div>
                <h3 className="font-semibold text-sm lg:text-lg mb-1 lg:mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-xs lg:text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
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

export default HeroSection;
