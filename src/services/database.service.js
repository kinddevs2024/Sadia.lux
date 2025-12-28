import api from "./api";

export const databaseService = {
  getCollectionsOverview: async () => {
    const response = await api.get("/admin/database");
    return response.data;
  },

  getCollection: async (collection, limit) => {
    const params = new URLSearchParams();
    params.append("collection", collection);
    if (limit) params.append("limit", limit);

    const response = await api.get(`/admin/database?${params.toString()}`);
    return response.data;
  },

  getItem: async (collection, id) => {
    const params = new URLSearchParams();
    params.append("collection", collection);
    params.append("itemId", id);

    const response = await api.get(`/admin/database?${params.toString()}`);
    return response.data;
  },

  exportFullDatabase: async () => {
    const response = await api.post("/admin/database", { action: "export" });
    return response.data;
  },
};
