import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { posService } from '../../services/pos.service';
import { Analytics } from '@vercel/analytics/react';

const POSPayment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed

  const { data: orderData } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId,
  });

  const processPaymentMutation = useMutation({
    mutationFn: () => posService.processPayment(orderId),
    onSuccess: () => {
      setPaymentStatus('success');
    },
    onError: () => {
      setPaymentStatus('failed');
    },
  });

  const order = orderData?.data;

  useEffect(() => {
    if (order && order.status === 'PAID') {
      setPaymentStatus('success');
    }
  }, [order]);

  const handleProcessPayment = () => {
    setPaymentStatus('processing');
    processPaymentMutation.mutate();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleNewOrder = () => {
    navigate('/pos');
  };

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8">Payment</h1>

          {/* Order Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <p>
                <strong>Order Number:</strong> {order.orderNumber}
              </p>
              <p>
                <strong>Total:</strong> {order.total.toFixed(2)} UZS
              </p>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Items:</h3>
              <ul className="space-y-2">
                {order.items?.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {item.product?.name} - Size: {item.size} x {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toFixed(2)} UZS</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mb-8">
            <div
              className={`p-4 rounded-lg text-center ${
                paymentStatus === 'success'
                  ? 'bg-green-100 text-green-800'
                  : paymentStatus === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : paymentStatus === 'processing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {paymentStatus === 'success' && (
                <div>
                  <p className="text-2xl font-bold mb-2">Payment Successful!</p>
                  <p>Order has been completed.</p>
                </div>
              )}
              {paymentStatus === 'failed' && (
                <div>
                  <p className="text-2xl font-bold mb-2">Payment Failed</p>
                  <p>Please try again.</p>
                </div>
              )}
              {paymentStatus === 'processing' && (
                <div>
                  <p className="text-2xl font-bold mb-2">Processing Payment...</p>
                  <p>Please wait...</p>
                </div>
              )}
              {paymentStatus === 'pending' && (
                <div>
                  <p className="text-2xl font-bold mb-2">Waiting for Payment</p>
                  <p>Click the button below to process terminal payment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {paymentStatus === 'pending' && (
              <button
                onClick={handleProcessPayment}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700"
              >
                Process Terminal Payment
              </button>
            )}

            {paymentStatus === 'success' && (
              <>
                <button
                  onClick={handlePrintReceipt}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 mb-4"
                >
                  Print Receipt
                </button>
                <button
                  onClick={handleNewOrder}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700"
                >
                  New Order
                </button>
              </>
            )}

            {paymentStatus === 'failed' && (
              <button
                onClick={handleProcessPayment}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700"
              >
                Retry Payment
              </button>
            )}
          </div>
        </div>
      </div>
      <Analytics />
    </div>
  );
};

export default POSPayment;

