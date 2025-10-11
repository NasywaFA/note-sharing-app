'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { X, Check, RotateCw } from 'lucide-react';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
}

// Helper function to create image from crop
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

    async function getCroppedImg(
        imageSrc: string,
        pixelCrop: { x: number; y: number; width: number; height: number },
        rotation = 0
    ): Promise<string> {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2d context');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(
            image,
            -pixelCrop.width / 2 - pixelCrop.x,
            -pixelCrop.height / 2 - pixelCrop.y,
            image.width,
            image.height
        );
        ctx.restore();
        return canvas.toDataURL('image/jpeg');
    }


    export default function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
        const [crop, setCrop] = useState({ x: 0, y: 0 });
        const [zoom, setZoom] = useState(1);
        const [rotation, setRotation] = useState(0);
        const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
        const [isProcessing, setIsProcessing] = useState(false);

        const onCropChange = (location: { x: number; y: number }) => {
            setCrop(location);
        };

        const onCropAreaChange = useCallback(
            (croppedArea: Area, croppedAreaPixels: Area) => {
                setCroppedAreaPixels(croppedAreaPixels);
            },
            []
        );

    const handleCropComplete = async () => {
        try {
            setIsProcessing(true);
            if (!croppedAreaPixels) {
                throw new Error("No crop area selected");
            }
            const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error('Error cropping image:', e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white  rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-300">
                    <h3 className="text-gray-900 font-semibold text-lg">Crop Image</h3>
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
        
                {/* Cropper */}
                <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] bg-black">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={16 / 9}
                        onCropChange={onCropChange}
                        onCropComplete={onCropAreaChange}
                        onZoomChange={setZoom}
                        showGrid={false}
                    />
                </div>
        
                {/* Controls */}
                <div className="p-6 space-y-4 bg-gray-50">
                    <div>
                        <label className="text-gray-900 text-sm mb-2 block">Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
            
                    <div>
                        <label className="text-gray-900 text-sm mb-2 block">Rotation</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="range"
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="flex-1"
                            />
                            <button
                                onClick={handleRotate}
                                className="p-2bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
                                title="Rotate 90°"
                            >
                                <RotateCw className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
        
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 borderborder-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCropComplete}
                            disabled={isProcessing}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? 'Processing...' : <><Check className="h-5 w-5" />Apply Crop</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}