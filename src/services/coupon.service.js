import api from './api';

export const couponService = {
  getAllCoupons: async () => {
    const response = await api.get('/admin/coupons');
    return response.data;
  },

  getCouponById: async (id) => {
    const response = await api.get(`/admin/coupons/${id}`);
    return response.data;
  },

  createCoupon: async (data) => {
    const response = await api.post('/admin/coupons', data);
    return response.data;
  },

  updateCoupon: async (id, data) => {
    const response = await api.put(`/admin/coupons/${id}`, data);
    return response.data;
  },

  deleteCoupon: async (id) => {
    const response = await api.delete(`/admin/coupons/${id}`);
    return response.data;
  },

  validateCoupon: async (code) => {
    const response = await api.post('/coupons/validate', { code });
    return response.data;
  },
};

