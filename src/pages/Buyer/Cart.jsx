import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaArrowRight,
  FaArrowLeft,
  FaPercentage,
  FaTag,
  FaLayerGroup,
} from "react-icons/fa";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { getImageUrl } from "../../../utils/imageHelper";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [originalCartItems, setOriginalCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const response = await API.get(`/cart/${user.id || user._id}`);

      if (response.data && Array.isArray(response.data.products)) {
        const itemsWithBulkPricing = await Promise.all(
          response.data.products.map(async (item) => {
            try {
              // Fetch bulk pricing for this product
              const bulkResponse = await API.get(
                `/bulk-pricing/products/${item.product?._id}`
              );
              const bulkTiers = bulkResponse.data || [];

              // Get the correct price display - use sale price if available
              const getDisplayPrice = () => {
                if (
                  item.product?.salePrice &&
                  item.product.salePrice < item.product.price
                ) {
                  return parseFloat(item.product.salePrice);
                }
                return (
                  parseFloat(item.product?.price) ||
                  parseFloat(item.unitPrice) ||
                  0
                );
              };

              const displayPrice = getDisplayPrice();

              return {
                _id: item._id || Math.random().toString(),
                cartItemId: item._id,
                product: {
                  _id: item.product?._id,
                  name: item.product?.name || "Product",
                  price: parseFloat(item.product?.price) || 0,
                  salePrice: item.product?.salePrice
                    ? parseFloat(item.product.salePrice)
                    : null,
                  images: item.product?.images || [],
                  stock: item.product?.stock || 100,
                  bulkPricingEnabled: bulkTiers.length > 0,
                  bulkTiers: bulkTiers,
                },
                quantity: item.quantity || 1,
                unitPrice: parseFloat(item.unitPrice) || displayPrice,
                finalPrice:
                  parseFloat(item.finalPrice) ||
                  displayPrice * (item.quantity || 1),
                appliedTier: item.appliedTier,
                discountAmount: parseFloat(item.discountAmount) || 0,
              };
            } catch (error) {
              console.error(
                `Error fetching bulk pricing for product ${item.product?._id}:`,
                error
              );
              // Fallback if bulk pricing fetch fails
              const getDisplayPrice = () => {
                if (
                  item.product?.salePrice &&
                  item.product.salePrice < item.product.price
                ) {
                  return parseFloat(item.product.salePrice);
                }
                return (
                  parseFloat(item.product?.price) ||
                  parseFloat(item.unitPrice) ||
                  0
                );
              };

              const displayPrice = getDisplayPrice();

              return {
                _id: item._id || Math.random().toString(),
                cartItemId: item._id,
                product: {
                  _id: item.product?._id,
                  name: item.product?.name || "Product",
                  price: parseFloat(item.product?.price) || 0,
                  salePrice: item.product?.salePrice
                    ? parseFloat(item.product.salePrice)
                    : null,
                  images: item.product?.images || [],
                  stock: item.product?.stock || 100,
                  bulkPricingEnabled: false,
                  bulkTiers: [],
                },
                quantity: item.quantity || 1,
                unitPrice: parseFloat(item.unitPrice) || displayPrice,
                finalPrice:
                  parseFloat(item.finalPrice) ||
                  displayPrice * (item.quantity || 1),
                appliedTier: item.appliedTier,
                discountAmount: parseFloat(item.discountAmount) || 0,
              };
            }
          })
        );

        setCartItems(itemsWithBulkPricing);
        setOriginalCartItems(itemsWithBulkPricing);
        setHasUnsavedChanges(false);
      } else {
        setCartItems([]);
        setOriginalCartItems([]);
      }
    } catch (error) {
      console.error("Cart fetch error:", error);
      setCartItems([]);
      setOriginalCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id === itemId) {
          // Calculate new pricing locally for instant feedback
          const pricing = calculateBulkPrice(item.product, newQuantity);

          return {
            ...item,
            quantity: newQuantity,
            unitPrice: pricing.unitPrice,
            finalPrice: pricing.finalPrice,
            appliedTier: pricing.appliedTier,
            discountAmount: pricing.discountAmount,
          };
        }
        return item;
      })
    );

    // Check if quantity has changed from original
    const item = cartItems.find((item) => item._id === itemId);
    const originalItem = originalCartItems.find((oi) => oi._id === itemId);
    if (item && originalItem && item.quantity !== newQuantity) {
      setHasUnsavedChanges(true);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("Please login to modify cart");
        return;
      }

      const item = cartItems.find((item) => item._id === itemId);
      if (!item) return;

      // Optimistic update - remove from UI immediately
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
      setOriginalCartItems((prev) =>
        prev.filter((item) => item._id !== itemId)
      );

      // Update backend
      await API.delete(`/cart/${user.id || user._id}/${item.product._id}`);
      toast.success("Item removed from cart");

      // Check if still have unsaved changes
      if (cartItems.length === 1) {
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error("Failed to remove item");
      // Revert on error
      fetchCart();
    }
  };

  const calculateBulkPrice = (product, quantity) => {
    // Get the base price (consider sale price if available)
    const getBasePrice = () => {
      // Check if product has salePrice and it's lower than regular price
      if (product.salePrice && product.salePrice < product.price) {
        return parseFloat(product.salePrice);
      }
      return parseFloat(product.price) || 0;
    };

    const basePrice = getBasePrice();

    if (
      !product.bulkPricingEnabled ||
      !product.bulkTiers ||
      product.bulkTiers.length === 0 ||
      basePrice === 0
    ) {
      return {
        unitPrice: basePrice,
        finalPrice: basePrice * quantity,
        appliedTier: null,
        discountAmount: 0,
      };
    }

    const sortedTiers = [...product.bulkTiers].sort(
      (a, b) => b.minQuantity - a.minQuantity
    );
    const applicableTier = sortedTiers.find(
      (tier) => quantity >= tier.minQuantity
    );

    if (!applicableTier) {
      return {
        unitPrice: basePrice,
        finalPrice: basePrice * quantity,
        appliedTier: null,
        discountAmount: 0,
      };
    }

    let finalUnitPrice;
    let discountAmount;

    if (applicableTier.discountType === "percentage") {
      discountAmount = basePrice * (applicableTier.discountValue / 100);
      finalUnitPrice = basePrice - discountAmount;
    } else {
      discountAmount = parseFloat(applicableTier.discountValue) || 0;
      finalUnitPrice = basePrice - discountAmount;
    }

    finalUnitPrice = Math.max(0, finalUnitPrice);
    discountAmount = Math.max(0, discountAmount);

    return {
      unitPrice: finalUnitPrice,
      finalPrice: finalUnitPrice * quantity,
      finalUnitPrice: finalUnitPrice,
      appliedTier: applicableTier._id,
      discountAmount: discountAmount * quantity,
    };
  };

  const saveQuantityChanges = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("Please login to save changes");
        return;
      }

      // Find items with changed quantities
      const changedItems = cartItems.filter((item, index) => {
        const originalItem = originalCartItems[index];
        return originalItem && item.quantity !== originalItem.quantity;
      });

      if (changedItems.length === 0) {
        toast.info("No changes to save");
        return;
      }

      toast.info("Saving changes...");

      // Update all changed items in backend
      const updatePromises = changedItems.map((item) =>
        API.put(`/cart/${user.id || user._id}/${item.product._id}`, {
          quantity: item.quantity,
        })
      );

      await Promise.all(updatePromises);

      // Update original cart items to match current state
      setOriginalCartItems([...cartItems]);
      setHasUnsavedChanges(false);

      toast.success("Changes saved successfully!");
      return true;
    } catch (error) {
      console.error("Save changes error:", error);
      toast.error("Failed to save changes");
      return false;
    }
  };

  const handleCheckout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("Please login to checkout");
        return;
      }

      // If there are unsaved quantity changes, save them first
      if (hasUnsavedChanges) {
        const saved = await saveQuantityChanges();
        if (!saved) {
          // Don't proceed if save failed
          return;
        }
      }

      // Navigate to checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to proceed to checkout");
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.finalPrice || 0), 0);
  };

  const calculateTotalSavings = () => {
    return cartItems.reduce(
      (total, item) => total + (item.discountAmount || 0),
      0
    );
  };

  const calculateOriginalSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // Use sale price if available, otherwise original price
      const basePrice =
        item.product.salePrice && item.product.salePrice < item.product.price
          ? item.product.salePrice
          : item.product.price;

      return total + (basePrice || 0) * (item.quantity || 1);
    }, 0);
  };

  const shippingFee = calculateSubtotal() > 5000 ? 0 : 200;
  const tax = calculateSubtotal() * 0.05;
  const total = calculateSubtotal() + shippingFee + tax;

  const BulkPricingInfo = ({ product, currentQuantity }) => {
    // Get base price considering sale price
    const getBasePrice = () => {
      if (product.salePrice && product.salePrice < product.price) {
        return parseFloat(product.salePrice);
      }
      return parseFloat(product.price) || 0;
    };

    const basePrice = getBasePrice();

    // Check if product has bulk pricing enabled and has valid tiers
    if (
      !product.bulkPricingEnabled ||
      !product.bulkTiers ||
      !Array.isArray(product.bulkTiers) ||
      product.bulkTiers.length === 0 ||
      basePrice === 0
    ) {
      return null;
    }

    // Filter out invalid tiers and sort by minQuantity
    const validTiers = product.bulkTiers.filter(
      (tier) =>
        tier &&
        typeof tier.minQuantity === "number" &&
        tier.minQuantity > 0 &&
        tier.discountValue !== undefined
    );

    if (validTiers.length === 0) {
      return null;
    }

    const sortedTiers = [...validTiers].sort(
      (a, b) => a.minQuantity - b.minQuantity
    );

    const nextTier = sortedTiers.find(
      (tier) => tier.minQuantity > currentQuantity
    );

    return (
      <div className="mt-2">
        {sortedTiers.map((tier, index) => {
          if (currentQuantity >= tier.minQuantity) {
            return (
              <div
                key={index}
                className="flex items-center text-green-600 text-sm mb-1"
              >
                <FaTag className="mr-1 text-xs" />
                <span className="font-medium">Bulk Discount Applied!</span>
                <span className="ml-2">
                  {tier.discountType === "percentage"
                    ? `${tier.discountValue || 0}% off`
                    : `Rs ${tier.discountValue || 0} off`}
                </span>
              </div>
            );
          }
          return null;
        })}

        {nextTier && (
          <div className="text-blue-600 text-xs flex items-center">
            <FaLayerGroup className="mr-1" />
            Add {nextTier.minQuantity - currentQuantity} more for{" "}
            {nextTier.discountType === "percentage"
              ? `${nextTier.discountValue || 0}% off`
              : `Rs ${nextTier.discountValue || 0} off`}
          </div>
        )}

        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <div className="font-medium text-gray-700 mb-1">
            Bulk Pricing Tiers:
          </div>
          {sortedTiers.map((tier, index) => {
            const calculatedPrice =
              tier.discountType === "percentage"
                ? basePrice * (1 - (tier.discountValue || 0) / 100)
                : basePrice - (parseFloat(tier.discountValue) || 0);

            return (
              <div key={index} className="flex justify-between text-gray-600">
                <span>{tier.minQuantity || 0}+ units:</span>
                <span className="font-medium">
                  Rs {calculatedPrice.toFixed(2)}
                  <span className="text-green-600 ml-1">
                    (
                    {tier.discountType === "percentage"
                      ? `${tier.discountValue || 0}% off`
                      : `Save Rs ${tier.discountValue || 0}`}
                    )
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background-light">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <FaShoppingCart className="mx-auto text-6xl text-neutral-400 mb-4" />
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-neutral-600 mb-6">
              Start shopping to add items to your cart
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Continue Shopping
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-800 sm:text-3xl">
            Shopping Cart
          </h1>

          {hasUnsavedChanges && (
            <button
              onClick={saveQuantityChanges}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Save Changes
            </button>
          )}
        </div>

        {hasUnsavedChanges && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <FaTag className="text-yellow-600 mr-2" />
              <span className="font-semibold text-yellow-800">
                You have unsaved quantity changes
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Changes will be saved automatically when you proceed to checkout
            </p>
          </div>
        )}

        {calculateTotalSavings() > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaPercentage className="text-green-600 mr-2" />
                <span className="font-semibold text-green-800">
                  You're saving Rs {calculateTotalSavings().toFixed(2)} with
                  bulk discounts!
                </span>
              </div>
              <div className="text-sm text-green-700">
                Great choice buying in bulk!
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col p-4 border-b border-neutral-200 last:border-b-0 sm:flex-row sm:items-center sm:p-6"
                >
                  <div className="flex items-start space-x-4 mb-4 sm:mb-0 sm:flex-1">
                    <div className="relative flex-shrink-0 w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center sm:w-20 sm:h-20">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.product.images[0])}
                          alt={item.product.name}
                          className="object-cover w-full h-full rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
                          }}
                        />
                      ) : (
                        <FaShoppingCart className="text-neutral-400" />
                      )}
                      {item.product.bulkPricingEnabled && (
                        <div className="absolute -top-1 -right-1">
                          <div className="bg-blue-500 text-white rounded-full p-1">
                            <FaLayerGroup className="text-xs" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-800 text-sm sm:text-base line-clamp-2">
                        {item.product.name}
                        {item.product.bulkPricingEnabled && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Bulk Discounts
                          </span>
                        )}
                      </h3>

                      <div className="flex items-center mt-1 space-x-2">
                        {(() => {
                          // Calculate the current price for this item
                          const currentPricing = calculateBulkPrice(
                            item.product,
                            item.quantity
                          );
                          const calculatedUnitPrice = currentPricing.unitPrice;

                          return (
                            <>
                              {/* Always show the calculated unit price */}
                              <p className="text-lg font-bold text-green-600 sm:text-xl">
                                Rs {calculatedUnitPrice.toFixed(2)}
                              </p>

                              {/* Show comparison price if there's any discount applied */}
                              {currentPricing.appliedTier ? (
                                // Bulk discount applied
                                <p className="text-sm text-neutral-500 line-through">
                                  Rs{" "}
                                  {(item.product.salePrice &&
                                  item.product.salePrice < item.product.price
                                    ? item.product.salePrice
                                    : item.product.price
                                  ).toFixed(2)}
                                </p>
                              ) : item.product.salePrice &&
                                item.product.salePrice < item.product.price ? (
                                // Only sale discount applied
                                <p className="text-sm text-neutral-500 line-through">
                                  Rs {item.product.price.toFixed(2)}
                                </p>
                              ) : // No discounts
                              null}
                            </>
                          );
                        })()}
                      </div>

                      <BulkPricingInfo
                        product={item.product}
                        currentQuantity={item.quantity}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        className="p-1 rounded-full hover:bg-neutral-100 transition-colors sm:p-2"
                      >
                        <FaMinus className="text-neutral-600 text-xs sm:text-sm" />
                      </button>
                      <span className="w-8 text-center font-medium text-neutral-800 sm:w-12 sm:text-base">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 rounded-full hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:p-2"
                      >
                        <FaPlus className="text-neutral-600 text-xs sm:text-sm" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-neutral-800 sm:text-lg">
                          Rs {(item.finalPrice || 0).toFixed(2)}
                        </p>
                        {item.discountAmount > 0 && (
                          <p className="text-xs text-green-600">
                            Saved: Rs {(item.discountAmount || 0).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <FaTrash className="text-sm sm:text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm sm:text-base"
              >
                <FaArrowLeft className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-4 sm:text-2xl">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {calculateTotalSavings() > 0 && (
                  <div className="flex justify-between text-neutral-500 text-sm">
                    <span>Original Subtotal</span>
                    <span className="line-through">
                      Rs {calculateOriginalSubtotal().toFixed(2)}
                    </span>
                  </div>
                )}

                {calculateTotalSavings() > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span className="flex items-center">
                      <FaPercentage className="mr-1" />
                      Bulk Discounts
                    </span>
                    <span className="font-medium">
                      -Rs {calculateTotalSavings().toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600 text-sm sm:text-base">
                  <span>Subtotal</span>
                  <span>Rs {calculateSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-neutral-600 text-sm sm:text-base">
                  <span>Shipping</span>
                  <span
                    className={
                      shippingFee === 0 ? "text-green-600 font-medium" : ""
                    }
                  >
                    {shippingFee === 0 ? "FREE" : `Rs ${shippingFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-600 text-sm sm:text-base">
                  <span>Tax (5%)</span>
                  <span>Rs {tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-neutral-800 sm:text-xl">
                    <span>Total</span>
                    <span>Rs {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-center block text-sm sm:text-base"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-neutral-500 text-center mt-4 sm:text-sm">
                {calculateSubtotal() < 5000 ? (
                  <>
                    Add Rs {(5000 - calculateSubtotal()).toFixed(2)} more for
                    free shipping
                  </>
                ) : (
                  <span className="text-green-600">
                    ✓ Free shipping applied!
                  </span>
                )}
              </p>

              {calculateTotalSavings() > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-800 text-sm">
                    <FaLayerGroup className="mr-2" />
                    <span className="font-medium">Smart Shopping!</span>
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

export default Cart;
