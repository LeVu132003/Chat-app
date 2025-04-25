import { Profile } from "./profile";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}
export interface RegisterResponse {
  token: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  user: Profile | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}
