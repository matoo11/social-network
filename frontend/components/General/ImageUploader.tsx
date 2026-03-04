'use client';
import React, { useRef, useState, useEffect } from 'react';
import { validateImage } from '@/lib/validation/imageValidation';

type ImageUploaderProps = {
    className?: string;
    file: File | null; // parent-controlled file
    setFile: (file: File | null) => void; // callback to parent
    onError?: (error: string | null) => void; // callback for validation errors
};

function ImageUploader({ className = '', file, setFile, onError }: ImageUploaderProps) {
    const [fileName, setFileName] = useState<string>('No file chosen');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        if (!file) {
            setIsVisible(false);
            setFileName('No file chosen');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [file]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        // Validate image
        const error = await validateImage(selectedFile);
        if (error) {
            // Pass error to parent
            if (onError) onError(error);
            // Clear the input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Clear any previous errors
        if (onError) onError(null);

        setFileName(selectedFile.name);
        setIsVisible(true);

        // Send file to parent
        setFile(selectedFile);
    };

    const handleClear = () => {
        setIsVisible(false);
        setFileName('No file chosen');
        setFile(null); // clear file in parent
        if (onError) onError(null); // clear any errors

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`${className}`}>
            <label
                htmlFor="comment_image"
                className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                title="Attach image"
            >
                <i className="fa-regular fa-image text-sm"></i>
            </label>

            <input
                id="comment_image"
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
            />
        </div>
    );
}

export default ImageUploader;
