'use client';

import React from 'react';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';
import ImageInputField from '../ImageInputField/ImageInputField';

type FormData = {
    title: string;
    text: string;
};

type GroupPostFormUIProps = {
    formData: FormData;
    error: string;
    onInputChange: (
        field: 'title' | 'text',
    ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const GroupPostFormUI: React.FC<GroupPostFormUIProps> = ({
    formData,
    error,
    onInputChange,
    onSubmit,
}) => {
    return (
        <div className="border border-gray-700 rounded-xl shadow-lg overflow-hidden bg-gray-900">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600/20">
                    <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                </div>
                <Title text="Create Group Post" />
            </div>

            {/* Body */}
            <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">
                <InputField
                    htmlFor="title"
                    labelText="Title"
                    inputType="text"
                    inputName="title"
                    inputID="title"
                    inputValue={formData.title}
                    onInputChange={onInputChange('title')}
                    placeholderText="Post title (max 30 chars)"
                    isRequired
                />

                <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Post Text
                    </label>
                    <textarea
                        className="w-full h-40 p-3 rounded-lg bg-slate-800 border-2 border-slate-600 text-white text-sm
                                   resize-none placeholder-gray-500
                                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={formData.text}
                        onChange={onInputChange('text')}
                        placeholder="Write something… (max 2000 chars)"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Image (optional)
                    </label>
                    <ImageInputField showPreview={true} />
                </div>

                {/* Footer: Error + Submit */}
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-700/50">
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                            <svg
                                className="w-4 h-4 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full text-white bg-blue-600 hover:bg-blue-500
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   rounded-lg text-sm font-medium px-5 py-2.5
                                   transition-colors duration-150"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GroupPostFormUI;
