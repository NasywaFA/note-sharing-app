'use client';

import { Note } from '@/lib/api';
import { Pencil, Trash2, Calendar, Globe, Lock } from 'lucide-react';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (id: number) => void;
    onClick: (note: Note) => void;
    showAuthor?: boolean;
}

export default function NoteCard({ note, onEdit, onDelete, onClick, showAuthor = false }: NoteCardProps) {
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
        e.stopPropagation();
        onEdit(note);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(note.ID);
    };

    return (
        <div 
            onClick={handleCardClick}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden cursor-pointer transform hover:scale-[1.02]"
        >
            {/* Image note */}
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
                {/* Info author (only show in public feed) */}
                {showAuthor && note.user && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                                {note.user.username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="font-medium">{note.user.username}</span>
                    </div>
                )}

                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1 break-words line-clamp-2">
                        {note.title}
                    </h3>

                    {/* Edit/delete button only show in own notes */}
                    {!showAuthor && (
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
                    )}
                </div>

                <p className="text-gray-600 mb-4 whitespace-pre-wrap break-words line-clamp-3">
                    {note.content}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                        {/* Tanggal */}
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(note.CreatedAt)}</span>
                        </div>

                        {/* Status public/private */}
                        {!showAuthor && (
                            <div
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    note.is_public
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {note.is_public ? (
                                    <>
                                        <Globe className="h-3 w-3" />
                                        Public
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-3 w-3" />
                                        Private
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
