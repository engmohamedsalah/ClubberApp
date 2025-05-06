/**
 * Generic API response wrapper for backend endpoints
 * This matches the standard response envelope used by the backend
 */
export interface ApiResponse<T> {
  success: boolean;          // Indicates if the request was successful
  message?: string;          // Optional message from the server
  data: T;                   // The actual payload
  timestamp?: string;        // Optional timestamp of when the response was generated
  error?: string;            // Error message if success is false
}

/**
 * Type guard to check if a response is an ApiResponse
 */
export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const response = obj as Partial<ApiResponse<T>>;
  return typeof response.success === 'boolean' && 'data' in response;
}

/**
 * Helper to safely extract data from API responses
 * @param response - The response object
 * @param defaultValue - Value to return if extraction fails
 */
export function extractApiData<T>(response: unknown, defaultValue: T): T {
  if (isApiResponse<T>(response)) {
    return response.data || defaultValue;
  } else if (response !== null && response !== undefined) {
    return response as T;
  }
  return defaultValue;
}
