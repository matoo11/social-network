// app/components/Followers/FollowerCard.tsx
'use client';

import React from 'react';
import ProfileImage from '../ProfileImage/ProfileImage';

type FollowerCardProps = {
    userID: number;
    username: string;
    description?: string;
    avatarUrl?: string;
    checked?: boolean;
    onCheckChange?: (checked: boolean) => void;
};

const FollowerCard: React.FC<FollowerCardProps> = ({
    userID,
    username,
    description,
    avatarUrl,
    checked = false,
    onCheckChange,
}) => {
    const [isChecked, setIsChecked] = React.useState(checked);

    // Keep local state in sync if parent changes `checked`
    React.useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    // Handle checkbox changes
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setIsChecked(newValue);
        onCheckChange?.(newValue); // notify parent if callback provided
        // console.log('Checkbox state for', userID, ':', newValue);
    };

    return (
        <div className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer shadow-sm overflow-hidden dark:bg-gray-800 transition duration-300 ease-in-out">
            <div className="flex items-center justify-between p-3">
                {/* Left: Avatar + Info */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="w-10 h-10">
                        <ProfileImage imageUrl={avatarUrl || ''} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            {username}
                        </p>
                        {description && (
                            <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Checkbox */}
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
        </div>
    );
};

export default FollowerCard;
