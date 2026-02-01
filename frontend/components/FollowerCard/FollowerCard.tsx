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
        <div
            onClick={() => {
                const newValue = !isChecked;
                setIsChecked(newValue);
                onCheckChange?.(newValue);
            }}
            className="h-11 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-600 transition duration-200 ease-in-out shadow-sm"
        >
            <div className="flex items-center justify-between h-full px-3">
                {/* Left: Avatar + Info */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1 min-w-0">
                    <div className="w-8 h-8 flex-shrink-0">
                        <ProfileImage imageUrl={avatarUrl || ''} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                            {username}
                        </p>
                        {description && (
                            <p className="text-xs text-gray-500 truncate dark:text-gray-400">
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
                    className="ml-2 flex-shrink-0 w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 dark:ring-offset-slate-700 dark:bg-slate-600 dark:border-slate-500 cursor-pointer"
                />
            </div>
        </div>
    );
};

export default FollowerCard;
