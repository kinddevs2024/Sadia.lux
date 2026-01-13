import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { posService } from "../../services/pos.service";
import QRCodeScanner from "../../components/pos/QRCodeScanner";
import QRCodeGenerator from "../../components/pos/QRCodeGenerator";
import { Analytics } from "@vercel/analytics/react";
import { trackEvent } from "../../utils/analytics";

const POSMain = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showQRGeneratorModal, setShowQRGeneratorModal] = useState(false);
  const [selectedProductForQR, setSelectedProductForQR] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch POS products (only active_for_pos=true and stock > 0)
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ["pos-products", searchQuery],
    queryFn: () => posService.getProducts({ search: searchQuery, limit: 100 }),
    onError: (err) => {
      console.error("Failed to load products:", err);
      setError("Failed to load products");
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => posService.createOrder(orderData),
    onSuccess: (response) => {
      const order = response.data.order;

      if (paymentMethod === "CASH") {
        // Cash payment - order is immediately paid
        navigate(`/pos/receipt/${order.id}`, {
          state: { order, items: response.data.items },
        });
      } else if (paymentMethod === "TERMINAL") {
        // Terminal payment - needs confirmation
        navigate(`/pos/payment/${order.id}`, {
          state: { order, transactionId: order.terminal_transaction_id },
        });
      }

      setCart([]);
      setShowCheckoutModal(false);
      setIsProcessing(false);
      trackEvent("order_completed", {
        source: "pos",
        total: order.total,
        payment_method: paymentMethod,
        items_count: response.data.items?.length || cart.length,
        cashier_id: user?.id,
      });
    },
    onError: (err) => {
      const message =
        err.response?.data?.error || err.message || "Order creation failed";
      setError(message);
      setIsProcessing(false);
      console.error("Order creation error:", err);
    },
  });

  // Safely extract products array from API response
  // API returns: { success: true, data: { data: [...], meta: {...} } }
  // axios unwraps it to: { data: { success: true, data: [...], meta: {...} } }
  let products = [];
  
  if (productsError) {
    console.error("Products query error:", productsError);
    products = [];
  } else if (productsData?.data) {
    // Check if response has nested data structure
    if (productsData.data.data && Array.isArray(productsData.data.data)) {
      products = productsData.data.data;
    } 
    // Check if data is directly an array
    else if (Array.isArray(productsData.data)) {
      products = productsData.data;
    }
    // Log for debugging if structure is unexpected
    else if (productsData.data && !Array.isArray(productsData.data)) {
      console.warn('Unexpected products data structure:', productsData.data);
      products = [];
    }
  }
  
  // Ensure products is always an array
  if (!Array.isArray(products)) {
    console.warn('Products is not an array, defaulting to empty array. Data:', productsData);
    products = [];
  }

  const getPrice = (product) =>
    product?.offline_price != null ? product.offline_price : product.price;

  const addToCart = (product) => {
    // Check stock
    const stock = product.stock || 0;
    if (stock <= 0) {
      setError(`Product "${product.name}" is out of stock`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        // Check if adding would exceed stock
        if (existingItem.quantity + 1 > stock) {
          setError(`Only ${stock} available for ${product.name}`);
          return prevCart;
        }

        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const next = [
        ...prevCart,
        {
          productId: product.id,
          product,
          quantity: 1,
          price: getPrice(product),
        },
      ];
      return next;
    });

    setError(null);
    trackEvent("add_to_cart", {
      product_id: product.id,
      quantity: 1,
      price: getPrice(product),
      source: "pos",
      user_id: user?.id,
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.productId !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    const product = products.find((p) => p.id === productId);
    const stock = product?.stock || 0;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (quantity > stock) {
      setError(`Only ${stock} available for ${product.name}`);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );

    setError(null);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }

    setError(null);
    setIsProcessing(true);

    const orderItems = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    createOrderMutation.mutate({
      items: orderItems,
      paymentMethod,
      cashierId: user?.id,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">POS - Cashier Mode</h1>
        <div className="text-sm">
          Cashier:{" "}
          <span className="font-semibold">
            {user?.firstName || user?.email}
          </span>
        </div>
      </div>

      {/* Search Bar + Scanner Button */}
      <div className="bg-white p-4 border-b space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={() => setShowScannerModal(true)}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 flex items-center gap-2"
            title="Scan barcode/QR code to add product"
          >
            📱 Scan
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold text-lg"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Center - Products Grid */}
        <div className="flex-1 bg-white rounded-lg overflow-y-auto">
          {productsLoading ? (
            <div className="text-center py-12 text-gray-500">
              Loading products...
            </div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? "No products found" : "No products available"}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
              {Array.isArray(products) && products.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-lg hover:bg-gray-100 transition-all border border-gray-200 relative group"
                >
                  {/* QR Code Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProductForQR(product);
                      setShowQRGeneratorModal(true);
                    }}
                    className="absolute top-2 right-2 p-2 bg-blue-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Generate QR code for this product"
                  >
                    🔲
                  </button>

                  {/* Click to add to cart */}
                  <div
                    onClick={() => addToCart(product)}
                    className="cursor-pointer"
                  >
                    <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-blue-50 rounded mb-2 flex items-center justify-center text-xs text-gray-400">
                      <span>{product.name.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <h3
                      className="font-semibold text-sm mb-1 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    {product.sku && (
                      <p className="text-xs text-gray-500 mb-1">
                        SKU: {product.sku}
                      </p>
                    )}
                    <p className="text-blue-600 font-bold text-sm mb-2">
                      {getPrice(product).toLocaleString()} UZS
                    </p>
                    <p
                      className={`text-xs ${
                        product.stock > 5 ? "text-green-600" : "text-orange-600"
                      }`}
                    >
                      Stock: {product.stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Cart */}
        <div className="w-96 bg-white rounded-lg border border-gray-200 flex flex-col shadow-lg">
          <div className="p-4 border-b bg-blue-50">
            <h2 className="text-xl font-bold text-blue-900">Shopping Cart</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <div className="text-gray-500 text-center py-12">
                <p className="text-lg">Cart is empty</p>
                <p className="text-sm mt-2">Click products to add items</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="bg-gray-50 rounded p-3 border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.price.toLocaleString()} UZS each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-blue-600">
                      {(item.price * item.quantity).toLocaleString()} UZS
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold">
                {getCartTotal().toLocaleString()} UZS
              </span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-700">Tax:</span>
              <span className="font-semibold">0 UZS</span>
            </div>
            <div className="flex justify-between text-lg font-bold mb-4 pb-4 border-t-2">
              <span>Total:</span>
              <span className="text-blue-600">
                {getCartTotal().toLocaleString()} UZS
              </span>
            </div>
            <button
              onClick={() => {
                if (cart.length === 0) {
                  setError("Cart is empty");
                  return;
                }
                setShowCheckoutModal(true);
              }}
              disabled={cart.length === 0 || isProcessing}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Select Payment Method</h3>

            <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
              <p className="font-semibold mb-2">Order Total:</p>
              <p className="text-2xl font-bold text-blue-600">
                {getCartTotal().toLocaleString()} UZS
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <label
                className="flex items-center p-3 border-2 rounded cursor-pointer transition-colors"
                style={{
                  borderColor: paymentMethod === "CASH" ? "#3B82F6" : "#D1D5DB",
                  backgroundColor:
                    paymentMethod === "CASH" ? "#EFF6FF" : "white",
                }}
              >
                <input
                  type="radio"
                  value="CASH"
                  checked={paymentMethod === "CASH"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="font-semibold">💵 Cash Payment (Instant)</span>
              </label>

              <label
                className="flex items-center p-3 border-2 rounded cursor-pointer transition-colors"
                style={{
                  borderColor:
                    paymentMethod === "TERMINAL" ? "#3B82F6" : "#D1D5DB",
                  backgroundColor:
                    paymentMethod === "TERMINAL" ? "#EFF6FF" : "white",
                }}
              >
                <input
                  type="radio"
                  value="TERMINAL"
                  checked={paymentMethod === "TERMINAL"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="font-semibold">
                  🏦 Terminal Payment (Pending Confirmation)
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckoutModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? "Processing..."
                  : `Pay ${paymentMethod === "CASH" ? "Cash" : "Terminal"}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      {showScannerModal && (
        <QRCodeScanner
          onProductScanned={(product) => {
            addToCart(product);
            setShowScannerModal(false);
          }}
          onClose={() => setShowScannerModal(false)}
        />
      )}

      {/* QR Code Generator Modal */}
      {showQRGeneratorModal && selectedProductForQR && (
        <QRCodeGenerator
          productId={selectedProductForQR.id}
          productName={selectedProductForQR.name}
          onClose={() => {
            setShowQRGeneratorModal(false);
            setSelectedProductForQR(null);
          }}
        />
      )}

      <Analytics />
    </div>
  );
};

export default POSMain;
