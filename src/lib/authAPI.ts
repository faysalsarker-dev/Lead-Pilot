import axios, { AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: "/api/auth",
});

type ApiResponseData = {
  message?: string;
  user?: unknown;
  data?: unknown;
  resetToken?: string;
};

type ApiResponse<T extends ApiResponseData = ApiResponseData> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const authAPI = {
  // Register a new user
  register: async (
    email: string,
    password: string,
    name?: string
  ): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post("/register", {
        email,
        password,
        name,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      return {
        success: false,
        error: axiosError.response?.data?.error || "Registration failed",
      };
    }
  },

  // Get current user info
  getMe: async (): Promise<ApiResponse> => {
    try {
      const response = await apiClient.get("/me");
      return { success: true, data: response.data.user };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      return {
        success: false,
        error: axiosError.response?.data?.error || "Failed to get user info",
      };
    }
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post("/logout");
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      return {
        success: false,
        error: axiosError.response?.data?.error || "Logout failed",
      };
    }
  },

  // Request password reset
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post("/forgot-password", { email });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      return {
        success: false,
        error:
          axiosError.response?.data?.error ||
          "Failed to process password reset",
      };
    }
  },

  // Reset password with token
  resetPassword: async (
    token: string,
    password: string
  ): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post("/reset-password", {
        token,
        password,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      return {
        success: false,
        error: axiosError.response?.data?.error || "Failed to reset password",
      };
    }
  },
};

export default authAPI;
