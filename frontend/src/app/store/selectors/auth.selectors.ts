import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthState } from "../state/auth.state";

// Feature selector for the auth state slice
export const selectAuthState = createFeatureSelector<AuthState>("auth");

// Selector for the user object
export const selectAuthUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

// Selector for the JWT token
export const selectAuthToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.token
);

// Selector for the loading status
export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.loading
);

// Selector for the error message
export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

// Selector to check if the user is authenticated (has a token)
export const selectIsAuthenticated = createSelector(
  selectAuthToken,
  (token) => !!token
);

