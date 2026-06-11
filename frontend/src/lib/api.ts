import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; full_name?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  clerkSync: (data: { email: string; full_name?: string }) =>
    api.post("/auth/clerk-sync", data),
  getMe: () => api.get("/auth/me"),
};

export const documentsAPI = {
  upload: (file: File, collectionId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (collectionId) {
      formData.append("collectionId", collectionId);
    }
    return api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
  },
  list: () => api.get("/documents/"),
  get: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
  reprocess: (id: string) => api.post(`/documents/${id}/reprocess`),
  runAction: (id: string, action: string) => api.post(`/documents/${id}/action`, { action }),
  compare: (docAId: string, docBId: string) => api.post("/documents/compare", { docAId, docBId }),
};

export const workspacesAPI = {
  list: () => api.get("/workspaces"),
  create: (name: string) => api.post("/workspaces", { name }),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
  listCollections: (workspaceId?: string) => api.get("/workspaces/collections", { params: { workspaceId } }),
  createCollection: (name: string, workspaceId: string) => api.post("/workspaces/collections", { name, workspaceId }),
  getCollection: (id: string) => api.get(`/workspaces/collections/${id}`),
  deleteCollection: (id: string) => api.delete(`/workspaces/collections/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard"),
};

export const chatAPI = {
  query: (data: { query: string; conversation_id?: string; document_ids: string[]; collection_id?: string }) =>
    api.post("/chat/query", data),

  queryStream: async function* (data: { query: string; conversation_id?: string; document_ids: string[]; collection_id?: string }) {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const response = await fetch(`${API_BASE_URL}/chat/query/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            yield JSON.parse(line.substring(6));
          } catch {}
        }
      }
    }
  },

  listConversations: () => api.get("/chat/conversations"),
  getConversation: (id: string) => api.get(`/chat/conversations/${id}`),
  deleteConversation: (id: string) => api.delete(`/chat/conversations/${id}`),
};

export default api;
