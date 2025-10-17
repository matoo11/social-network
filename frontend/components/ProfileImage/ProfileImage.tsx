import Image from 'next/image';
import React from 'react';

type ProfileImageProps = {
    imageUrl: string;
    altText?: string;
    link?: string;
};

const ProfileImage = ({ imageUrl, altText = 'profile Image', link = '' }: ProfileImageProps) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (!link) {
            event.preventDefault();
        }
    };
    console.log('ProfileImage URL:', imageUrl);
    imageUrl = imageUrl.trim();

    // if (!imageUrl) {
    //     imageUrl = 'http://localhost:3000/uploads/default-profile.jpg';
    // }

    return (
        <div className="flex relative w-full h-full p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 overflow-hidden items-center justify-center">
            <a href={link} onClick={handleClick} className='flex relative block w-full h-full items-center justify-center'>
                <Image className="object-center object-cover rounded-full" src={imageUrl || 'http://localhost:3000/uploads/default-profile.jpg'} alt={altText} fill />
            </a>
        </div>
    );
};

export default ProfileImage;
