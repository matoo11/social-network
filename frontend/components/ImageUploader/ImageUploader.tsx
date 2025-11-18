import { useState, useRef } from 'react';

type ImageUploaderProps = {
    className?: string;
};

function ImageUploader({ className = '' }: ImageUploaderProps) {
    const [fileName, setFileName] = useState<string>('No file chosen');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        // 🚫 If user PRESSED CANCEL → DO NOT UPDATE STATE
        if (!file) return;

        // ✅ User selected a real file
        setFileName(file.name);
        setIsVisible(true);
    };

    const handleClear = () => {
        setIsVisible(false);
        setFileName('No file chosen');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`${className}`}>
            <div className="flex items-center gap-3">
                {/* Custom button (replaces the visible file input) */}
                <label
                    htmlFor="comment_image"
                    className="mb-2 cursor-pointer text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                >
                    Choose File
                </label>

                {/* Hidden actual input */}
                <input
                    id="comment_image"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                />

                {/* File name display */}
                <p className="text-sm mb-2 ">{fileName}</p>

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
