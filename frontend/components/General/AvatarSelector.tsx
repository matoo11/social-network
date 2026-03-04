'use client';

import React from 'react';
import Image from 'next/image';

type AvatarSelectorProps = {
    selectedAvatar: number;
    onAvatarSelect: (avatarNumber: number) => void;
};

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedAvatar, onAvatarSelect }) => {
    const avatars = [1, 2, 3, 4];

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Choose Your Avatar
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 max-w-[220px] sm:max-w-[260px] mx-auto">
                {avatars.map((num) => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => onAvatarSelect(num)}
                        className={`cursor-pointer relative w-full aspect-square rounded-full overflow-hidden transition-all ${
                            selectedAvatar === num
                                ? 'border-4 border-blue-500 scale-[1.05] shadow-lg'
                                : 'border-4 border-gray-600 hover:border-blue-400 opacity-60 hover:opacity-100'
                        }`}
                    >
                        <Image
                            src={`/avatars/avatar${num}.svg`}
                            alt={`Avatar ${num}`}
                            fill
                            className="object-cover"
                        />
                    </button>
                ))}
            </div>
            {selectedAvatar > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Avatar {selectedAvatar} selected
                </p>
            )}
        </div>
    );
};

export default AvatarSelector;
