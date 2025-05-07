// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: "/api/v1", // Use relative path for development with proxy
  autoRefreshInterval: 60000, // Auto-refresh interval in milliseconds (60 seconds)
  apiTimeoutMs: 10000, // 10 seconds timeout for API calls
  maxRetries: 3, // Maximum number of retries for failed API calls
  mockStreamingEnabled: true, // Enable mock streaming
  features: {
    enableAdvancedSearch: true,
    enableLiveNotifications: true,
    enableOfflineMode: true
  },
  logging: {
    logApiErrors: true,
    logLevelProduction: 'debug', // More verbose logging in development
    sendErrorsToServer: false // Don't send errors to server in development
  }
};

