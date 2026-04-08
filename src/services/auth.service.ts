import axios from "axios";
import { apiClient } from "./api";

type LoginResponse = {
  success: boolean;
  data?: {
    token: string;
  };
  message?: string;
};

const ADMIN_TOKEN_STORAGE_KEY = "adminToken";

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      if (response.data.success && response.data.data?.token) {
        localStorage.setItem(
          ADMIN_TOKEN_STORAGE_KEY,
          response.data.data.token,
        );
      }

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("An unexpected error occurred during login.");
    }
  },

  logout: () => {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  },
};
