import Image from 'next/image';
import React from 'react';

type ProfileImageProps = {
    imageUrl: string;
    altText?: string;
    link?: string;
    className?: string;
    avatarNumber?: number;
};

const ProfileImage = ({
    imageUrl,
    altText = 'profile Image',
    link = '',
    className,
    avatarNumber,
}: ProfileImageProps) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (!link) {
            event.preventDefault();
        }
    };

    // Determine the image source
    let imageSrc = imageUrl || 'http://localhost:3000/uploads/default-profile.jpg';
    
    // If avatarNumber is provided (1-4), use the corresponding avatar SVG
    if (avatarNumber && avatarNumber >= 1 && avatarNumber <= 4) {
        imageSrc = `/avatars/avatar${avatarNumber}.svg`;
    }

    return (
        <div
            className={`relative w-full h-full p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 overflow-hidden flex items-center justify-center ${className}`}
        >
            <a
                href={link}
                onClick={handleClick}
                className="relative w-full h-full flex items-center justify-center"
            >
                <Image
                    src={imageSrc}
                    alt={altText}
                    fill
                    sizes="48px"
                    className="object-cover object-center rounded-full"
                />
            </a>
        </div>
    );
};

export default ProfileImage;
