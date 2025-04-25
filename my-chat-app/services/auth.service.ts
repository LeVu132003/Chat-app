import {
  LoginCredentials,
  RegisterCredentials,
  RegisterResponse,
  LoginResponse,
} from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log("API_URL", API_URL);
    console.log("login", credentials);
    const response = await fetch(`${API_URL}/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  async logout(token: string): Promise<void> {
    const response = await fetch(`${API_URL}/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Helper functions
  setToken(token: string): void {
    localStorage.setItem("token", token);
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  removeToken(): void {
    localStorage.removeItem("token");
  },
};
