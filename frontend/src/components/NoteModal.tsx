'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Note } from '@/lib/api';
import toast from 'react-hot-toast';

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, content: string, imageURL?: string) => Promise<void>;
    note?: Note | null;
}

export default function NoteModal({ isOpen, onClose, onSave, note }: NoteModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setImageURL(note.image_url || '');
            setImagePreview(note.image_url || '');
        } else {
            setTitle('');
            setContent('');
            setImageURL('');
            setImagePreview('');
        }
    }, [note]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setImageURL(base64String);
            setImagePreview(base64String);
            toast.success('Image uploaded!');
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImageURL('');
        setImagePreview('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await onSave(title, content, imageURL);
            setTitle('');
            setContent('');
            setImageURL('');
            setImagePreview('');
            onClose();
        } catch (error) {
            console.error('Failed to save note:', error);
            alert('Failed to save note. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {note ? 'Edit Note' : 'Create New Note'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Enter note title"
                                    required
                                    autoFocus
                                />
                            </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image (Optional)
                            </label>

                            {imagePreview ? (
                                <div className="relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imagePreview || '/placeholder.png'}
                                        alt="Preview"
                                        className="w-full h-64 object-cover rounded-lg border border-gray-300"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                        <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                                        <p className="text-sm text-gray-600">Click to upload image</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                                placeholder="Write your note here..."
                                rows={10}
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}