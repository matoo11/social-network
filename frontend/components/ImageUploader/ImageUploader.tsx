'use client';
import React, { useRef, useState, useEffect } from 'react';

type ImageUploaderProps = {
    className?: string;
    file: File | null; // parent-controlled file
    setFile: (file: File | null) => void; // callback to parent
};

function ImageUploader({ className = '', file, setFile }: ImageUploaderProps) {
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        setFileName(selectedFile.name);
        setIsVisible(true);

        // Send file to parent
        setFile(selectedFile);
    };

    const handleClear = () => {
        setIsVisible(false);
        setFileName('No file chosen');
        setFile(null); // clear file in parent

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
