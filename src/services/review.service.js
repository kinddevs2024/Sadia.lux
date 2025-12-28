import api from './api';

export const reviewService = {
  getReviews: async (approvedOnly = true, productId = null) => {
    const params = new URLSearchParams();
    if (approvedOnly) {
      params.append('approved', 'true');
    }
    if (productId) params.append('productId', productId);
    const response = await api.get(`/reviews?${params.toString()}`);
    return response.data;
  },

  getAllReviews: async () => {
    // Для админа - получаем все отзывы через admin API
    const response = await api.get('/admin/reviews');
    return response.data;
  },

  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  approveReview: async (id) => {
    const response = await api.put(`/reviews/${id}/approve`);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

