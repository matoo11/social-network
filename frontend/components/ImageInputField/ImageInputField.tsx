'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageInputFieldProps {
    showPreview?: boolean; // makes preview optional
}

const ImageInputField: React.FC<ImageInputFieldProps> = ({ showPreview = false }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return; // User canceled, do nothing
        const url = URL.createObjectURL(file);
        setPreview(url);
    };

    const handleClear = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset the input so the same file can be uploaded again
        }
    };

    return (
        <div className="flex-1 w-full h-full gap-4 flex flex-col">
            {/* File input label */}
            <label
                htmlFor="file_input"
                className="flex flex-col items-center justify-center w-full h-[25%] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Max size: 20 MB · Formats: JPEG, PNG, GIF
                    </p>
                </div>
                <input
                    id="file_input"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    className="hidden"
                    onChange={handleChange}
                    ref={fileInputRef} // attach the ref
                />
            </label>

            {/* Conditional image preview */}
            {showPreview && (
                <div className="relative h-[75%] rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300">
                    {preview ? (
                        <>
                            <Image
                                src={preview}
                                alt="Image preview"
                                fill
                                className="object-cover"
                            />
                            {/* X button */}
                            <button
                                onClick={handleClear}
                                className="cursor-pointer absolute top-2 right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-700"
                            >
                                ×
                            </button>
                        </>
                    ) : (
                        <span className="text-center font-medium">Preview</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageInputField;
