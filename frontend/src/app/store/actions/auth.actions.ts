import { createAction, props } from "@ngrx/store";
import { User } from "../../models/user.model"; // Create this model later

// Login Actions
export const login = createAction(
  "[Auth] Login",
  props<{ username: string; password: string }>()
);

export const loginSuccess = createAction(
  "[Auth] Login Success",
  props<{ user: User; token: string }>()
);

export const loginFailure = createAction(
  "[Auth] Login Failure",
  props<{ error: string }>()
);

// Register Actions
export const register = createAction(
  "[Auth] Register",
  props<{ username: string; email: string; password: string }>()
);

export const registerSuccess = createAction(
  "[Auth] Register Success" // Often doesn't need payload, maybe just a success message or redirect
);

export const registerFailure = createAction(
  "[Auth] Register Failure",
  props<{ error: string }>()
);

// Logout Action
export const logout = createAction("[Auth] Logout");

// Clear Error Action
export const clearAuthError = createAction("[Auth] Clear Error");

