import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, LoginRequest } from '../types';
import * as authApi from '../api/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // kiểm tra token khi app khởi động
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    // verify token bằng cách gọi API
                    const currentUser = await authApi.getCurrentUser();
                    setUser(currentUser);
                    localStorage.setItem('user', JSON.stringify(currentUser));
                } catch (error) {
                    // token không hợp lệ, xóa dữ liệu
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await authApi.login(credentials);

            // response đã được unwrap trong auth.ts
            // structure: { token: string, user: User }
            if (!response.token || !response.user) {
                throw new Error('Invalid response structure');
            }

            // lưu token và user info
            localStorage.setItem('access_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// custom hook để sử dụng auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
