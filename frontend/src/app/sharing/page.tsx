'use client';

import { useState, useEffect } from 'react';
import { notesAPI, Note } from '@/lib/api';
import Navbar from '@/components/Navbar';
import NoteCard from '@/components/NoteCard';
import NoteDetailModal from '@/components/NoteDetailModal';
import { Search, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function SharingPage() {
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPublicNotes = async () => {
        try {
            setIsLoading(true);
            const data = await notesAPI.getPublicNotes();
            setNotes(data || []);
            setFilteredNotes(data || []);
        } catch (error) {
            console.error('Failed to fetch public notes:', error);
            toast.error('Failed to load public notes');
            setNotes([]);
            setFilteredNotes([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicNotes();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredNotes(notes);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = notes.filter(
                (note) =>
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query) ||
                note.user?.username.toLowerCase().includes(query)
            );
            setFilteredNotes(filtered);
        }
    }, [searchQuery, notes]);

    const handleCardClick = (note: Note) => {
        setSelectedNote(note);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Globe className="h-8 w-8 text-green-600" />
                        Public Notes
                    </h1>
                    <p className="text-gray-600">Explore notes shared by the community</p>
                </div>
        
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search public notes or authors..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    </div>
                )}
    
                {/* Empty State */}
                {!isLoading && filteredNotes.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-lg">No public notes found 📝</p>
                    </div>
                )}
    
                {/* Notes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note) => (
                        <NoteCard
                            key={note.ID}
                            note={note}
                            onEdit={() => {}} // disabled on public page
                            onDelete={() => {}} // disabled on public page
                            onClick={() => handleCardClick(note)}
                            showAuthor={true}
                        />
                    ))}
                </div>
            </div>
                
            {/* Note Detail Modal */}
            {selectedNote && (
                <NoteDetailModal
                    note={selectedNote}
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedNote(null);
                    }}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    isReadOnly={true} // impoartant: mode read-only
                />
            )}
        </div>
    );
}
