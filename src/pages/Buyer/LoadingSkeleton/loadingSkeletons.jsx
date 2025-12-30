import React from "react";

export const CategoryLoadingSkeleton = () => (
  <section className="py-16 bg-gradient-to-br from-background-light via-white to-primary-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="h-8 bg-neutral-200 rounded-lg w-80 mx-auto mb-4 animate-pulse" />
        <div className="h-4 bg-neutral-200 rounded w-96 mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden animate-pulse flex flex-col"
          >
            <div className="h-48 bg-neutral-200 flex-shrink-0" />
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              <div className="h-6 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 rounded w-full" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
              <div className="h-12 bg-neutral-200 rounded mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const AILoadingSkeleton = () => (
  <section className="py-16 bg-gradient-to-br from-background-light via-white to-primary-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="h-8 bg-neutral-200 rounded-lg w-80 mx-auto mb-4 animate-pulse" />
        <div className="h-4 bg-neutral-200 rounded w-96 mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden animate-pulse flex flex-col h-full"
          >
            <div className="h-48 bg-neutral-200" />
            <div className="p-4 flex flex-col flex-1">
              <div className="h-4 bg-neutral-200 rounded mb-2" />
              <div className="h-3 bg-neutral-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4" />
              <div className="flex gap-2 mt-auto">
                <div className="h-9 bg-neutral-200 rounded-lg flex-1" />
                <div className="h-9 bg-neutral-200 rounded-lg w-9" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const AdLoadingSkeleton = () => (
  <div className="w-full bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-12 text-center">
    <div className="inline-block w-12 h-12 border-3 rounded-full border-blue-500 border-t-transparent animate-spin mb-4"></div>
    <p className="text-blue-800 font-semibold text-lg mb-2">
      Discovering Premium Deals
    </p>
    <p className="text-blue-600 text-sm">Powered by AI • Picked for you</p>
  </div>
);

export const CategoryListingSkeleton = () => (
  <div className="min-h-screen bg-background-light py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-8 bg-neutral-200 rounded-lg w-64 animate-pulse"></div>
        <div className="h-4 bg-neutral-200 rounded w-96 animate-pulse"></div>
        <div className="h-20 bg-neutral-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Search bar skeleton */}
      <div className="mb-8">
        <div className="h-12 bg-neutral-200 rounded-lg w-full max-w-md animate-pulse"></div>
      </div>

      {/* Featured categories skeleton */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-neutral-200 rounded w-48 animate-pulse"></div>
          <div className="h-5 bg-neutral-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-neutral-200"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-200 rounded w-full"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All categories skeleton */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-neutral-200 rounded w-40 animate-pulse"></div>
          <div className="h-5 bg-neutral-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-neutral-200"></div>
              <div className="p-4 space-y-2">
                <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-full"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
