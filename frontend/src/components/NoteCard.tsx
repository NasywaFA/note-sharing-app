'use client';

import { Note } from '@/lib/api';
import { Pencil, Trash2, Calendar, Image as ImageIcon } from 'lucide-react';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (id: number) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
            {/* Image */}
            {note.image_url?.trim() && (
                <div className="w-full h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={note.image_url ?? ''}
                        alt={note.title || 'Note image'}
                        className="w-full h-full object-cover"
                    />

                </div>
            )}

            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1 break-words">
                        {note.title}
                    </h3>
                    <div className="flex gap-2 ml-2">
                        <button
                            onClick={() => onEdit(note)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit note"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(note.ID)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete note"
                        >
                            <Trash2 className="h-4 w-4" />
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
                    {note.image_url && (
                        <div className="flex items-center text-blue-600">
                            <ImageIcon className="h-4 w-4 mr-1" />
                            <span>Has image</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}