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
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-[220px] sm:max-w-[260px] mx-auto">
                {avatars.map((num) => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => onAvatarSelect(num)}
                        className={`relative w-full aspect-square rounded-full overflow-hidden border transition-all ${
                            selectedAvatar === num
                                ? 'border-blue-600 scale-[1.02] shadow-md'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
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
