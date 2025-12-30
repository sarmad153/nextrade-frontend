import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerSupportHub from "./pages/CustomerSupport/CustomerSupportHub";
import { useRoute } from "./context/RouteContext";

// Auth
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import ResetPassword from "./pages/Auth/resetPassword";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";
import Unauthorized from "./pages/Auth/Unauth";

// Buyer
import { CategoryListingSkeleton } from "./pages/Buyer/LoadingSkeleton/loadingSkeletons";
import BuyerLayout from "./pages/layout/BuyerLayout/BuyerLayout";
import BuyerHome from "./pages/Buyer/BuyerHome";
import ProductListing from "./pages/Buyer/Product screens/ProductListing";
import ProductDetail from "./pages/Buyer/Product screens/ProductDetail";
import Cart from "./pages/Buyer/Cart";
import Checkout from "./pages/Buyer/Checkout";
import BuyerOrders from "./pages/Buyer/BuyerOrders";
import BuyerProfile from "./pages/Buyer/BuyerProfile";
const CategoryListing = lazy(() => import("./pages/Buyer/CatagoryListing"));
import AboutPage from "./pages/About/About";

// Admin
import AdminLayout from "./pages/layout/Adminlayout/AdminLayout";
import CategoryManagement from "./pages/Admin/CategoryManagement";
import AllProducts from "./pages/Admin/allProductcomponnents/AllProducts";
import ManageUser from "./pages/Admin/manageUser/ManageUsers";
import ManageOrders from "./pages/Admin/ManageOrders/ManageOrders";
import AdminProfile from "./pages/Admin/AdminProfile";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminAdsManagement from "./pages/Admin/AdminAdsManagement";

// Seller
import SellerLayout from "./pages/layout/Sellerlayout/SellerLayout";
import SellerDashboard from "./pages/Seller/SellerDashboard";
import AddProduct from "./pages/Seller/Product/AddProduct";
import ManageProducts from "./pages/Seller/Product/ManageProducts";
import SellerOrders from "./pages/Seller/SellerOrders";
import SellerProfile from "./pages/Seller/SellerProfile";
import Advertisment from "./pages/Seller/ads/SellerAds";
import CreatAd from "./pages/Seller/ads/createAd";

function App() {
  const { shouldShowCustomerSupport } = useRoute();
  return (
    <>
      {/* App Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Buyer Routes */}
        <Route path="/" element={<BuyerLayout />}>
          <Route index element={<BuyerHome />} />
          <Route path="products" element={<ProductListing />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/categories"
            element={
              <Suspense fallback={<CategoryListingSkeleton />}>
                <CategoryListing />
              </Suspense>
            }
          />

          {/* Protected Buyer Routes - Require Login */}
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <BuyerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <BuyerProfile />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Routes - Protected & Admin Role Required */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="category-management" element={<CategoryManagement />} />
          <Route path="ads-management" element={<AdminAdsManagement />} />
          <Route path="all-products" element={<AllProducts />} />
          <Route path="manage-users" element={<ManageUser />} />
          <Route path="manage-orders" element={<ManageOrders />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Seller Routes - Protected & Seller Role Required */}
        <Route
          path="/seller/*"
          element={
            <ProtectedRoute requireSeller={true}>
              <SellerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="advertisments" element={<Advertisment />} />
          <Route path="CreatAd" element={<CreatAd />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="manage-products" element={<ManageProducts />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="profile" element={<SellerProfile />} />
        </Route>

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Conditionally render CustomerSupportHub */}
      {shouldShowCustomerSupport() && <CustomerSupportHub />}

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastStyle={{
          backgroundColor: "#4f46e5",
          color: "white",
          fontWeight: "500",
        }}
      />
    </>
  );
}

export default App;
