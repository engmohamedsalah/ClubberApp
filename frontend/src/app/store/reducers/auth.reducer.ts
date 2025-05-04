import { createReducer, on } from "@ngrx/store";
import { User } from '../../models/user.model';
import * as AuthActions from "../actions/auth.actions";

export interface AuthState {
  user: User | null; // Using the proper User type
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,

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
  on(AuthActions.logout, () => initialState), // Reset to initial state on logout

  // Clear Error
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null,
  }))
);

