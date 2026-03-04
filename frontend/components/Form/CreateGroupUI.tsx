'use client';

import React from 'react';
import Title from '../General/Title';
import InputField from '../General/InputField';
import AllUsersList from '../Chat/AllUsersList';

type FormData = {
    title: string;
    description: string;
    invitees: number[];
};

type CreateGroupUIProps = {
    formData: FormData;
    error: string;
    loading: boolean;
    onInputChange: (
        field: 'title' | 'description',
    ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onInviteChange: (ids: number[]) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const CreateGroupUI: React.FC<CreateGroupUIProps> = ({
    formData,
    error,
    loading,
    onInputChange,
    onInviteChange,
    onSubmit,
}) => {
    return (
        <div className="border border-gray-700 rounded-xl h-full shadow-lg overflow-hidden bg-gray-900">
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>
                <Title text="Create New Group" />
            </div>

            {/* Body */}
            <div className="p-6 h-[calc(100%-60px)] overflow-y-auto hide-scrollbar">
                <form onSubmit={onSubmit} className="flex flex-col h-full gap-6">
                    <div className="flex gap-6 flex-1 min-h-0">
                        {/* Left: Group Details */}
                        <div className="flex-1 flex flex-col gap-5">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                    Group Details
                                </h3>
                            </div>

                            <InputField
                                htmlFor="title"
                                labelText="Group Title"
                                inputType="text"
                                inputName="title"
                                inputID="title"
                                inputValue={formData.title}
                                onInputChange={onInputChange('title')}
                                placeholderText="Enter a group name..."
                                isRequired
                            />

                            <div className="flex-1 flex flex-col">
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="flex-1 bg-slate-800 border-2 border-slate-600 text-white text-sm rounded-lg
                                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-3
                                               resize-none placeholder-gray-500 transition-colors"
                                    placeholder="What is this group about?"
                                    value={formData.description}
                                    onChange={onInputChange('description')}
                                />
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="w-px bg-gray-700 self-stretch"></div>

                        {/* Right: Invite Members */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                    Invite Members
                                </h3>
                                {formData.invitees.length > 0 && (
                                    <span className="ml-auto text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                        {formData.invitees.length} selected
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-h-0">
                                <AllUsersList onSelectionChange={onInviteChange} />
                            </div>
                        </div>
                    </div>

                    {/* Footer: Error + Submit */}
                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-700/50">
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
                            disabled={loading}
                            className="w-full text-white bg-blue-600 hover:bg-blue-500
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       rounded-lg text-sm font-medium px-5 py-2.5
                                       transition-colors duration-150"
                        >
                            {loading ? 'Creating…' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupUI;
