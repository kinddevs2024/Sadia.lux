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
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const itemsPerPage = 20;

  // Fetch POS products (only active_for_pos=true and stock > 0)
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ["pos-products", searchQuery],
    queryFn: () => posService.getProducts({ search: searchQuery, limit: 100 }),
    onError: (err) => {
      console.error("Failed to load products:", err);
      setError("Failed to load products");
    },
  });

  // Fetch inventory for selected product
  const { data: inventoryData } = useQuery({
    queryKey: ["pos-inventory", selectedProduct?.id],
    queryFn: () => posService.getInventory({ productId: selectedProduct?.id }),
    enabled: !!selectedProduct?.id && showSizeModal,
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => posService.createOrder(orderData),
    onSuccess: (response) => {
      // Safely extract order from API response
      // API returns: { success: true, data: { order: {...}, items: [...] } }
      // axios unwraps it to: { data: { success: true, data: { order: {...}, items: [...] } } }
      const order = response?.data?.data?.order || response?.data?.order;
      const items = response?.data?.data?.items || response?.data?.items || [];

      if (!order || !order.id) {
        console.error('Invalid order response:', response);
        setError('Ошибка при создании заказа: неверный ответ сервера');
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === "CASH") {
        // Cash payment - order is immediately paid
        navigate(`/pos/receipt/${order.id}`, {
          state: { order, items },
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
        total: order.total || 0,
        payment_method: paymentMethod,
        items_count: items.length || cart.length,
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

  // Extract products array from API response
  // API returns: { success: true, data: { data: [...], meta: {...} } }
  // api.get() returns axios response object: { data: { success: true, data: { data: [...], meta: {...} } }, status, ... }
  // So productsData = { data: { success: true, data: { data: [...], meta: {...} } } }
  let products = [];
  
  if (productsError) {
    console.error("Products query error:", productsError);
    products = [];
  } else if (productsData?.data) {
    // Primary extraction: productsData.data.data.data (axios response -> body -> data -> data array)
    if (productsData.data.data?.data && Array.isArray(productsData.data.data.data)) {
      products = productsData.data.data.data;
    }
    // Fallback: check if productsData.data.data is directly an array
    else if (productsData.data.data && Array.isArray(productsData.data.data)) {
      products = productsData.data.data;
    }
    // Fallback: check if productsData.data is directly an array
    else if (Array.isArray(productsData.data)) {
      products = productsData.data;
    }
    // If still empty, log for debugging
    else {
      console.warn('Could not extract products. Structure:', {
        hasData: !!productsData.data,
        hasDataData: !!productsData.data.data,
        hasDataDataData: !!productsData.data.data?.data,
        isDataArray: Array.isArray(productsData.data),
        isDataDataArray: Array.isArray(productsData.data.data),
        isDataDataDataArray: Array.isArray(productsData.data.data?.data),
        fullData: productsData
      });
      products = [];
    }
  }
  
  // Ensure products is always an array
  if (!Array.isArray(products)) {
    products = [];
  }

  // Extract inventory array from API response
  // API returns: { success: true, data: { data: [...], meta: {...} } }
  // api.get() returns axios response object: { data: { success: true, data: { data: [...], meta: {...} } }, status, ... }
  let inventory = [];
  if (inventoryData?.data) {
    // Primary extraction: inventoryData.data.data.data (axios response -> body -> data -> data array)
    if (inventoryData.data.data?.data && Array.isArray(inventoryData.data.data.data)) {
      inventory = inventoryData.data.data.data;
    }
    // Fallback: check if inventoryData.data.data is directly an array
    else if (inventoryData.data.data && Array.isArray(inventoryData.data.data)) {
      inventory = inventoryData.data.data;
    }
    // Fallback: check if inventoryData.data is directly an array
    else if (Array.isArray(inventoryData.data)) {
      inventory = inventoryData.data;
    }
  }
  
  // Ensure inventory is always an array
  if (!Array.isArray(inventory)) {
    inventory = [];
  }

  const getPrice = (product) =>
    product?.offline_price != null ? product.offline_price : product.price;

  const openSizeModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setSelectedQuantity(1);
    setShowSizeModal(true);
  };

  const handleAddToCartWithSize = () => {
    if (!selectedProduct || !selectedSize) {
      setError("Пожалуйста, выберите размер");
      return;
    }

    const inventoryItem = (inventory || []).find(
      (inv) => inv.size === selectedSize && inv.quantity > 0
    );

    if (!inventoryItem || inventoryItem.quantity < selectedQuantity) {
      setError(`Недостаточно товара размера ${selectedSize}`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === selectedProduct.id && item.size === selectedSize
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + selectedQuantity;
        if (newQuantity > inventoryItem.quantity) {
          setError(`Можно добавить только ${inventoryItem.quantity - existingItem.quantity} шт. размера ${selectedSize}`);
          return prevCart;
        }

        return prevCart.map((item) =>
          item.productId === selectedProduct.id && item.size === selectedSize
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [
        ...prevCart,
        {
          productId: selectedProduct.id,
          product: selectedProduct,
          size: selectedSize,
          quantity: selectedQuantity,
          price: getPrice(selectedProduct),
        },
      ];
    });

    setError(null);
    setShowSizeModal(false);
    setSelectedProduct(null);
    setSelectedSize("");
    setSelectedQuantity(1);

    trackEvent("add_to_cart", {
      product_id: selectedProduct.id,
      size: selectedSize,
      quantity: selectedQuantity,
      price: getPrice(selectedProduct),
      source: "pos",
      user_id: user?.id,
    });
  };

  const addToCart = (product) => {
    // Open size selection modal
    openSizeModal(product);
  };

  const removeFromCart = (productId, size) => {
    setCart((prevCart) =>
      prevCart.filter((item) => 
        !(item.productId === productId && (!size || item.size === size))
      )
    );
  };

  const updateQuantity = async (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    // Fetch inventory for this product if not already loaded
    try {
      const invResponse = await posService.getInventory({ productId });
      // Extract inventory from axios response: invResponse.data.data.data or invResponse.data.data or invResponse.data
      const productInventory = invResponse?.data?.data?.data || invResponse?.data?.data || invResponse?.data || [];
      const inventoryItem = productInventory.find(
        (inv) => inv.size === size
      );

      if (inventoryItem && quantity > inventoryItem.quantity) {
        setError(`Доступно только ${inventoryItem.quantity} шт. размера ${size}`);
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity }
            : item
        )
      );

      setError(null);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Ошибка при проверке остатков");
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

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
      size: item.size,
    }));

    createOrderMutation.mutate({
      items: orderItems,
      paymentMethod,
      cashierId: user?.id,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white p-3 sm:p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-lg sm:text-2xl font-bold">POS - Cashier Mode</h1>
        <div className="text-xs sm:text-sm">
          Cashier:{" "}
          <span className="font-semibold">
            {user?.firstName || user?.email}
          </span>
        </div>
      </div>

      {/* Search Bar + Scanner Button */}
      <div className="bg-white p-3 sm:p-4 border-b space-y-2 sm:space-y-3">
        <div className="flex gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="Поиск товара..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
          <button
            onClick={() => setShowScannerModal(true)}
            className="px-3 sm:px-6 py-2 sm:py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
            title="Scan barcode/QR code to add product"
          >
            📱 <span className="hidden sm:inline">Scan</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 m-2 sm:m-4 rounded text-sm sm:text-base">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold text-lg"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden gap-2 sm:gap-4 p-2 sm:p-4 relative">
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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 p-2 sm:p-4">
                {Array.isArray(paginatedProducts) && paginatedProducts.map((product) => (
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
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-2 bg-primary text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-base"
                    title="Generate QR code for this product"
                  >
                    🔲
                  </button>

                  {/* Click to add to cart */}
                  <div
                    onClick={() => addToCart(product)}
                    className="cursor-pointer"
                  >
                    <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-blue-50 rounded mb-1 sm:mb-2 flex items-center justify-center text-xs text-gray-400">
                      <span className="text-xs sm:text-sm">{product.name.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <h3
                      className="font-semibold text-xs sm:text-sm mb-1 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    {product.sku && (
                      <p className="text-xs text-gray-500 mb-1 truncate">
                        SKU: {product.sku}
                      </p>
                    )}
                    <p className="text-primary font-bold text-xs sm:text-sm mb-1 sm:mb-2">
                      {getPrice(product).toLocaleString()} UZS
                    </p>
                    <p
                      className={`text-xs ${
                        product.stock > 5 ? "text-green-600" : "text-orange-600"
                      }`}
                    >
                      Остаток: {product.stock}
                    </p>
                  </div>
                </div>
              ))}
              </div>
              
              {/* Pagination */}
              {products.length > itemsPerPage && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-2 sm:px-4 py-3 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Назад
                  </button>
                  <span className="text-sm text-gray-700">
                    Страница {currentPage} из {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Вперед →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Cart Button */}
        {cart.length > 0 && (
          <button
            onClick={() => setShowCartMobile(true)}
            className="lg:hidden fixed bottom-4 right-4 bg-primary text-white rounded-full p-4 shadow-lg z-40 flex items-center gap-2"
          >
            <span className="bg-red-500 rounded-full px-2 py-1 text-xs font-bold">
              {cart.length}
            </span>
            <span className="font-semibold">Корзина</span>
            <span className="font-bold">{getCartTotal().toLocaleString()} UZS</span>
          </button>
        )}

        {/* Desktop Right Sidebar - Cart */}
        <div className="hidden lg:flex w-96 bg-white rounded-lg border border-gray-200 flex flex-col shadow-lg">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
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
                  key={`${item.productId}-${item.size || 'no-size'}`}
                  className="bg-gray-50 rounded p-3 border border-gray-200 hover:border-primary"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {item.product.name}
                      </p>
                      {item.size && (
                        <p className="text-xs text-primary font-medium">
                          Размер: {item.size}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {item.price.toLocaleString()} UZS each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId, item.size)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity - 1)
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
                          updateQuantity(item.productId, item.size, item.quantity + 1)
                        }
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-primary">
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
              <span className="text-primary">
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
              className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cart Modal */}
      {showCartMobile && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-lg flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Корзина</h2>
              <button
                onClick={() => setShowCartMobile(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {cart.length === 0 ? (
                <div className="text-gray-500 text-center py-12">
                  <p className="text-lg">Корзина пуста</p>
                  <p className="text-sm mt-2">Нажмите на товары, чтобы добавить</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.size || 'no-size'}`}
                    className="bg-gray-50 rounded p-3 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {item.product.name}
                        </p>
                        {item.size && (
                          <p className="text-xs text-primary font-medium">
                            Размер: {item.size}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {item.price.toLocaleString()} UZS each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity - 1)
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
                            updateQuantity(item.productId, item.size, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold text-primary">
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
                <span className="text-primary">
                  {getCartTotal().toLocaleString()} UZS
                </span>
              </div>
              <button
                onClick={() => {
                  if (cart.length === 0) {
                    setError("Cart is empty");
                    return;
                  }
                  setShowCartMobile(false);
                  setShowCheckoutModal(true);
                }}
                disabled={cart.length === 0 || isProcessing}
                className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? "Processing..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Select Payment Method</h3>

            <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
              <p className="font-semibold mb-2">Order Total:</p>
              <p className="text-2xl font-bold text-primary">
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
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
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
          product={selectedProductForQR}
          onClose={() => {
            setShowQRGeneratorModal(false);
            setSelectedProductForQR(null);
          }}
        />
      )}

      {/* Size Selection Modal */}
      {showSizeModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">
              Выберите размер: {selectedProduct.name}
            </h2>

            {(!inventory || inventory.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p>Нет доступных размеров для этого товара</p>
                <button
                  onClick={() => {
                    setShowSizeModal(false);
                    setSelectedProduct(null);
                  }}
                  className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Размер:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(inventory || [])
                      .filter((inv) => inv.quantity > 0)
                      .map((inv) => (
                        <button
                          key={inv.size}
                          onClick={() => {
                            setSelectedSize(inv.size);
                            setSelectedQuantity(1);
                          }}
                          className={`px-4 py-2 border-2 rounded font-semibold transition-colors ${
                            selectedSize === inv.size
                              ? "border-primary bg-primary-light text-primary-dark"
                              : "border-gray-300 hover:border-primary"
                          }`}
                        >
                          {inv.size}
                          <div className="text-xs text-gray-500 mt-1">
                            ({inv.quantity} шт.)
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {selectedSize && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Количество:
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                        }
                        className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded font-bold"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={
                          (inventory || []).find((inv) => inv.size === selectedSize)
                            ?.quantity || 1
                        }
                        value={selectedQuantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const maxQty =
                            (inventory || []).find((inv) => inv.size === selectedSize)
                              ?.quantity || 1;
                          setSelectedQuantity(Math.min(maxQty, Math.max(1, value)));
                        }}
                        className="w-20 px-3 py-2 border rounded text-center"
                      />
                      <button
                        onClick={() => {
                          const maxQty =
                            (inventory || []).find((inv) => inv.size === selectedSize)
                              ?.quantity || 1;
                          setSelectedQuantity(
                            Math.min(maxQty, selectedQuantity + 1)
                          );
                        }}
                        className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded font-bold"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-500">
                        (макс:{" "}
                        {(inventory || []).find((inv) => inv.size === selectedSize)
                          ?.quantity || 0}
                        )
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSizeModal(false);
                      setSelectedProduct(null);
                      setSelectedSize("");
                      setSelectedQuantity(1);
                    }}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleAddToCartWithSize}
                    disabled={!selectedSize}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Добавить в корзину
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Analytics />
    </div>
  );
};

export default POSMain;
