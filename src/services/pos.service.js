/**
 * POS Service Layer
 * API calls for Point of Sale functionality
 */

import api from "./api";

export const posService = {
  // ===== Orders =====
  /**
   * Get list of POS orders with optional filters
   */
  getOrders: (filters = {}) => api.get("/pos/orders", { params: filters }),

  /**
   * Get single POS order by ID
   */
  getOrder: (orderId) => api.get(`/pos/orders/${orderId}`),

  /**
   * Create a new POS order
   */
  createOrder: (orderData) => api.post("/pos/orders", orderData),

  // ===== Receipts =====
  /**
   * Get formatted receipt data for printing
   */
  getReceiptData: (orderId) => api.get(`/pos/receipts/${orderId}`),

  // ===== Products =====
  /**
   * Get products available for POS
   * Only returns active_for_pos=true with stock > 0
   */
  getProducts: (filters = {}) => api.get("/pos/products", { params: filters }),

  /**
   * Search products by name or SKU
   */
  searchProducts: (search) => api.get("/pos/products", { params: { search } }),

  // ===== Payments =====
  /**
   * Confirm terminal payment for a pending order
   */
  confirmPayment: (payload) => api.post("/pos/payments/confirm", payload),

  /**
   * Confirm payment by order ID
   */
  confirmPaymentByOrderId: (orderId) =>
    api.post("/pos/payments/confirm", { orderId }),

  /**
   * Confirm payment by transaction ID
   */
  confirmPaymentByTransactionId: (transactionId) =>
    api.post("/pos/payments/confirm", { transactionId }),

  // ===== QR Codes & Barcodes =====
  /**
   * Generate QR code for a product
   * Used for printing product barcodes
   */
  generateQRCode: (productId, format = "json") =>
    api.get("/pos/qrcode", {
      params: { productId, format },
      responseType: format === "image" ? "arraybuffer" : "json",
    }),

  /**
   * Scan barcode/QR code and get product details
   * Works with product IDs, SKUs, or QR code data
   */
  scanBarcode: (barcode) =>
    api.post("/pos/qrcode", { barcode, type: "auto" }),

  /**
   * Remove product from POS (deactivate or delete)
   * Admin only
   */
  removeProduct: (productId, method = "deactivate") =>
    api.delete(`/pos/products/${productId}/remove`, { params: { method } }),

  /**
   * Batch remove products via scanner
   * Useful for bulk deactivation
   */
  batchRemoveProducts: (productIds, method = "deactivate") =>
    api.post("/pos/products/batch-remove", { productIds, method }),

  // ===== Cashier Stats =====
  /**
   * Get cashier statistics (Admin/SuperAdmin only)
   */
  getCashierStats: (filters = {}) => api.get("/admin/cashiers/stats", { params: filters }),
};

export default posService;
