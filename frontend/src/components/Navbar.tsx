'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Globe, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import LogoutModal from './LogoutModal';
import toast from 'react-hot-toast';

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleLogoutConfirm = () => {
        setIsLogoutModalOpen(false);
        logout();
        toast.success('Logged out successfully!');
    };

    const handleLogoutCancel = () => {
        setIsLogoutModalOpen(false);
    };

    // Check if user is authenticated
    const isAuthenticated = !!user;

    // Determine active tab
    const isDashboard = pathname === '/dashboard';
    const isSharing = pathname === '/sharing';

    return (
        <>
        <nav className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Logo & Navigation */}
                    <div className="flex items-center gap-8">
                        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">NoteShare</span>
                        </Link>

                        {/* Navigation Tabs (only show if authenticated) */}
                        {isAuthenticated && (
                            <div className="flex gap-2">
                                <Link href="/dashboard">
                                    <button
                                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                                            isDashboard
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <FileText className="h-4 w-4" />
                                        Dashboard
                                    </button>
                                </Link>
                                <Link href="/sharing">
                                    <button
                                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                                            isSharing
                                            ? 'bg-green-100 text-green-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Globe className="h-4 w-4" />
                                        Sharing
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Public user - show Explore link */}
                        {!isAuthenticated && pathname !== '/sharing' && (
                            <Link href="/sharing">
                                <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Explore
                                </button>
                            </Link>
                        )}
                    </div>
            
                    {/* Right side - User info & Actions */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-gray-700 font-medium">
                                    Welcome, <span className="text-blue-600">{user.username}</span>
                                </span>
                                <button
                                    onClick={handleLogoutClick}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition">
                                        Login
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                        Get Started
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>

        {/* Logout Modal */}
        <LogoutModal
            isOpen={isLogoutModalOpen}
            onConfirm={handleLogoutConfirm}
            onCancel={handleLogoutCancel}
        />
        </>
    );
}