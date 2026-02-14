import React from 'react';
import Image from 'next/image';

type PostImageProps = {
    imageUrl: string;
    altText?: string;
    link?: string;
    className?: string;
};

const PostImage: React.FC<PostImageProps> = ({
    imageUrl,
    altText = 'Post Image',
    link = '',
    className,
}) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!link) {
            e.preventDefault();
        }
    };
    return (
        <div className={`relative w-full aspect-video bg-gray-700/50 ${className || ''}`}>
            <a href={link} onClick={handleClick} className="relative block w-full h-full">
                <Image
                    className="object-contain"
                    src={imageUrl}
                    alt={altText}
                    fill
                    sizes="(min-width: 768px) 500px, 100vw"
                />
            </a>
        </div>
    );
};

export default PostImage;
