import api from './api';

export const supportService = {
  getAllMessages: async () => {
    const response = await api.get('/admin/support');
    return response.data;
  },

  getMessageById: async (id) => {
    const response = await api.get(`/support/${id}`);
    return response.data;
  },

  createSupportMessage: async (supportData) => {
    const response = await api.post('/support', supportData);
    return response.data;
  },

  markAsResponded: async (id) => {
    const response = await api.put('/admin/support', { id, responded: true });
    return response.data;
  },
};

