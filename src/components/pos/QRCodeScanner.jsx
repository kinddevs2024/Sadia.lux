import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { posService } from "../../services/pos.service";

/**
 * QRCodeScanner Component
 * Handles barcode/QR code scanning for quick product lookup
 * Can work with:
 * - Physical barcode scanners (input via keyboard events)
 * - QR code generated from products
 * - Product SKU
 */
const QRCodeScanner = ({ onProductScanned, onClose }) => {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedProduct, setScannedProduct] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Mutation for scanning barcode
  const scanMutation = useMutation({
    mutationFn: (barcode) => posService.scanBarcode(barcode),
    onSuccess: (response) => {
      const product = response?.data?.data || response?.data;
      if (!product) {
        setError("Product not found for this barcode");
        setScannedProduct(null);
        setBarcodeInput("");
        return;
      }
      // нормализуем цену/остаток
      const normalized = {
        ...product,
        price:
          product.offline_price != null
            ? product.offline_price
            : product.price || 0,
        stock: product.stock ?? 0,
      };
      setScannedProduct(normalized);
      setError(null);
      // Auto-add to cart after 1 second
      setTimeout(() => {
        onProductScanned(normalized);
        setBarcodeInput("");
        setScannedProduct(null);
      }, 1000);
    },
    onError: (err) => {
      const message =
        err.response?.data?.message || "Product not found for this barcode";
      setError(message);
      setScannedProduct(null);
      // Clear input for next scan
      setBarcodeInput("");
    },
  });

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle barcode input (physical scanner simulates keyboard input)
  const handleBarcodeInput = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);

    // When user presses Enter, process the barcode
    if (e.key === "Enter" && value.trim()) {
      setError(null);
      scanMutation.mutate(value.trim());
    }
  };

  const handleManualAdd = () => {
    if (barcodeInput.trim()) {
      setError(null);
      scanMutation.mutate(barcodeInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Scan Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Scanner Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl">📱</div>
          <p className="text-gray-600 mt-2">
            Position barcode/QR code in front of scanner
          </p>
        </div>

        {/* Barcode Input */}
        <input
          ref={inputRef}
          type="text"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={handleBarcodeInput}
          placeholder="Waiting for scanner input..."
          className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 font-mono text-lg mb-4"
          autoFocus
        />

        {/* Scanned Product Preview */}
        {scannedProduct && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-semibold mb-2">
              ✓ Product Found!
            </p>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <strong>Name:</strong> {scannedProduct.name}
              </p>
              <p>
                <strong>SKU:</strong> {scannedProduct.sku || "N/A"}
              </p>
              <p>
                <strong>Price:</strong>{" "}
                {(scannedProduct.price ?? 0).toLocaleString()} UZS
              </p>
              <p>
                <strong>Stock:</strong> {scannedProduct.stock}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">Adding to cart...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-semibold">✕ Scan Failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {scanMutation.isPending && (
          <div className="text-center mb-4">
            <div className="inline-block">
              <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <p className="text-gray-600 text-sm mt-2">Processing scan...</p>
          </div>
        )}

        {/* Manual Add Button */}
        <div className="flex gap-3">
          <button
            onClick={handleManualAdd}
            disabled={!barcodeInput.trim() || scanMutation.isPending}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Product
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-2">
            Scanner Tips:
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ Physical scanner: Scan barcode/QR code normally</li>
            <li>✓ Manual entry: Type product ID, SKU, or paste barcode data</li>
            <li>✓ Press Enter or click Add Product to search</li>
            <li>✓ Product must have stock &gt; 0 to add</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
