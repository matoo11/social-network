import React from 'react';
import Image from 'next/image';

type PostImageProps = {
    imageUrl: string;
    altText?: string;
    link?: string;
    className?: string;
};

const PostImage: React.FC<PostImageProps> = ({ imageUrl, altText = 'Post Image', link = '', className }) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!link) {
            e.preventDefault();
        }
    };
    return (
        <div className={`relative w-full aspect-video ${className}`}>
            {' '}
            {/* Define height and relative position */}
            <a href={link} onClick={handleClick} className="relative block w-full h-full">
                <Image className="object-contain" src={imageUrl} alt={altText} fill sizes="100vw" />
            </a>
        </div>
    );
};

export default PostImage;
