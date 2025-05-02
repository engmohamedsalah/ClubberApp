import { createReducer, on } from "@ngrx/store";
import { AuthState, initialAuthState } from "../state/auth.state";
import * as AuthActions from "../actions/auth.actions";

export const authReducer = createReducer(
  initialAuthState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user: user,
    token: token,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    token: null,
    loading: false,
    error: error,
  })),

  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.registerSuccess, (state) => ({
    ...state,
    loading: false,
    error: null, // Clear error on success, user is not logged in yet
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),

  // Logout
  on(AuthActions.logout, (state) => initialAuthState), // Reset to initial state on logout

  // Clear Error
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null,
  }))
);

