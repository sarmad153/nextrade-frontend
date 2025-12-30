import React from "react";
import {
  FaRobot,
  FaPercentage,
  FaShieldAlt,
  FaUsers,
  FaTruck,
  FaHeadset,
} from "react-icons/fa";

const WhyChooseUs = () => {
  const features = [
    {
      icon: FaRobot,
      title: "AI-Powered Recommendations",
      description:
        "Smart algorithms suggest products based on your business needs and market trends.",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
      color: "purple",
      badge: "Intelligent",
    },
    {
      icon: FaPercentage,
      title: "Best Bulk Pricing",
      description:
        "Volume-based discounts with transparent pricing. Save up to 60% on orders.",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
      color: "blue",
      badge: "Save 60%",
    },
    {
      icon: FaShieldAlt,
      title: "Verified Suppliers",
      description:
        "All suppliers are thoroughly verified for authenticity and reliability.",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
      color: "green",
      badge: "Verified",
    },
    {
      icon: FaUsers,
      title: "Business Network",
      description:
        "Connect with manufacturers, wholesalers, and retailers in your industry.",
      gradient: "bg-gradient-to-br from-orange-500 to-amber-500",
      color: "orange",
      badge: "Network",
    },
    {
      icon: FaTruck,
      title: "Reliable Logistics",
      description:
        "Integrated logistics partners for seamless shipping and delivery tracking.",
      gradient: "bg-gradient-to-br from-indigo-500 to-purple-500",
      color: "indigo",
      badge: "Fast",
    },
    {
      icon: FaHeadset,
      title: "24/7 Support",
      description:
        "Dedicated business support team available round the clock for assistance.",
      gradient: "bg-gradient-to-br from-teal-500 to-green-500",
      color: "teal",
      badge: "24/7",
    },
  ];

  return (
    <section className="py-12 lg:py-20 bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-primary/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-primary-700">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold font-poppins mb-4">
            The{" "}
            <span className="bg-gradient-primary-diagonal bg-clip-text text-transparent">
              NexTrade Advantage
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover why businesses choose NexTrade for intelligent wholesale
            trading
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Background Color Change on Hover */}
              <div
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${feature.gradient} -z-10`}
              ></div>

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full bg-${feature.color}-50 text-${feature.color}-600`}
                >
                  {feature.badge}
                </span>
              </div>

              {/* Icon Container */}
              <div className="relative mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl ${feature.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <feature.icon className="text-white text-2xl" />
                </div>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Simple Divider */}
              <div className="mt-6 pt-6 border-t border-gray-100"></div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 lg:mt-20 bg-gradient-primary/5 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                98%
              </div>
              <div className="text-gray-600 text-sm lg:text-base">
                Satisfaction Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                10K+
              </div>
              <div className="text-gray-600 text-sm lg:text-base">
                Active Products
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                60%
              </div>
              <div className="text-gray-600 text-sm lg:text-base">
                Average Savings
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                24/7
              </div>
              <div className="text-gray-600 text-sm lg:text-base">
                Support Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
