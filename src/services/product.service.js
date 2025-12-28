import api from './api';

export const productService = {
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  addProductImage: async (productId, imageUrl, order = 0) => {
    const response = await api.post(`/products/${productId}/images`, {
      url: imageUrl,
      order,
    });
    return response.data;
  },

  deleteProductImage: async (imageId) => {
    const response = await api.delete(`/products/images/${imageId}`);
    return response.data;
  },
};

