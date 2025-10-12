'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notesAPI, Note } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar'; 
import NoteCard from '@/components/NoteCard';
import NoteModal from '@/components/NoteModal';
import NoteDetailModal from '@/components/NoteDetailModal';
import LogoutModal from '@/components/LogoutModal';
import { Plus, LogOut, Search, FileText, Link, Globe, Lock } from 'lucide-react';
import NoteSkeleton from '@/components/NoteSkeleton';
import toast from 'react-hot-toast';

function DashboardContent() {
    const { user, logout } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
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

    // Save note (create/update)
    const handleSaveNote = async (title: string, content: string, imageURL?: string, isPublic?: boolean) => {
        const loadingToast = toast.loading(editingNote ? 'Updating note...' : 'Creating note...');

        try {
            if (editingNote) {
                await notesAPI.update(editingNote.ID, title, content, imageURL, isPublic);
                toast.success('Note updated successfully!', { id: loadingToast });
            } else {
                await notesAPI.create(title, content, imageURL, isPublic);
                toast.success('Note created successfully!', { id: loadingToast });
            }
            await fetchNotes();
            setEditingNote(null);
        } catch (error) {
            console.error('Failed to save note:', error);
            toast.error('Failed to save note', { id: loadingToast });
            throw error;
        }
    };

    // Delete note
    const handleDeleteNote = async (id: number) => {
        toast((t) => (
            <div className="flex flex-col gap-2 p-2">
                <p>Are you sure you want to delete this note?</p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-amber-500 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            const loadingToast = toast.loading('Deleting note...');
                            try {
                                await notesAPI.delete(id);
                                toast.success('Note deleted successfully!', { id: loadingToast });
                                await fetchNotes();
                            } catch (err) {
                                console.error(err);
                                toast.error('Failed to delete note', { id: loadingToast });
                            }
                            toast.dismiss(t.id);
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ));
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

    // Detail modal
    const handleCardClick = (note: Note) => {
        setSelectedNote(note);
        setIsDetailModalOpen(true);
    };

    // Logout handlers
    const handleLogoutClick = () => setIsLogoutModalOpen(true);
    const handleLogoutConfirm = () => {
        setIsLogoutModalOpen(false);
        logout();
        toast.success('Logged out successfully!');
    };
    const handleLogoutCancel = () => setIsLogoutModalOpen(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar />
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Notes</h1>
                    <p className="text-gray-600">Create and manage your personal notes</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
                    <button
                        onClick={handleCreateNote}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-medium">New Note</span>
                    </button>
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

                {/* Detail Modal */}
                <NoteDetailModal
                    note={selectedNote}
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedNote(null);
                    }}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                />

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <NoteSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Empty / No Search */}
                {!isLoading && filteredNotes.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {notes.length === 0 ? 'No notes yet' : 'No notes found'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {notes.length === 0
                            ? 'Get started by creating your first note'
                            : 'Try adjusting your search query'}
                        </p>
                        <button
                            onClick={handleCreateNote}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="h-5 w-5" />
                            {notes.length === 0 ? 'Create Your First Note' : 'Search Again'}
                        </button>
                    </div>
                )}

                {/* Stats */}
                {!isLoading && notes.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Notes</p>
                                    <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Public Notes</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        {notes.filter(n => n.is_public).length}
                                    </p>
                                </div>
                                <Globe className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Private Notes</p>
                                    <p className="text-2xl font-bold text-gray-700">
                                        {notes.filter(n => !n.is_public).length}
                                    </p>
                                </div>
                                <Lock className="h-8 w-8 text-gray-600" />
                            </div>
                        </div>
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
                                    onClick={handleCardClick}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Logout Confirmation Modal */}
                <LogoutModal
                    isOpen={isLogoutModalOpen}
                    onConfirm={handleLogoutConfirm}
                    onCancel={handleLogoutCancel}
                />
            </div>
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