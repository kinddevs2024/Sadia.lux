import api from './api';

export const exchangeService = {
  getAllExchanges: async () => {
    const response = await api.get('/admin/exchanges');
    return response.data;
  },

  getExchangeById: async (id) => {
    const response = await api.get(`/exchanges/${id}`);
    return response.data;
  },

  createExchange: async (data) => {
    const response = await api.post('/exchanges', data);
    return response.data;
  },

  updateExchangeStatus: async (id, status) => {
    const response = await api.put(`/admin/exchanges/${id}/status`, { status });
    return response.data;
  },

  deleteExchange: async (id) => {
    const response = await api.delete(`/admin/exchanges/${id}`);
    return response.data;
  },
};

