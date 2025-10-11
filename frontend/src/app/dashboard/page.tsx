'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notesAPI, Note } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import NoteCard from '@/components/NoteCard';
import NoteModal from '@/components/NoteModal';
import { Plus, LogOut, Search, FileText } from 'lucide-react';
import NoteSkeleton from '@/components/NoteSkeleton';
import toast from 'react-hot-toast'; 

function DashboardContent() {
    const { user, logout } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch notes
    const fetchNotes = async () => {
        try {
            setIsLoading(true);
            const data = await notesAPI.getAll();
            setNotes(data || []);
            setFilteredNotes(data || []);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            toast.error('Failed to load notes');
            setNotes([]);
            setFilteredNotes([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (user) fetchNotes();
    }, [user]);

    // Search filter
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredNotes(notes);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = notes.filter(
                (note) =>
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query)
            );
            setFilteredNotes(filtered);
        }
    }, [searchQuery, notes]);
    
    // Create or Update note
    const handleSaveNote = async (title: string, content: string, imageURL?: string) => {
        const loadingToast = toast.loading('Saving note...');
        try {
            if (editingNote) {
                await notesAPI.update(editingNote.ID, title, content, imageURL);
                toast.success('Note updated successfully!', { id: loadingToast });
            } else {
                await notesAPI.create(title, content, imageURL);
                toast.success('Note created successfully!', { id: loadingToast });
            }
            await fetchNotes();
            setEditingNote(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save note:', error);
            toast.error('Failed to save note', { id: loadingToast });
            throw error;
        } finally {
            setTimeout(() => toast.dismiss(loadingToast), 200);
        }
    };


    // Delete note
    const handleDeleteNote = async (id: number) => {
        if (!confirm('Are you sure you want to delete this note?')) return;
        
        const loadingToast = toast.loading('Deleting note...');
        try {
            await notesAPI.delete(id);
            await fetchNotes();
            toast.success('Note deleted successfully!', { id: loadingToast });
        } catch (error) {
            console.error('Failed to delete note:', error);
            toast.error('Failed to delete note', { id: loadingToast });
        } finally {
            setTimeout(() => toast.dismiss(loadingToast), 200);
        }
    };

    
    // Edit note
    const handleEditNote = (note: Note) => {
        setEditingNote(note);
        setIsModalOpen(true);
    };
    
    // Create new note
    const handleCreateNote = () => {
        setEditingNote(null);
        setIsModalOpen(true);
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">NoteShare</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700 font-medium">
                                Welcome, <span className="text-blue-600">{user?.username}</span>
                            </span>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Notes</h1>
                    <p className="text-gray-600">Create and manage your personal notes</p>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notes..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Create Note Button */}
                    <button
                        onClick={handleCreateNote}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-medium">New Note</span>
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <NoteSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && notes.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first note</p>
                        <button
                            onClick={handleCreateNote}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="h-5 w-5" />
                            Create Your First Note
                        </button>
                    </div>
                )}

                {/* No Search Results */}
                {!isLoading && notes.length > 0 && filteredNotes.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes found</h3>
                        <p className="text-gray-600">Try adjusting your search query</p>
                    </div>
                )}

                {/* Notes Grid */}
                {!isLoading && filteredNotes.length > 0 && (
                    <>
                        <div className="mb-4 text-sm text-gray-600">
                            Showing {filteredNotes.length} of {notes.length} notes
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredNotes.map((note) => (
                                <NoteCard
                                    key={note.ID}
                                    note={note}
                                    onEdit={handleEditNote}
                                    onDelete={handleDeleteNote}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Note Modal */}
            <NoteModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingNote(null);
                }}
                onSave={handleSaveNote}
                note={editingNote}
            />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
        <DashboardContent />
        </ProtectedRoute>
    );
}