export const environment = {
  production: false,
  apiUrl: "https://staging-api.clubberapp.com", // Staging API URL
  useRealBackend: true, // Use real backend in staging
  apiTimeoutMs: 12000, // 12 seconds timeout for API calls
  maxRetries: 2, // Maximum number of retries for failed API calls
  mockStreamingEnabled: true, // Fallback to mock streaming if real streams fail
  features: {
    enableAdvancedSearch: true,
    enableLiveNotifications: true,
    enableOfflineMode: true
  },
  logging: {
    logApiErrors: true,
    logLevelProduction: 'warn', // Log warnings and errors in staging
    sendErrorsToServer: true // Send errors to server for analysis
  }
};
