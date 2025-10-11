'use client';

import { Note } from '@/lib/api';
import { Pencil, Trash2, Calendar } from 'lucide-react';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (id: number) => void;
    onClick: (note: Note) => void;
}

export default function NoteCard({ note, onEdit, onDelete, onClick }: NoteCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleCardClick = () => {
        onClick(note);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        onEdit(note);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        onDelete(note.ID);
    };

    return (
        <div 
            onClick={handleCardClick}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden cursor-pointer transform hover:scale-[1.02]"
        >
            {/* Image */}
            {note.image_url && (
                <div className="w-full h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={note.image_url}
                        alt={note.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1 break-words line-clamp-2">
                        {note.title}
                    </h3>
                    <div className="flex gap-2 ml-2">
                        <button
                            onClick={handleEdit}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit note"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete note"
                        >
                            <Trash2 className="h-4 w-4 text-red-custom" />

                        </button>
                    </div>
                </div>

                <p className="text-gray-600 mb-4 whitespace-pre-wrap break-words line-clamp-3">
                    {note.content}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(note.CreatedAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}