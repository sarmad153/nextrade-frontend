import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaLock,
  FaArrowLeft,
  FaCheckCircle,
  FaPercentage,
  FaTag,
  FaLayerGroup,
  FaEdit,
  FaUser,
  FaShoppingCart,
  FaExclamationTriangle,
} from "react-icons/fa";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { getImageUrl } from "../../../utils/imageHelper";

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [useProfileData, setUseProfileData] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 5000;
  const STANDARD_SHIPPING_FEE = 200;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    postalCode: "",
    paymentMethod: "Cash on Delivery",
  });

  const checkAuth = () => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    let user = null;

    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Error parsing user:", e);
    }

    return { user, token };
  };

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const { user, token } = checkAuth();

      if (!user || !token) {
        toast.error("Please login to continue");
        navigate("/login");
        return;
      }

      const response = await API.get("/profile/me");
      const profileData = response.data;
      setProfile(profileData);

      if (profileData.isProfileComplete || profileData.address) {
        setUseProfileData(true);
        setFormData((prev) => ({
          ...prev,
          fullName: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          city: profileData.city || "",
        }));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error("Failed to load profile information");
      }
      setApiErrors((prev) => ({ ...prev, profile: "Failed to load profile" }));
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { user, token } = checkAuth();

      if (!user || !token) {
        toast.error("Please login to checkout");
        navigate("/login");
        return;
      }

      const userId = localStorage.getItem("userId");

      const response = await API.get(`/cart/${userId}`);

      // Handle both cart structures
      let products = [];
      if (response.data) {
        if (Array.isArray(response.data.products)) {
          // Direct products array (empty cart case)
          products = response.data.products;
        } else if (
          response.data.products &&
          Array.isArray(response.data.products)
        ) {
          // Nested products in cart object
          products = response.data.products;
        }
      }

      setCartItems(products);
    } catch (error) {
      console.error("Cart fetch error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      } else if (error.response?.status === 404) {
        setCartItems([]);
      } else {
        toast.error("Failed to load cart items");
        setCartItems([]);
      }
      setApiErrors((prev) => ({ ...prev, cart: "Failed to load cart" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { user, token } = checkAuth();

    if (user && token) {
      fetchProfile();
      fetchCart();
    } else {
      toast.error("Please login to access checkout");
      navigate("/login");
    }
  }, [navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const finalPrice = parseFloat(item.finalPrice) || 0;
      return total + finalPrice;
    }, 0);
  };

  const calculateTotalSavings = () => {
    return cartItems.reduce((total, item) => {
      const discountAmount = parseFloat(item.discountAmount) || 0;
      return total + discountAmount;
    }, 0);
  };

  const calculateOriginalSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const product = item.product;
      if (!product) return total;

      const basePrice =
        product.salePrice && product.salePrice < product.price
          ? parseFloat(product.salePrice)
          : parseFloat(product.price) || 0;

      return total + basePrice * (item.quantity || 1);
    }, 0);
  };

  const calculateShippingFee = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  };

  const shippingFee = calculateShippingFee();
  const tax = calculateSubtotal() * 0.05;
  const total = calculateSubtotal() + shippingFee + tax;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUseProfileData = () => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",

        address: profile.address || "",
        city: profile.city || "",
      }));
      setUseProfileData(true);
      toast.success("Profile data loaded successfully");
    }
  };

  const handleEditProfileData = () => {
    setUseProfileData(false);
    toast.info("You can now edit your shipping information");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < 2) {
      setStep(step + 1);
    } else {
      await placeOrder();
    }
  };

  const placeOrder = async () => {
    try {
      setPlacingOrder(true);

      const { user, token } = checkAuth();
      const userId = localStorage.getItem("userId");

      if (!user || !token || !userId) {
        toast.error("Please login to place order");
        navigate("/login");
        return;
      }

      if (cartItems.length === 0) {
        toast.error(
          "Your cart is empty. Please add items to your cart before placing an order."
        );
        navigate("/products");
        return;
      }

      if (
        !formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.city ||
        !formData.address ||
        !formData.city
      ) {
        toast.error("Please fill in all required shipping information");
        setStep(1);
        return;
      }

      const orderData = {
        userId: userId,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,

          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        paymentMethod: formData.paymentMethod,
      };

      const response = await API.post("/orders", orderData);

      if (response.data) {
        toast.success("Order placed successfully!");

        try {
          const testResponse = await API.get("/profile/me");
        } catch (apiError) {
          console.error("API call failed after order:", apiError);
        }

        // Clear cart
        try {
          await API.delete(`/cart/${userId}`);
        } catch (cartError) {
          console.error("Error clearing cart:", cartError);
        }

        // Navigate to confirmation
        navigate(`/orders`);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Failed to place order. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid order data. Please check your information.";
      } else if (error.response?.status === 500) {
        errorMessage =
          "Server error. Please contact support or try again later.";
      }

      toast.error(errorMessage);
    } finally {
      setPlacingOrder(false);
    }
  };

  const BulkPricingBadge = ({ item }) => {
    if (!item.appliedTier) return null;

    return (
      <div className="flex items-center mt-1">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
          <FaTag className="mr-1" />
          Bulk Discount
        </span>
      </div>
    );
  };

  const ItemPriceDisplay = ({ item }) => {
    const finalPrice = parseFloat(item.finalPrice) || 0;
    const originalPrice =
      (parseFloat(item.product?.price) || 0) * (item.quantity || 1);
    const savedAmount = originalPrice - finalPrice;

    return (
      <div className="text-right">
        <div className="flex items-center justify-end space-x-2">
          <span className="text-sm font-semibold text-green-600">
            Rs {finalPrice.toFixed(2)}
          </span>
          {savedAmount > 0 && (
            <span className="text-sm text-gray-500 line-through">
              Rs {originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {savedAmount > 0 && (
          <div className="text-xs text-green-600 mt-1">
            Saved: Rs {savedAmount.toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-800">
                Shipping Information
              </h3>

              {profile && !useProfileData && (
                <button
                  type="button"
                  onClick={handleUseProfileData}
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <FaUser className="mr-2" />
                  Use My Profile Data
                </button>
              )}

              {useProfileData && (
                <button
                  type="button"
                  onClick={handleEditProfileData}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <FaEdit className="mr-2" />
                  Edit Information
                </button>
              )}
            </div>

            {useProfileData && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-700">
                  <FaCheckCircle className="mr-2 text-blue-600" />
                  <span className="text-sm font-medium">
                    Using your profile information. Click "Edit Information" to
                    make changes.
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={useProfileData}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={useProfileData}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={useProfileData}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={useProfileData}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows="3"
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={useProfileData}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {profile && !profile.isProfileComplete && !useProfileData && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-700">
                  <FaUser className="mr-2 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">
                      Complete your profile for faster checkout
                    </p>
                    <p className="text-xs mt-1">
                      <Link
                        to="/profile"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Update your profile
                      </Link>{" "}
                      to auto-fill this information in the future.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Payment Method
              </h3>
              <div className="space-y-4">
                <label className="flex items-start p-4 border border-neutral-300 rounded-lg cursor-pointer hover:border-primary-500">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={formData.paymentMethod === "Cash on Delivery"}
                    onChange={(e) =>
                      handleInputChange("paymentMethod", e.target.value)
                    }
                    className="mt-1 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-neutral-800">
                      Cash on Delivery
                    </span>
                    <p className="text-sm text-neutral-600 mt-1">
                      Pay when you receive your order
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border border-neutral-300 rounded-lg cursor-pointer hover:border-primary-500 opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Card Payment"
                    disabled
                    className="mt-1 text-neutral-400 focus:ring-neutral-400"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-neutral-600">
                      Credit/Debit Card
                    </span>
                    <p className="text-sm text-neutral-500 mt-1">Coming soon</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-neutral-800">
              Order Review
            </h3>

            {calculateTotalSavings() > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-800">
                    <FaLayerGroup className="mr-2" />
                    <span className="font-medium">Bulk Purchase Savings</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-700">
                      -Rs {calculateTotalSavings().toFixed(2)}
                    </div>
                    <div className="text-xs text-green-600">
                      You saved{" "}
                      {(
                        (calculateTotalSavings() /
                          calculateOriginalSubtotal()) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 bg-neutral-50 rounded-lg">
              <h4 className="font-semibold text-neutral-800 mb-4">
                Order Summary
              </h4>

              <div className="space-y-3">
                {calculateTotalSavings() > 0 && (
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Original Subtotal</span>
                    <span className="line-through">
                      Rs {calculateOriginalSubtotal().toFixed(2)}
                    </span>
                  </div>
                )}

                {calculateTotalSavings() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center">
                      <FaPercentage className="mr-1" />
                      Bulk Discounts
                    </span>
                    <span className="font-medium">
                      -Rs {calculateTotalSavings().toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-base">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">
                    Rs {calculateSubtotal().toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-base">
                  <span className="font-medium">Shipping</span>
                  <span
                    className={
                      shippingFee === 0
                        ? "text-green-600 font-medium"
                        : "font-medium"
                    }
                  >
                    {shippingFee === 0 ? "FREE" : `Rs ${shippingFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-base">
                  <span className="font-medium">Tax (5%)</span>
                  <span className="font-medium">Rs {tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-neutral-300 pt-3 mt-2">
                  <div className="flex justify-between text-lg font-bold text-neutral-800">
                    <span>Total</span>
                    <span>Rs {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {shippingFee === 0 ? (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-800 text-sm">
                    <FaCheckCircle className="mr-2" />
                    <span className="font-medium">Free Shipping Applied!</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700">
                    Add Rs{" "}
                    {(FREE_SHIPPING_THRESHOLD - calculateSubtotal()).toFixed(2)}{" "}
                    more for FREE shipping
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (Object.keys(apiErrors).length > 0) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">API Error</h2>
          <p className="text-red-600 mb-4">
            There was an issue loading your data
          </p>
          <button
            onClick={() => {
              setApiErrors({});
              fetchProfile();
              fetchCart();
            }}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <FaShoppingCart className="mx-auto text-6xl text-neutral-400 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-neutral-600 mb-6">
            Add some items to your cart before checkout
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            {[1, 2].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= stepNumber
                      ? "bg-primary-600 text-white"
                      : "bg-neutral-300 text-neutral-600"
                  }`}
                >
                  {step > stepNumber ? <FaCheckCircle /> : stepNumber}
                </div>
                {stepNumber < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? "bg-primary-600" : "bg-neutral-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {calculateTotalSavings() > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaPercentage className="text-green-600 mr-2 text-xl" />
                <div>
                  <h3 className="font-semibold text-green-800">
                    Smart Bulk Shopping!
                  </h3>
                  <p className="text-sm text-green-700">
                    You're saving Rs {calculateTotalSavings().toFixed(2)} with
                    bulk discounts
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {(
                    (calculateTotalSavings() / calculateOriginalSubtotal()) *
                    100
                  ).toFixed(1)}
                  % SAVINGS
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit}>
                {renderStep()}

                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="flex items-center px-6 py-3 text-neutral-600 hover:text-neutral-800"
                    >
                      <FaArrowLeft className="mr-2" />
                      Back
                    </button>
                  ) : (
                    <Link
                      to="/cart"
                      className="flex items-center px-6 py-3 text-neutral-600 hover:text-neutral-800"
                    >
                      <FaArrowLeft className="mr-2" />
                      Back to Cart
                    </Link>
                  )}

                  <button
                    type="submit"
                    className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      placingOrder ||
                      !formData.fullName ||
                      !formData.email ||
                      !formData.phone ||
                      !formData.address ||
                      !formData.city
                    }
                  >
                    {placingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Placing Order...
                      </>
                    ) : step === 2 ? (
                      <>
                        <FaLock className="mr-2" />
                        Place Order
                      </>
                    ) : (
                      "Continue to Review"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Order Items ({cartItems.length})
              </h3>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex items-start space-x-3 pb-4 border-b border-neutral-100 last:border-b-0"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-neutral-200 rounded flex items-center justify-center">
                        {item.product?.images &&
                        item.product.images.length > 0 ? (
                          <img
                            src={getImageUrl(item.product.images[0])}
                            alt={item.product?.name || "Product"}
                            className="object-cover w-full h-full rounded"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
                            }}
                          />
                        ) : (
                          <span className="text-neutral-500 text-xs">Img</span>
                        )}
                      </div>
                      {item.appliedTier && (
                        <div className="absolute -top-1 -right-1">
                          <div className="bg-green-500 text-white rounded-full p-1">
                            <FaPercentage className="text-xs" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 line-clamp-2 mb-2">
                        {item.product?.name || "Product"}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center space-x-3">
                          <span className="text-xs text-neutral-600">
                            Qty: {item.quantity || 1}
                          </span>
                          <BulkPricingBadge item={item} />
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <ItemPriceDisplay item={item} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <div className="flex justify-between text-base">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">
                    Rs {calculateSubtotal().toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-base">
                  <span className="font-medium">Shipping</span>
                  <span
                    className={
                      shippingFee === 0
                        ? "text-green-600 font-medium"
                        : "font-medium"
                    }
                  >
                    {shippingFee === 0 ? "FREE" : `Rs ${shippingFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-base">
                  <span className="font-medium">Tax (5%)</span>
                  <span className="font-medium">Rs {tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-neutral-300 pt-3 mt-2">
                  <div className="flex justify-between text-lg font-bold text-neutral-800">
                    <span>Total</span>
                    <span>Rs {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {calculateSubtotal() < FREE_SHIPPING_THRESHOLD && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 mb-2">
                    Add Rs{" "}
                    {(FREE_SHIPPING_THRESHOLD - calculateSubtotal()).toFixed(2)}{" "}
                    more for FREE shipping
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (calculateSubtotal() / FREE_SHIPPING_THRESHOLD) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {calculateTotalSavings() > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-800 text-sm">
                    <FaLayerGroup className="mr-2" />
                    <span className="font-medium">Great Choice!</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    You saved{" "}
                    {(
                      (calculateTotalSavings() / calculateOriginalSubtotal()) *
                      100
                    ).toFixed(1)}
                    % by buying in bulk
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
