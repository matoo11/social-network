'use client';

import React from 'react';
import { useState } from 'react';

type SearchInputProps = {
    placeholder?: string;
    onSearch: (query: string) => void;
    className?: string;
};

const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = 'Search...',
    onSearch,
    className,
}) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
    };
    return (
        <div className={`max-w-full ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                        className="w-4 h-4 text-gray-500 text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                    </svg>
                </div>
                <input
                    value={query}
                    onChange={handleInputChange}
                    type="search"
                    id="default-search"
                    className="w-full px-3 py-2 ps-9 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-800 border-slate-600 placeholder-gray-500 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={placeholder}
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            onSearch('');
                        }}
                        className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchInput;
