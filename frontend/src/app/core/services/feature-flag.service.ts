import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Service for checking feature flag status
 * Controls which features are available in the application
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  /**
   * Check if a feature is enabled based on the environment configuration
   * @param featureKey - The key of the feature to check
   * @param defaultValue - Default value if the feature is not defined
   * @returns true if the feature is enabled, false otherwise
   */
  isFeatureEnabled(featureKey: string, defaultValue = false): boolean {
    if (!environment.features) {
      return defaultValue;
    }

    return environment.features[featureKey as keyof typeof environment.features] ?? defaultValue;
  }

  /**
   * Get all enabled features as an object
   * @returns Object with feature keys and their enabled status
   */
  getEnabledFeatures(): Record<string, boolean> {
    if (!environment.features) {
      return {};
    }

    return { ...environment.features };
  }

  /**
   * Check if the application is using the real backend
   * @returns true if using real backend, false if using mock data
   */
  isUsingRealBackend(): boolean {
    return environment.useRealBackend ?? environment.production;
  }
}
