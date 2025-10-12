"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileText, Lock, Users, Globe } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                NoteShare
              </span>
            </div>
            <div className="flex gap-4">
              <Link href="/sharing">
                <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Explore
                </button>
              </Link>
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
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Notes, Organized & Secure
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, manage, and share your notes effortlessly. Built with modern
            technology for the best experience.
          </p>
          <Link href="/register">
            <button className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
              Start Taking Notes
            </button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Note Taking</h3>
            <p className="text-gray-600">
              Create and edit notes with a simple, intuitive interface. Focus on
              your content, not the tool.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Your notes are encrypted and protected. Only you can access your
              personal information.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personal Workspace</h3>
            <p className="text-gray-600">
              Each user gets their own private workspace to organize notes their
              way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
