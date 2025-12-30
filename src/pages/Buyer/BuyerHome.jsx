import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  CategoryLoadingSkeleton,
  AILoadingSkeleton,
  AdLoadingSkeleton,
} from "./LoadingSkeleton/loadingSkeletons";
const FeaturedCategories = lazy(() => import("./Components/featuredCatagory"));
const AIRecommendations = lazy(() => import("./Components/AiRecommendation"));
const BuyerAdCarousel = lazy(() => import("./Components/adComponent"));
import HeroSection from "./Components/heroSection";

const BuyerHome = () => {
  return (
    <div className="min-h-screen bg-background-light">
      {/* Hero Section */}
      <HeroSection />

      {/* Advertisement */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<AdLoadingSkeleton />}>
            <BuyerAdCarousel />
          </Suspense>
        </div>
      </section>

      {/* Categories Section */}
      <Suspense fallback={<CategoryLoadingSkeleton />}>
        <FeaturedCategories />
      </Suspense>

      {/* AI Recommended Products */}
      <Suspense fallback={<AILoadingSkeleton />}>
        <AIRecommendations title="Recommended For You" showViewAll={true} />
      </Suspense>

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

export default BuyerHome;
