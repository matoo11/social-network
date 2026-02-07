'use client';

import React, { useState } from 'react';

const EMOJI_CATEGORIES = {
    smileys: [
        '😀',
        '😃',
        '😄',
        '😁',
        '😆',
        '😅',
        '🤣',
        '😂',
        '🙂',
        '🙃',
        '😉',
        '😊',
        '😇',
        '🥰',
        '😍',
        '🤩',
        '😘',
        '😗',
        '😚',
        '😙',
        '🥲',
        '😋',
        '😛',
        '😜',
        '🤪',
        '😌',
        '😔',
        '😑',
        '😐',
        '😶',
    ],
    gestures: [
        '👋',
        '🤚',
        '🖐️',
        '✋',
        '👌',
        '🤌',
        '✌️',
        '🤞',
        '👍',
        '👎',
        '✊',
        '👊',
        '👏',
        '🙌',
        '👐',
        '🤲',
        '🤝',
    ],
    hearts: [
        '❤️',
        '🧡',
        '💛',
        '💚',
        '💙',
        '💜',
        '🖤',
        '🤍',
        '🤎',
        '💔',
        '💕',
        '💞',
        '💓',
        '💗',
        '💖',
        '💘',
        '💝',
    ],
    nature: [
        '🌲',
        '🌳',
        '🌴',
        '🌵',
        '🌿',
        '🍀',
        '🍁',
        '🍂',
        '🌺',
        '🌻',
        '🌹',
        '🌷',
        '⭐',
        '🌟',
        '✨',
        '☀️',
        '🌈',
    ],
    food: [
        '🍕',
        '🍔',
        '🍟',
        '🌭',
        '🍿',
        '🍗',
        '🍖',
        '🍝',
        '🍜',
        '🍲',
        '🍛',
        '🍣',
        '🍱',
        '🍙',
        '🍚',
        '🎂',
        '🍰',
    ],
};

type EmojiPickerProps = {
    onSelectEmoji: (emoji: string) => void;
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji }) => {
    const [activeTab, setActiveTab] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');

    return (
        <div className="w-72 h-56 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-2 flex flex-col">
            {/* Tabs */}
            <div className="flex gap-1 mb-2 overflow-x-auto">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveTab(category as keyof typeof EMOJI_CATEGORIES)}
                        className={`px-1.5 py-1 rounded text-xs whitespace-nowrap transition-colors flex-shrink-0 ${
                            activeTab === category
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-7 gap-1 overflow-y-auto hide-scrollbar flex-1">
                {EMOJI_CATEGORIES[activeTab].map((emoji, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelectEmoji(emoji)}
                        className="text-2xl hover:bg-gray-700 rounded p-1 transition-colors"
                        title={emoji}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EmojiPicker;
