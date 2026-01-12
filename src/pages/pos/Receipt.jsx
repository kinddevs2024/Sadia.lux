import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { posService } from "../../services/pos.service";
import { Analytics } from "@vercel/analytics/react";

const POSReceipt = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [printed, setPrinted] = useState(false);

  const {
    data: receiptData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["receipt", orderId],
    queryFn: () => posService.getReceiptData(orderId),
    enabled: !!orderId,
  });

  const receipt = receiptData?.data;

  useEffect(() => {
    // Auto-print on first load
    if (receipt && !printed) {
      const timer = setTimeout(() => {
        window.print();
        setPrinted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [receipt, printed]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700 mb-2">
            Loading receipt...
          </div>
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600 mb-4">
            Failed to load receipt
          </div>
          <button
            onClick={() => navigate("/pos")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to POS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* No-print controls */}
        <div className="print:hidden flex gap-3 mb-4">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🖨️ Print Receipt
          </button>
          <button
            onClick={() => navigate("/pos")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← New Sale
          </button>
        </div>

        {/* Receipt Content - Printable */}
        <div className="bg-white p-8 rounded-lg shadow print:shadow-none print:p-0 print:rounded-none max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold tracking-wide">SADIA.LUX</h1>
            <p className="text-sm text-gray-600 mt-1">Receipt / Invoice</p>
          </div>

          {/* Receipt Number & Date */}
          <div className="mb-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span className="font-mono font-bold">
                {receipt.receipt_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-mono">{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-mono">{receipt.time}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span className="font-mono">{receipt.cashier}</span>
            </div>
          </div>

          {/* Line */}
          <div className="border-t border-gray-400 my-4"></div>

          {/* Items */}
          <div className="mb-4 text-sm">
            <div className="font-bold mb-2 flex justify-between text-xs">
              <span>ITEM</span>
              <span>QTY × PRICE</span>
              <span className="text-right">TOTAL</span>
            </div>

            {receipt.items.map((item, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-xs">{item.name}</span>
                  <span className="text-right font-mono font-semibold">
                    {(item.quantity * item.price).toLocaleString()} UZS
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {item.quantity} × {item.price.toLocaleString()} UZS
                  {item.sku && (
                    <span className="ml-2 text-gray-500">SKU: {item.sku}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Line */}
          <div className="border-t border-gray-400 my-4"></div>

          {/* Totals */}
          <div className="mb-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">
                {receipt.subtotal.toLocaleString()} UZS
              </span>
            </div>
            {receipt.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-mono">
                  {receipt.tax.toLocaleString()} UZS
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-gray-400 pt-2">
              <span>TOTAL:</span>
              <span className="font-mono">
                {receipt.total.toLocaleString()} UZS
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-4 text-sm bg-gray-50 p-2 rounded">
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="font-mono font-bold">
                {receipt.payment_method || "CASH"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span
                className={`font-mono font-bold ${
                  receipt.payment_status === "paid"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {receipt.payment_status?.toUpperCase()}
              </span>
            </div>
            {receipt.terminal_transaction_id && (
              <div className="flex justify-between text-xs mt-1">
                <span>Transaction ID:</span>
                <span className="font-mono text-gray-600">
                  {receipt.terminal_transaction_id.substring(0, 20)}...
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-400 pt-4 text-center">
            <p className="text-xs text-gray-600 mb-3">
              Thank you for your purchase!
            </p>
            <p className="text-xs text-gray-500">
              Please keep this receipt for your records.
            </p>
            <div className="mt-4 text-xs text-gray-400 font-mono">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Web-only message */}
        <div className="print:hidden text-center mt-4 text-gray-600 text-sm">
          <p>
            Click "Print Receipt" button above or press Ctrl+P (Cmd+P on Mac) to
            print
          </p>
        </div>
      </div>

      <Analytics />
    </div>
  );
};

export default POSReceipt;
