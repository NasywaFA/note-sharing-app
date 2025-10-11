'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authAPI, type User } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface AuthContextType {
    user: User | null;
    login: (login: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
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
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        errorMessage = 'Please enter valid credentials';
                        break;
                    case 401:
                        errorMessage = 'Invalid username/email or password';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later';
                        break;
                    default:
                        if (error.response.data?.message) {
                            errorMessage = error.response.data.message;
                        }
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection';
            }
            throw new Error(errorMessage);
        }
    };
    const register = async (username: string, email: string, password: string) => {
        try {
            await authAPI.register(username, email, password);
            await login(username, password);
        } catch (err) {
            let errorMessage = 'Registration failed. Please try again.';
            const error = err as AxiosError<{ error?: string }>;
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        errorMessage = error.response.data?.error || 'Invalid input. Please check your details';
                        break;
                    case 409:
                        if (error.response.data?.error?.includes('Username')) {
                            errorMessage = 'Username already taken';
                        } else if (error.response.data?.error?.includes('Email')) {
                            errorMessage = 'Email already registered';
                        } else {
                            errorMessage = 'Username or email already exists';
                        }
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later';
                        break;
                    default:
                        if (error.response.data?.error) {
                            errorMessage = error.response.data.error;
                        }
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection';
            } else if (error.message && !error.message.includes('status code')) {
                throw error;
            }
            throw new Error(errorMessage);
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