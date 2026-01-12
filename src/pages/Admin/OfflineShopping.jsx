import React, { useEffect, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { adminService } from "../../services/admin.service";
import { posService } from "../../services/pos.service";
import { couponService } from "../../services/coupon.service";
import { useAuth } from "../../context/AuthContext";
import QRCodeScanner from "../../components/pos/QRCodeScanner";
import QRCodeGenerator from "../../components/pos/QRCodeGenerator";

const formatCurrency = (value) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (value = new Date()) =>
  new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);

const safeParse = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeProduct = (product) => {
  if (product?.data?.id) return product.data;
  return product;
};

const OfflineShopping = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [cart, setCart] = useState(() => safeParse("offlineCart", []));
  const [stockDeltas, setStockDeltas] = useState(() =>
    safeParse("offlineStockDeltas", {})
  );
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showQRGeneratorModal, setShowQRGeneratorModal] = useState(false);
  const [selectedProductForQR, setSelectedProductForQR] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);
  const [removeMethod, setRemoveMethod] = useState("deactivate");
  const [isDragOverCart, setIsDragOverCart] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    localStorage.setItem("offlineCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("offlineStockDeltas", JSON.stringify(stockDeltas));
  }, [stockDeltas]);

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorObj,
  } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await adminService.getAllProducts();
      const payload = res?.data;
      if (Array.isArray(payload)) return payload;
      if (payload?.data && Array.isArray(payload.data)) return payload.data;
      return [];
    },
    refetchOnWindowFocus: false,
  });

  const { data: couponsData } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const res = await couponService.getAllCoupons();
      return res?.data || res;
    },
    staleTime: 5 * 60 * 1000,
  });

  const couponsList = useMemo(() => {
    if (Array.isArray(couponsData)) return couponsData;
    if (couponsData?.data && Array.isArray(couponsData.data))
      return couponsData.data;
    return [];
  }, [couponsData]);

  const removeProductMutation = useMutation({
    mutationFn: (productId) =>
      posService.removeProduct(productId, removeMethod),
    onSuccess: () => {
      alert(
        removeMethod === "deactivate"
          ? "Товар деактивирован и скрыт из POS."
          : "Товар удалён из базы."
      );
      setShowRemoveModal(false);
      setProductToRemove(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error) => {
      alert(error.response?.data?.message || error.message);
    },
  });

  const getDisplayedStock = (product) => {
    const base = Number(product?.stock || 0);
    const delta = Number(stockDeltas[product?.id] || 0);
    const value = base + delta;
    return value < 0 ? 0 : value;
  };

  const getPrice = (product) =>
    product?.offline_price != null ? product.offline_price : product?.price || 0;

  const productList = Array.isArray(products) ? products : [];

  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return productList
      .filter((p) => p?.active_for_pos !== false)
      .filter(
        (product) =>
          product.name?.toLowerCase().includes(term) ||
          product.sku?.toLowerCase().includes(term)
      );
  }, [productList, searchQuery]);

  const addToCart = (rawProduct) => {
    const product = normalizeProduct(rawProduct);
    if (!product?.id) {
      alert("Не удалось определить товар по сканеру.");
      return;
    }
    const available = getDisplayedStock(product);

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const nextQty = (existing?.quantity || 0) + 1;
      if (nextQty > available) {
        alert("Недостаточно стока для добавления ещё одной позиции.");
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }

      const next = [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: getPrice(product),
          sku: product.sku,
          quantity: 1,
        },
      ];
      return next;
    });
    trackEvent("add_to_cart", {
      product_id: product.id,
      quantity: 1,
      price: getPrice(product),
      source: "offline",
      user_id: user?.id,
    });
  };

  const updateCartQuantity = (productId, newQuantity) => {
    const product = products.find((p) => p.id === productId);
    const available = product ? getDisplayedStock(product) : Infinity;
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    if (newQuantity > available) {
      alert("Количество превышает доступный сток.");
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const discountAmount = (() => {
    if (!couponInfo) return 0;
    const subtotal = cartTotal;
    if (couponInfo.discountType === "PERCENTAGE") {
      return Math.min(
        subtotal,
        Math.round((subtotal * couponInfo.discount) / 100)
      );
    }
    return Math.min(subtotal, couponInfo.discount || 0);
  })();

  const totalWithDiscount = Math.max(0, cartTotal - discountAmount);

  const printReceipt = () => {
    if (!cart.length) {
      alert("Корзина пуста — нечего печатать.");
      return;
    }

    const receipt = [
      "SADIA.LUX — оффлайн продажа",
      "---------------------------------------",
      `Дата: ${formatDateTime()}`,
      `Оператор: ${user?.email || "offline"}`,
      `Оплата: ${
        paymentMethod === "CASH"
          ? "Наличные"
          : paymentMethod === "TERMINAL"
          ? "Терминал"
          : "Перевод/онлайн"
      }`,
      "",
      "Позиции:",
      ...cart.map(
        (item) =>
          `${item.name}\nБаркод/SKU: ${item.sku || item.id || "-"}\n${item.quantity} x ${
            item.price
          } = ${(item.price || 0) * (item.quantity || 0)}`
      ),
      "---------------------------------------",
      `Сумма: ${cartTotal}`,
      discountAmount > 0
        ? `Скидка по купону ${couponInfo?.code || ""}: -${discountAmount}`
        : undefined,
      `Итого к оплате: ${totalWithDiscount}`,
      `Количество: ${itemCount}`,
    ]
      .filter(Boolean)
      .join("\n");

    const printWindow = window.open("", "", "height=600,width=420");
    printWindow.document.write(
      `<pre style="font-size:14px;line-height:1.4">${receipt}</pre>`
    );
    printWindow.document.close();
    printWindow.print();
  };

  const handleCheckout = () => {
    if (!cart.length) {
      alert("Сначала добавьте товары в корзину.");
      return;
    }

    const offlineOrders = safeParse("offlineOrders", []);
    const newOrder = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      items: cart,
      total: totalWithDiscount,
      subtotal: cartTotal,
      discount: discountAmount,
      couponCode: couponInfo?.code,
      coupon: couponInfo || undefined,
      operator: user?.email || "offline",
      paymentMethod,
      status: "PENDING_SYNC",
    };

    offlineOrders.push(newOrder);
    localStorage.setItem("offlineOrders", JSON.stringify(offlineOrders));

    setStockDeltas((prev) => {
      const next = { ...prev };
      cart.forEach((item) => {
        next[item.id] = (next[item.id] || 0) - (item.quantity || 0);
      });
      return next;
    });

    setCart([]);
    setCouponInfo(null);
    setCouponCode("");
    setCouponError("");
    trackEvent("order_completed", {
      source: "offline",
      total: totalWithDiscount,
      payment_method: paymentMethod,
      items_count: cart.length,
      cashier_id: user?.id,
    });
    alert(
      "Заказ сохранён локально. Когда интернет появится — зайдите в оффлайн-заказы и синхронизируйте."
    );
  };

  const handleProductScanned = (product) => {
    addToCart(normalizeProduct(product));
    setShowScannerModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Оффлайн продажи
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Сканируйте штрих-коды/QR, собирайте корзину и сохраняйте заказ локально
          для пробития через терминал в оффлайн магазине.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Каталог и сканер
            </h2>
            <div className="flex gap-4 flex-wrap mb-4">
              <button
                onClick={() => setShowScannerModal(true)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                + Сканировать штрих-код/QR
              </button>
              <input
                type="text"
                placeholder="Поиск по названию или SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            {productsLoading && (
              <div className="text-gray-500 dark:text-gray-400">
                Загружаем товары...
              </div>
            )}
            {productsError && (
              <div className="text-red-600">
                Не удалось загрузить товары:{" "}
                {productsErrorObj?.message || "ошибка запроса"}
              </div>
            )}

            {!productsLoading && !productsError && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify(product)
                      );
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition cursor-pointer relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          SKU: {product.sku || "—"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProductForQR(product);
                          setShowQRGeneratorModal(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                        title="Сгенерировать QR/штрих-код"
                      >
                        QR
                      </button>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {formatCurrency(getPrice(product))}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Остаток: {getDisplayedStock(product)}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={getDisplayedStock(product) <= 0}
                      className={`w-full px-4 py-2 rounded font-semibold transition ${
                        getDisplayedStock(product) > 0
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {getDisplayedStock(product) > 0
                        ? "В корзину"
                        : "Нет в наличии"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Админ-блок управления товарами убран по запросу */}
        </div>

        <div className="lg:col-span-1">
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6 ${
              isDragOverCart ? "ring-4 ring-blue-300" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverCart(true);
            }}
            onDragLeave={() => setIsDragOverCart(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverCart(false);
              try {
                const data = e.dataTransfer.getData("application/json");
                if (data) {
                  const prod = JSON.parse(data);
                  addToCart(prod);
                }
              } catch (err) {
                console.error("drop parse error", err);
              }
            }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Корзина ({itemCount})
            </h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Добавьте товар из каталога или сканером
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCurrency(item.price)} за шт.
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-bold ml-2"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          –
                        </button>
                        <span className="flex-1 text-center font-semibold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Способ оплаты:
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="CASH"
                        checked={paymentMethod === "CASH"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>Наличные</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="TERMINAL"
                        checked={paymentMethod === "TERMINAL"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>Терминал</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="TRANSFER"
                        checked={paymentMethod === "TRANSFER"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>Перевод/онлайн</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Купон:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError("");
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        placeholder="Введите промокод"
                      />
                      <button
                        onClick={() => {
                          const code = couponCode.trim();
                          if (!code) {
                            setCouponError("Введите код купона");
                            return;
                          }
                          const now = new Date();
                          const coupon = couponsList.find(
                            (c) => c.code?.toUpperCase() === code.toUpperCase()
                          );
                          if (!coupon) {
                            setCouponError("Купон не найден");
                            setCouponInfo(null);
                            return;
                          }
                          const isOneTime = coupon.oneTime || coupon.oneTimeUse;
                          const expiresAt = coupon.expiresAt || coupon.validUntil;
                          if (isOneTime && coupon.used) {
                            setCouponError("Купон уже использован");
                            setCouponInfo(null);
                            return;
                          }
                          if (expiresAt && new Date(expiresAt) < now) {
                            setCouponError("Купон истёк");
                            setCouponInfo(null);
                            return;
                          }
                          setCouponInfo(coupon);
                          setCouponError("");
                          alert("Купон применён");
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Применить
                      </button>
                      {couponInfo && (
                        <button
                          onClick={() => {
                            setCouponInfo(null);
                            setCouponCode("");
                            setCouponError("");
                          }}
                          className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                          Сброс
                        </button>
                      )}
                    </div>
                    {couponInfo && (
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Купон {couponInfo.code}:{" "}
                        {couponInfo.discountType === "PERCENTAGE"
                          ? `${couponInfo.discount}%`
                          : `${couponInfo.discount} UZS`}
                      </p>
                    )}
                    {couponError && (
                      <p className="text-sm text-red-600">{couponError}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      Итого:
                    </span>
                    <div className="text-right">
                      {discountAmount > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Скидка: -{formatCurrency(discountAmount)}
                        </div>
                      )}
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(totalWithDiscount)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleCheckout}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                    >
                      Сохранить оффлайн-заказ
                    </button>
                    <button
                      onClick={printReceipt}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                    >
                      Печать чека
                    </button>
                    <button
                      onClick={() => setCart([])}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition"
                    >
                      Очистить корзину
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showScannerModal && (
        <QRCodeScanner
          onProductScanned={handleProductScanned}
          onClose={() => setShowScannerModal(false)}
        />
      )}

      {showQRGeneratorModal && selectedProductForQR && (
        <QRCodeGenerator
          productId={selectedProductForQR.id}
          productName={selectedProductForQR.name}
          onClose={() => setShowQRGeneratorModal(false)}
        />
      )}

      {showRemoveModal && productToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Удалить/скрыть товар: {productToRemove.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Выберите вариант удаления:
            </p>
            <div className="space-y-3 mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="deactivate"
                  checked={removeMethod === "deactivate"}
                  onChange={(e) => setRemoveMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Деактивировать (останется в базе, будет скрыт из POS)
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="delete"
                  checked={removeMethod === "delete"}
                  onChange={(e) => setRemoveMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Удалить полностью (без возможности восстановления)
                </span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Отмена
              </button>
              <button
                onClick={() => removeProductMutation.mutate(productToRemove.id)}
                disabled={removeProductMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {removeProductMutation.isPending
                  ? "Удаляем..."
                  : "Подтвердить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineShopping;
