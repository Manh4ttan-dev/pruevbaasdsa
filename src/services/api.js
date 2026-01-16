import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY || "your-secret-api-key-here";
const API_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_URL ? `${API_URL}/audit` : "/audit",
  headers: {
    "x-api-key": API_KEY,
    "ngrok-skip-browser-warning": "true",
  },
});

export const dataAuditService = {
  query: (params) => api.get("/data", { params }),
  getByCorrelation: (correlationId) =>
    api.get(`/data/correlation/${correlationId}`),
  getStatsByTable: (params) => api.get("/data/stats/by-table", { params }),
  getStatsByUser: (params) => api.get("/data/stats/by-user", { params }),
  getStatsByOperation: (params) =>
    api.get("/data/stats/by-operation", { params }),
  getStatsByEndpoint: (params) =>
    api.get("/data/stats/by-endpoint", { params }),
  getRecordTimeline: (recordIdOrKeyValues, params) => {
    // Si recordIdOrKeyValues es un objeto (keyValues), enviarlo como query params
    if (typeof recordIdOrKeyValues === "object") {
      return api.get(`/data/timeline`, {
        params: {
          ...params,
          keyValues: JSON.stringify(recordIdOrKeyValues),
        },
      });
    }
    // Si es un string (recordId), usar la ruta anterior
    return api.get(`/data/timeline/${recordIdOrKeyValues}`, { params });
  },
};

export const accessAuditService = {
  query: (params) => api.get("/access", { params }),
  getByCorrelation: (correlationId) =>
    api.get(`/access/correlation/${correlationId}`),
  getBySession: (sessionId) => api.get(`/access/session/${sessionId}`),
  getErrorStats: (params) => api.get("/access/stats/errors", { params }),
  getStatsByUser: (params) => api.get("/access/stats/by-user", { params }),
  getStatsByEndpoint: (params) =>
    api.get("/access/stats/by-endpoint", { params }),
  getSlowRequests: (params) =>
    api.get("/access/stats/slow-requests", { params }),
  getGeoStats: (params) => api.get("/access/stats/geo", { params }),
  getStatsByIp: (params) => api.get("/access/stats/by-ip", { params }),
  getEndpointTimeline: (params) =>
    api.get("/access/stats/endpoint-timeline", { params }),
};

export const retentionService = {
  getStats: () => api.get("/retention/stats"),
  applyLegalHold: (data) => api.post("/retention/legal-hold/apply", data),
  removeLegalHold: (data) => api.post("/retention/legal-hold/remove", data),
  cleanup: () => api.post("/retention/cleanup"),
};

export default api;
