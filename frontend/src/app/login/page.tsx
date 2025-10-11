'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogIn, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function LoginPage() {
    const [login, setLogin] = useState(''); 
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { login: loginUser } = useAuth(); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        const loadingToast = toast.loading('Logging in...');

        try {
            await loginUser(login, password);
            toast.success('Login successful!', { id: loadingToast });
        } catch (err: unknown) {
            let message = 'Login failed';

            // Kalau error dari Axios atau throw Error biasa
            if (err instanceof Error) {
                message = err.message;
            } else if ((err as AxiosError)?.response) {
                const error = err as AxiosError<{ message?: string }>;
                message = error.response?.data?.message || error.message || message;
            }

            setErrorMessage(message);
            toast.error(message, { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-600 mt-2">Login to access your notes</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username or Email
                        </label>
                        <input
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Enter username or email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>

                    {errorMessage && (
                        <div className="flex items-center text-red-500 text-sm mt-3">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span>{errorMessage}</span>
                        </div>
                    )}
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
