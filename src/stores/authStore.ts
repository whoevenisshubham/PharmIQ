import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'PHARMACIST' | 'CASHIER' | 'MANAGER' | 'VIEWER';
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  gstNumber?: string;
}

interface RegisterPayload {
  tenantName: string;
  email: string;
  password: string;
  gstNumber?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  isAuthenticated: false,
  isLoading: false,
  hasCheckedAuth: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login(email, password);
      set({
        user: response.user,
        tenant: response.tenant,
        isAuthenticated: true,
        isLoading: false,
        hasCheckedAuth: true,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.register(data);
      set({
        user: response.user,
        tenant: response.tenant,
        isAuthenticated: true,
        isLoading: false,
        hasCheckedAuth: true,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    apiClient.logout();
    set({
      user: null,
      tenant: null,
      isAuthenticated: false,
      hasCheckedAuth: true,
      error: null,
    });
  },

  checkAuth: async () => {
    const storedUser = localStorage.getItem('user');
    const storedTenant = localStorage.getItem('tenant');
    const token = localStorage.getItem('auth_token');

    if (storedUser && storedTenant && token) {
      try {
        await apiClient.getCurrentUser();
        set({
          user: JSON.parse(storedUser),
          tenant: JSON.parse(storedTenant),
          isAuthenticated: true,
          hasCheckedAuth: true,
        });
      } catch {
        apiClient.logout();
        set({
          user: null,
          tenant: null,
          isAuthenticated: false,
          hasCheckedAuth: true,
        });
      }
    } else {
      set({
        user: null,
        tenant: null,
        isAuthenticated: false,
        hasCheckedAuth: true,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
