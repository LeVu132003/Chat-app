"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { Profile } from "@/types/profile";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = async (authToken: string) => {
    try {
      const profile = await profileService.getProfile(authToken);
      setUser(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    // Check for token on mount
    const storedToken = authService.getToken();
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      const accessToken = response.access_token;
      setToken(accessToken);
      authService.setToken(accessToken);
      await fetchUserProfile(accessToken);
      router.push("/chat"); // Redirect to chat page after login
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authService.register(credentials);
      const accessToken = response.token;
      setToken(accessToken);
      authService.setToken(accessToken);
      await fetchUserProfile(accessToken);
      router.push("/chat"); // Redirect to chat page after registration
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      authService.removeToken();
      router.push("/");
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isLoading,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
