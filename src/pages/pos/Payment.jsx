import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { posService } from "../../services/pos.service";
import { Analytics } from "@vercel/analytics/react";

const POSPayment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, success, failed
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const { data: orderData, isLoading } = useQuery({
    queryKey: ["pos-order", orderId],
    queryFn: () => posService.getOrder(orderId),
    enabled: !!orderId,
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: () => {
      if (location.state?.transactionId) {
        return posService.confirmPaymentByTransactionId(
          location.state.transactionId
        );
      }
      return posService.confirmPaymentByOrderId(orderId);
    },
    onSuccess: (response) => {
      setPaymentStatus("success");
      setError(null);
      // Redirect to receipt after short delay
      setTimeout(() => {
        navigate(`/pos/receipt/${orderId}`);
      }, 1500);
    },
    onError: (err) => {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Payment confirmation failed";
      setPaymentStatus("failed");
      setError(message);
      console.error("Payment confirmation error:", err);
    },
  });

  const order = orderData?.data?.order;
  const cashier = orderData?.data?.cashier;

  useEffect(() => {
    // Check if order is already paid (e.g., from cache or refresh)
    if (order && order.payment_status === "paid") {
      setPaymentStatus("success");
    }
  }, [order]);

  const handleConfirmPayment = () => {
    setPaymentStatus("processing");
    setError(null);
    confirmPaymentMutation.mutate();
  };

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
    handleConfirmPayment();
  };

  const handleCancel = () => {
    navigate("/pos");
  };

  const handleTryCash = () => {
    // This would require a backend endpoint to convert terminal order to cash
    // For now, just go back to POS
    navigate("/pos");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700 mb-2">
            Loading payment details...
          </div>
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600 mb-4">
            Order not found
          </div>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to POS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success State */}
        {paymentStatus === "success" && (
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Payment Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              Your order has been successfully processed.
            </p>
            <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                Receipt #{order.receipt_number}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {order.total.toLocaleString()} UZS
              </p>
            </div>
            <button
              onClick={() => navigate(`/pos/receipt/${orderId}`)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 mb-2"
            >
              View & Print Receipt
            </button>
            <button
              onClick={handleCancel}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              New Sale
            </button>
          </div>
        )}

        {/* Processing State */}
        {paymentStatus === "processing" && (
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
            <div className="mb-6">
              <div className="inline-block">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Processing Payment
            </h1>
            <p className="text-gray-600 mb-6">
              Please wait while we confirm your terminal payment...
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-gray-700 mb-2">
                Receipt #{order.receipt_number}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {order.total.toLocaleString()} UZS
              </p>
            </div>
          </div>
        )}

        {/* Pending/Awaiting Confirmation State */}
        {paymentStatus === "pending" && !error && (
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Terminal Payment Pending
            </h1>
            <p className="text-gray-600 mb-6">
              Payment is waiting for terminal confirmation. Insert or tap the
              customer's card.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                ⏳ Waiting for Terminal
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span className="font-bold">
                    {order.total.toLocaleString()} UZS
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Receipt #:</span>
                  <span className="font-mono text-xs">
                    {order.receipt_number}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <span className="font-semibold">Awaiting Confirmation</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={confirmPaymentMutation.isPending}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {confirmPaymentMutation.isPending
                ? "Confirming..."
                : "✓ Confirm Payment"}
            </button>

            <button
              onClick={handleCancel}
              disabled={confirmPaymentMutation.isPending}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✕ Cancel Transaction
            </button>

            {cashier && (
              <p className="text-center text-xs text-gray-500 mt-4">
                Cashier: {cashier.firstName} {cashier.lastName}
              </p>
            )}
          </div>
        )}

        {/* Failed/Error State */}
        {(paymentStatus === "failed" || error) && (
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="text-6xl mb-4 text-center">✕</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2 text-center">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              {error ||
                "Payment could not be processed. Please try again or select a different payment method."}
            </p>

            <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                Receipt #{order.receipt_number}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {order.total.toLocaleString()} UZS
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRetry}
                disabled={confirmPaymentMutation.isPending}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                🔄 Retry Payment {retryCount > 0 && `(${retryCount})`}
              </button>

              <button
                onClick={handleTryCash}
                disabled={confirmPaymentMutation.isPending}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50"
              >
                💵 Try Cash Payment Instead
              </button>

              <button
                onClick={handleCancel}
                disabled={confirmPaymentMutation.isPending}
                className="w-full px-4 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50"
              >
                Discard & Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      <Analytics />
    </div>
  );
};

export default POSPayment;
