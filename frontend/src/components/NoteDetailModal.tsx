'use client';

import { Note } from '@/lib/api';
import { X, Pencil, Trash2, Calendar } from 'lucide-react';

interface NoteDetailModalProps {
    note: Note | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (note: Note) => void;
    onDelete: (id: number) => void;
}

export default function NoteDetailModal({ 
    note, 
    isOpen, 
    onClose, 
    onEdit, 
    onDelete 
}: NoteDetailModalProps) {
    if (!isOpen || !note) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = () => {
        onClose();
        onDelete(note.ID);
    };

    const handleEdit = () => {
        onClose();
        onEdit(note);
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm  flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex-1 pr-4">
                        {note.title}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEdit}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit note"
                        >
                            <Pencil className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete note"
                        >
                            <Trash2 className="h-4 w-4 text-red-custom" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition ml-2"
                        >
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Image */}
                    {note.image_url && (
                    <div className="mb-6">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={note.image_url}
                            alt={note.title}
                            className="w-full rounded-lg border border-gray-200"
                        />
                    </div>
                    )}

                    {/* Note Content */}
                    <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap break-words text-base leading-relaxed">
                            {note.content}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Created: {formatDate(note.CreatedAt)}</span>
                            </div>
                            {note.UpdatedAt !== note.CreatedAt && (
                                <div className="flex items-center">
                                    <span>Updated: {formatDate(note.UpdatedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 