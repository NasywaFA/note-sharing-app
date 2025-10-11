'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authAPI, type User } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('token');
        const savedUser = localStorage.getItem('user');
    
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
    try {
        const data = await authAPI.login(username, password);
        Cookies.set('token', data.token, { expires: 7 });
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        router.push('/dashboard');
        } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Login failed');
        }
        throw new Error('Login failed');
    }

    };

    const register = async (username: string, password: string) => {
    try {
        await authAPI.register(username, password);
        await login(username, password);
        } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Login failed');
        }
        throw new Error('Login failed');
    }

    };

    const logout = () => {
        Cookies.remove('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
        if (context === undefined) {
            throw new Error('useAuth must be used within an AuthProvider');
        }
    return context;
}