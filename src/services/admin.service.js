import api from './api';

export const adminService = {
  getAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.source) params.append("source", filters.source);
    if (filters.paymentMethod)
      params.append("paymentMethod", filters.paymentMethod);

    const response = await api.get(`/admin/analytics?${params.toString()}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/analytics/dashboard');
    return response.data;
  },

  getRecentOrders: async (limit = 10) => {
    const response = await api.get(`/admin/analytics/recent-orders?limit=${limit}`);
    return response.data;
  },

  getAllProducts: () => api.get('/admin/products'),

  getProductAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.source) params.append("source", filters.source);

    const response = await api.get(`/admin/analytics/products?${params.toString()}`);
    return response.data;
  },

  getCashierStats: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.cashierId) params.append("cashierId", filters.cashierId);

    const response = await api.get(`/admin/cashiers/stats?${params.toString()}`);
    return response.data;
  },
};
