import React from "react";
import { Link } from "react-router-dom";
import AboutHeroSection from "./Hero";
import AboutUsSection from "./AboutUs";
import WhyChooseUs from "./WhyChooseUs";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background-light">
      <AboutHeroSection />
      <AboutUsSection />
      <WhyChooseUs />
      {/* CTA Section  */}
      <section className="py-20 bg-gradient-primary-vertical text-white">
        <div className="px-4 mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4 font-poppins">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful businesses that trust NexTrade for
            their wholesale needs. Get better prices, better quality, and better
            service.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/products"
              className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Bulk Shopping
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/20 hover:text-primary-600 transition-all duration-300 transform hover:scale-105"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
