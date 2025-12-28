import api from './api';

export const newsletterService = {
  subscribe: async (email) => {
    const response = await api.post('/newsletter/subscribe', { email });
    return response.data;
  },

  getSubscribers: async () => {
    const response = await api.get('/admin/newsletter/subscribers');
    return response.data;
  },

  sendNewsletter: async (subject, message) => {
    const response = await api.post('/admin/newsletter/send', { subject, message });
    return response.data;
  },
};

