import apiClient from './client';
import type { LoginRequest, LoginResponse, LoginResponseData, User } from '../types';

// đăng nhập
export const login = async (credentials: LoginRequest): Promise<LoginResponseData> => {
    const response = await apiClient.post<LoginResponse>('/login', credentials);
    // API trả về { is_success, message, data: { token, user } }
    return response.data.data;
};

// lấy thông tin user hiện tại
export const getCurrentUser = async (): Promise<User> => {
    const response = await apiClient.get<any>('/users/me');
    // API trả về { data: { user: ... } } hoặc { data: ... }
    return response.data.data?.user || response.data.data || response.data;
};

// đăng xuất (client-side only)
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
};
