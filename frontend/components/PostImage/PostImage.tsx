import React from 'react';
import Image from 'next/image';

type PostImageProps = {
    imageUrl: string;
    altText?: string;
    link?: string;
};

const PostImage: React.FC<PostImageProps> = ({ imageUrl, altText = 'Post Image', link = '' }) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!link) {
            e.preventDefault();
        }
    };
    return (
        <div className="relative w-full h-64">
            {' '}
            {/* Define height and relative position */}
            <a href={link} onClick={handleClick} className="relative block w-full h-full">
                <Image
                    className="rounded-t-lg object-cover"
                    src={imageUrl}
                    alt={altText}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </a>
        </div>
    );
};

export default PostImage;
