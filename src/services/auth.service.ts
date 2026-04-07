import api from "./api";
import axios from "axios";

export const authService = {
  // ============================================================================
  // ACCIÓN: iniciarSesion
  // ============================================================================
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      // Si es exitoso, guardamos el token en el navegador
      if (response.data.success && response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
      }

      return response.data;
    } catch (error: unknown) {
      // Manejo estricto de errores de vanguardia (Type Narrowing)
      if (axios.isAxiosError(error)) {
        // Es un error del servidor (ej. credenciales inválidas, error 400/500)
        throw error.response?.data || new Error(error.message);
      } else if (error instanceof Error) {
        // Es un error nativo de JavaScript (ej. problemas de red)
        throw new Error(error.message);
      }

      // Error completamente desconocido
      throw new Error("An unexpected error occurred during login");
    }
  },

  // ============================================================================
  // ACCIÓN: cerrarSesion
  // ============================================================================
  logout: () => {
    localStorage.removeItem("adminToken");
  },

  // ============================================================================
  // ACCIÓN: verificarEstadoSesion
  // ============================================================================
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("adminToken");
  },
};
