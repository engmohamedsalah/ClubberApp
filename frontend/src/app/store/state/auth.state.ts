import { User } from "../../models/user.model"; // Create this model later

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

