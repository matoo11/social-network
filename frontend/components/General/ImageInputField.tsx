'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { validateImage, getMaxFileSizeString } from '@/lib/validation/imageValidation';

interface ImageInputFieldProps {
    showPreview?: boolean; // makes preview optional
    onError?: (error: string) => void; // callback for validation errors
}

const ImageInputField: React.FC<ImageInputFieldProps> = ({ showPreview = false, onError }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return; // User canceled, do nothing

        // Clear previous errors
        setValidationError(null);

        // Validate image
        const error = await validateImage(file);
        if (error) {
            setValidationError(error);
            if (onError) onError(error);
            // Clear the input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        const url = URL.createObjectURL(file);
        setPreview(url);
    };

    const handleClear = () => {
        setPreview(null);
        setValidationError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset the input so the same file can be uploaded again
        }
    };

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Validation Error Display */}
            {validationError && (
                <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
                    {validationError}
                </div>
            )}

            {/* File input label */}
            <label
                htmlFor="file_input"
                className="flex flex-col items-center justify-center w-full min-h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 bg-slate-800 border-slate-600 hover:bg-gray-100 hover:bg-slate-700 transition-colors"
            >
                <div className="flex flex-col items-center justify-center py-4 px-3">
                    <svg
                        className="w-6 h-6 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    <p className="text-sm text-gray-400 text-center">
                        <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                        Max size: {getMaxFileSizeString()} · Formats: JPEG, PNG, GIF
                    </p>
                </div>
                <input
                    id="file_input"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    className="hidden"
                    onChange={handleChange}
                    ref={fileInputRef}
                />
            </label>

            {/* Conditional image preview */}
            {showPreview && (
                <div className="relative min-h-28 rounded-lg border-2 border-gray-200 border-slate-600 overflow-hidden flex items-center justify-center bg-gray-100 bg-slate-800 text-gray-400 text-gray-500">
                    {preview ? (
                        <>
                            <Image
                                src={preview}
                                alt="Image preview"
                                fill
                                className="object-cover"
                            />
                            {/* Clear button */}
                            <button
                                type="button"
                                onClick={handleClear}
                                className="cursor-pointer absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80 transition-colors font-bold"
                            >
                                ×
                            </button>
                        </>
                    ) : (
                        <span className="text-sm text-gray-500 font-medium">
                            No image yet
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageInputField;
