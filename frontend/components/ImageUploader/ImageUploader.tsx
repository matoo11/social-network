import { useState } from 'react';

type ImageUploaderProps = {
    className?: string;
};

function ImageUploader( { className = '' }: ImageUploaderProps) {
    const [fileName, setFileName] = useState<string>('No file chosen');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileName(file ? file.name : 'No file chosen');
    };

    return (
        <div className={`${className}`}>
            <div className="flex items-center gap-3">
                <input
                    id="comment_image"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    className="
                        block w-full text-sm text-heading cursor-pointer
                        border border-default-medium bg-neutral-secondary-medium
                        rounded-base shadow-xs 
                        focus:ring-brand focus:border-brand
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-base file:border-0
                        file:text-sm file:font-semibold file:bg-brand file:text-white
                        file:cursor-pointer
                    "
                />

                <span className="text-xs text-body whitespace-nowrap">{fileName}</span>
            </div>
        </div>
    );
}

export default ImageUploader;
