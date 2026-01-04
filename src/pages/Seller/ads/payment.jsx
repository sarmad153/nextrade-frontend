import React, { useState } from "react";
import {
  FaTimes,
  FaCreditCard,
  FaUniversity,
  FaUpload,
  FaCheckCircle,
  FaSpinner,
  FaReceipt,
  FaFileUpload,
  FaArrowLeft,
  FaHourglassHalf,
  FaLock,
} from "react-icons/fa";
import API from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const PaymentModal = ({ ad, onClose, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionId, setTransactionId] = useState("");

  const paymentMethods = [
    {
      id: "coming_soon_1",
      name: "Online Payments",
      icon: <FaCreditCard className="text-2xl text-gray-400" />,
      description: "Coming Soon - Online payment options",
      instructions: "Online payments will be available soon",
      type: "coming_soon",
      disabled: true,
    },
    {
      id: "coming_soon_2",
      name: "Digital Wallets",
      icon: <FaLock className="text-2xl text-gray-400" />,
      description: "Coming Soon - Secure digital wallets",
      instructions: "Digital wallet integration in progress",
      type: "coming_soon",
      disabled: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: <FaUniversity className="text-2xl text-blue-600" />,
      description: "Manual payment - requires proof upload",
      instructions: "Transfer funds to bank account and upload receipt",
      type: "manual",
      requiresTransactionId: false,
      disabled: false,
    },
  ];

  const handleMethodSelect = (methodId) => {
    const method = paymentMethods.find((m) => m.id === methodId);
    if (method.disabled) {
      toast.info(`${method.name} will be available soon!`);
      return;
    }
    setSelectedMethod(methodId);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Maximum size is 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await API.post("/upload/payment/proof", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      let imageUrl = "";
      if (response.data.imageUrl) {
        imageUrl = response.data.imageUrl;
      } else if (response.data.url) {
        imageUrl = response.data.url;
      }

      if (!imageUrl) {
        throw new Error("No image URL returned from server");
      }

      setProofImageUrl(imageUrl);
      setProofImage(file);
      toast.success("Payment proof uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload payment proof"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (selectedMethod === "bank_transfer" && !proofImageUrl) {
      toast.error("Please upload payment proof for bank transfer");
      return;
    }

    setCurrentStep(2);
  };

  const handleCompletePayment = async () => {
    setProcessing(true);
    try {
      if (!ad.payment?._id) {
        throw new Error("Payment record not found. Please contact support.");
      }

      if (proofImage) {
        const proofFormData = new FormData();
        proofFormData.append("image", proofImage);

        await API.post(
          `/payments/${ad.payment._id}/upload-proof`,
          proofFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else if (proofImageUrl) {
        const formData = new FormData();
        formData.append("imageUrl", proofImageUrl);

        await API.post(`/payments/${ad.payment._id}/upload-proof`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        throw new Error("No payment proof provided");
      }

      toast.success("Payment proof submitted successfully!");
      onPaymentComplete();
    } catch (error) {
      console.error("Payment completion error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Payment failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Get bank details from backend or use defaults
  const bankDetails = {
    bankName: "Sadapay",
    accountNumber: "+9230287900729",
    accountName: "Muhammad Sarmad Javed",
    amount: ad.totalCost,
    reference: `AD${ad._id}`,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  };

  const getSelectedMethod = () => {
    return paymentMethods.find((m) => m.id === selectedMethod);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">
              Complete Payment
            </h2>
            <p className="text-neutral-600">
              Pay for your advertisement: <strong>{ad.title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 rounded-lg hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            disabled={processing}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Main Content*/}
        <div className="flex-1 flex overflow-hidden">
          {/*Payment Method Selection */}
          {currentStep === 1 && (
            <>
              {/* Left Side - Payment Methods*/}
              <div className="w-1/2 border-r border-neutral-200 flex flex-col">
                <div className="p-6 border-b border-neutral-200 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    Select Payment Method
                  </h3>
                  <p className="text-neutral-600">
                    Choose how you want to pay for your advertisement
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Coming Soon Payment Methods */}
                    <div>
                      <h4 className="font-semibold text-neutral-700 mb-3 text-sm uppercase tracking-wide">
                        Coming Soon
                      </h4>
                      <div className="space-y-3">
                        {paymentMethods
                          .filter((method) => method.type === "coming_soon")
                          .map((method) => (
                            <div
                              key={method.id}
                              onClick={() => handleMethodSelect(method.id)}
                              className={`p-4 border-2 rounded-lg cursor-not-allowed transition-all ${
                                method.disabled
                                  ? "border-gray-300 bg-gray-100 opacity-60"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  {method.icon}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-neutral-800">
                                    {method.name}
                                  </h4>
                                  <p className="text-sm text-neutral-600">
                                    {method.description}
                                  </p>
                                  <div className="flex items-center text-xs text-yellow-600 mt-1">
                                    <FaHourglassHalf className="mr-1" />
                                    <span>Coming Soon</span>
                                  </div>
                                </div>
                                {selectedMethod === method.id && (
                                  <FaCheckCircle className="text-green-500 text-xl" />
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Available Payment Method */}
                    <div>
                      <h4 className="font-semibold text-neutral-700 mb-3 text-sm uppercase tracking-wide">
                        Available Now
                      </h4>
                      <div
                        onClick={() => handleMethodSelect("bank_transfer")}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedMethod === "bank_transfer"
                            ? "border-blue-500 bg-blue-50"
                            : "border-blue-300 hover:border-blue-400 bg-white"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <FaUniversity className="text-2xl text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-neutral-800">
                              Bank Transfer
                            </h4>
                            <p className="text-sm text-neutral-600">
                              Manual payment - requires proof upload
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Requires admin verification (24-48 hours)
                            </p>
                          </div>
                          {selectedMethod === "bank_transfer" && (
                            <FaCheckCircle className="text-blue-500 text-xl" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Instructions & Details*/}
              <div className="w-1/2 flex flex-col">
                <div className="p-6 border-b border-neutral-200 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-neutral-800">
                    {selectedMethod ? "Payment Details" : "Select a Method"}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {!selectedMethod ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <FaCreditCard className="mx-auto text-4xl text-neutral-400 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                          Select a Payment Method
                        </h3>
                        <p className="text-neutral-600">
                          Currently only Bank Transfer is available. More
                          payment options coming soon!
                        </p>
                      </div>
                    </div>
                  ) : selectedMethod === "bank_transfer" ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                          Bank Transfer Instructions
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-3">
                            Transfer Funds to:
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-700 font-medium">
                                Bank Name:
                              </span>
                              <span className="font-semibold">
                                {bankDetails.bankName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700 font-medium">
                                Account Number:
                              </span>
                              <span className="font-semibold">
                                {bankDetails.accountNumber}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700 font-medium">
                                Account Name:
                              </span>
                              <span className="font-semibold">
                                {bankDetails.accountName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700 font-medium">
                                Amount:
                              </span>
                              <span className="font-semibold">
                                Rs {bankDetails.amount}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700 font-medium">
                                Reference:
                              </span>
                              <span className="font-semibold">
                                {bankDetails.reference}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700 font-medium">
                                Due Date:
                              </span>
                              <span className="font-semibold">
                                {new Date(
                                  bankDetails.dueDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Proof Upload Section */}
                      <div>
                        <h4 className="font-semibold text-neutral-800 mb-3">
                          Upload Payment Proof
                        </h4>
                        <div className="space-y-4">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                              <strong>Important:</strong> After making the bank
                              transfer, upload a clear screenshot or photo of
                              the transaction receipt. Your ad will be activated
                              after manual verification.
                            </p>
                          </div>

                          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                            {!proofImageUrl ? (
                              <div>
                                <FaFileUpload className="mx-auto text-3xl text-neutral-400 mb-3" />
                                <p className="text-sm text-neutral-600 mb-4">
                                  Upload screenshot of bank transfer receipt
                                </p>
                                <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors">
                                  <FaUpload className="mr-2" />
                                  Choose File
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleImageUpload(e.target.files[0])
                                    }
                                    className="hidden"
                                    disabled={uploading}
                                  />
                                </label>
                                {uploading && (
                                  <div className="mt-3">
                                    <FaSpinner className="animate-spin text-blue-600 mx-auto" />
                                    <p className="text-xs text-neutral-500 mt-1">
                                      Uploading...
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center">
                                <FaCheckCircle className="mx-auto text-3xl text-green-500 mb-3" />
                                <p className="text-green-700 font-medium mb-2">
                                  Proof uploaded successfully!
                                </p>
                                <p className="text-xs text-neutral-500">
                                  Ready to submit for verification
                                </p>
                                <button
                                  onClick={() => {
                                    setProofImageUrl("");
                                    setProofImage(null);
                                  }}
                                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                                >
                                  Remove & Re-upload
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                          {getSelectedMethod()?.name} Payment
                        </h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Coming Soon
                          </h4>
                          <ul className="text-sm text-gray-700 space-y-2">
                            <li>
                              • This payment method will be available soon
                            </li>
                            <li>
                              • We're working on integrating secure online
                              payments
                            </li>
                            <li>• Currently please use Bank Transfer option</li>
                            <li>• Check back for updates</li>
                          </ul>
                        </div>
                      </div>

                      {/* Coming Soon Info */}
                      <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                        <FaHourglassHalf className="mx-auto text-4xl text-gray-400 mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Feature Coming Soon
                        </h4>
                        <p className="text-sm text-gray-600">
                          We're working hard to bring you secure online payment
                          options. In the meantime, please use Bank Transfer.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Payment Confirmation */}
          {currentStep === 2 && (
            <>
              {/* Left Side - Order Summary*/}
              <div className="w-1/2 border-r border-neutral-200 flex flex-col">
                <div className="p-6 border-b border-neutral-200 flex-shrink-0">
                  <div className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="mr-3 p-1 text-neutral-600 hover:text-neutral-800"
                      disabled={processing}
                    >
                      <FaArrowLeft />
                    </button>
                    <h3 className="text-lg font-semibold text-neutral-800">
                      Order Summary
                    </h3>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    <div>
                      <p className="text-neutral-600 mb-4">
                        Review your order details before proceeding
                      </p>
                    </div>

                    <div className="bg-neutral-50 rounded-lg p-6">
                      <h4 className="font-semibold text-neutral-800 mb-4 border-b border-neutral-200 pb-2">
                        Order Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Ad Title:</span>
                          <span className="font-medium text-neutral-800">
                            {ad.title}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Duration:</span>
                          <span className="font-medium text-neutral-800">
                            {ad.duration} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">
                            Payment Method:
                          </span>
                          <span className="font-medium text-neutral-800 capitalize">
                            Bank Transfer
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Status:</span>
                          <span className="font-medium text-yellow-600">
                            Awaiting Verification
                          </span>
                        </div>
                        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                          Ad will activate after admin verification (24-48
                          hours)
                        </div>
                        <div className="border-t border-neutral-300 pt-3 mt-2">
                          <div className="flex justify-between text-lg font-bold">
                            <span className="text-neutral-800">
                              Total Amount:
                            </span>
                            <span className="text-primary-600">
                              Rs {ad.totalCost}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Action & Next Steps */}
              <div className="w-1/2 flex flex-col">
                <div className="p-6 border-b border-neutral-200 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-neutral-800">
                    Next Steps
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          Manual Verification Process
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-2">
                          <li>• Your payment proof will be submitted</li>
                          <li>• Our team will verify within 24-48 hours</li>
                          <li>• You'll receive email confirmation</li>
                          <li>• Ad will activate after verification</li>
                        </ul>
                      </div>
                      <div className="text-center text-sm text-neutral-600">
                        <p>
                          You can track payment status in your ads dashboard
                        </p>
                      </div>
                    </div>

                    {/* Coming Soon Notice */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Online Payments Coming Soon
                      </h4>
                      <p className="text-sm text-gray-600">
                        We're working on adding JazzCash, EasyPaisa, and other
                        online payment options. Stay tuned for updates!
                      </p>
                    </div>

                    {/* Action Buttons  */}
                    <div className="flex space-x-3 pt-4 mt-auto">
                      <button
                        onClick={() => setCurrentStep(1)}
                        disabled={processing}
                        className="flex-1 px-4 py-3 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors font-medium"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCompletePayment}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                      >
                        {processing ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaReceipt className="mr-2" />
                            Submit for Verification
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Action Bar */}
        {currentStep === 1 &&
          selectedMethod &&
          selectedMethod === "bank_transfer" && (
            <div className="border-t border-neutral-200 p-4 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-neutral-600">
                  Select payment method
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={
                      !selectedMethod ||
                      (selectedMethod === "bank_transfer" && !proofImageUrl)
                    }
                    className="px-6 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default PaymentModal;
