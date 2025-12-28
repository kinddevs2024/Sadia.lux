import api from './api';

export const posService = {
  createOrder: async (orderData) => {
    const response = await api.post('/pos/order', orderData);
    return response.data;
  },

  processPayment: async (orderId) => {
    const response = await api.post('/pos/payment', { orderId });
    return response.data;
  },
};

