import axios from 'axios'

const API_KEY = import.meta.env.VITE_API_KEY || 'your-secret-api-key-here'
const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL ? `${API_URL}/audit/analytics` : '/audit/analytics',
  headers: {
    'x-api-key': API_KEY,
  },
})

/**
 * Analytics Event Tracking Service
 */
export const eventTrackingService = {
  // Track a single event
  trackEvent: (event) => api.post('/events', event),

  // Track multiple events in batch
  trackBatch: (events) => api.post('/events/batch', { events }),

  // Query events with filters
  queryEvents: (params) => api.get('/events', { params }),
}

/**
 * Filter Options Service
 */
export const filterService = {
  // Get available filter options (systems, roles, platforms, countries)
  getFilterOptions: () => api.get('/filters'),
}

/**
 * Analytics Dashboard Service
 */
export const dashboardService = {
  // Overview Dashboard
  getOverview: (params) => api.get('/dashboard/overview', { params }),

  // Session Analytics
  getSessions: (params) => api.get('/dashboard/sessions', { params }),

  // Authentication Analytics
  getAuth: (params) => api.get('/dashboard/auth', { params }),

  // Navigation Analytics
  getNavigation: (params) => api.get('/dashboard/navigation', { params }),

  // Procedure/Funnel Analytics
  getProcedures: (params) => api.get('/dashboard/procedures', { params }),

  // Academic Analytics
  getAcademic: (params) => api.get('/dashboard/academic', { params }),

  // Performance & Errors
  getPerformance: (params) => api.get('/dashboard/performance', { params }),

  // Geographic Analytics
  getGeo: (params) => api.get('/dashboard/geo', { params }),

  // Privacy & Consent
  getPrivacy: (params) => api.get('/dashboard/privacy', { params }),

  // Notifications
  getNotifications: (params) => api.get('/dashboard/notifications', { params }),

  // User Behavior (Google Analytics style)
  getUserBehavior: (params) => api.get('/dashboard/user-behavior', { params }),
}

/**
 * User Analytics Service
 */
export const userAnalyticsService = {
  // Get DAU/WAU/MAU
  getActiveUsers: (params) => api.get('/users/active', { params }),

  // Get user activity timeline
  getUserTimeline: (userId, params) => api.get(`/users/${userId}/timeline`, { params }),
}

/**
 * Funnel Analysis Service
 */
export const funnelService = {
  // Custom funnel analysis
  analyzeFunnel: (steps, params) =>
    api.get('/funnel', { params: { steps: steps.join(','), ...params } }),
}

/**
 * Time Series Service
 */
export const timeSeriesService = {
  // Get time series data for charts
  getTimeSeries: (params) => api.get('/timeseries', { params }),
}

/**
 * Privacy Compliance Service
 */
export const privacyService = {
  // Export user data (GDPR/Ley 29733 compliance)
  exportUserData: (userId) => api.post(`/privacy/export/${userId}`),

  // Delete user data
  deleteUserData: (userId) => api.delete(`/privacy/delete/${userId}`),
}

// Combined analytics service for convenience
export const analyticsService = {
  ...eventTrackingService,
  ...dashboardService,
  ...userAnalyticsService,
  ...funnelService,
  ...timeSeriesService,
  ...privacyService,
}

export default api
