export const environment = {
  production: true,
  apiUrl: '/api/v1', // Production API URL with v1 path (relative, will be resolved by the server)
  apiTimeoutMs: 15000, // 15 seconds timeout for API calls
  maxRetries: 2, // Maximum number of retries for failed API calls
  mockStreamingEnabled: true, // Enable mock streaming when real streams unavailable
  features: {
    enableAdvancedSearch: true,
    enableLiveNotifications: true,
    enableOfflineMode: false
  },
  logging: {
    logApiErrors: true,
    logLevelProduction: 'info', // Only log errors in production
    sendErrorsToServer: true
  }
};

