import api from './axios';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const login = (data: LoginData) =>
  api.post<{ access_token: string; token_type: string }>('/auth/login', data);

export const register = (data: RegisterData) => api.post<User>('/auth/register', data);

export const getMe = () => api.get<User>('/auth/me');
