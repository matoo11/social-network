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
            <div className="flex items-center gap-3">
                <label
                    htmlFor="comment_image"
                    className="cursor-pointer text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                >
                    Choose File
                </label>

                <input
                    id="comment_image"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                />

                <p className="text-sm mb-2">{fileName}</p>

                {isVisible && (
                    <button
                        onClick={handleClear}
                        className="mb-2 cursor-pointer bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-700"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}

export default ImageUploader;
