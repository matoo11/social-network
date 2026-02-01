'use client';

import React, { useState } from 'react';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';
import ImageInputField from '../ImageInputField/ImageInputField';
import SelectInput from '../SelectInput/SelectInput';
import FollowersList from '../FollowersList/FollowersList';

type FormData = {
    title: string;
    content: string;
    imgageUrl?: string;
    postType: number;
    privateUsers?: number[];
};

type PostFormUIProps = {
    formData: FormData;
    error: string;
    onInputChange: (
        field: keyof FormData,
    ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const POST_TYPE_OPTIONS = [
    { optionText: 'Public', optionValue: 1 },
    { optionText: 'Followers Only', optionValue: 2 },
    { optionText: 'Private', optionValue: 3 },
];

const PRIVATE_POST_TYPE = 3;

const PostFormUI: React.FC<PostFormUIProps> = ({ formData, error, onInputChange, onSubmit }) => {
    const [showPrivateUsersList, setShowPrivateUsersList] = useState(false);

    const handlePostTypeChange = (option: { optionText: string; optionValue: number }) => {
        formData.postType = option.optionValue;
        onInputChange('postType');
        setShowPrivateUsersList(option.optionValue === PRIVATE_POST_TYPE);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 px-6 py-2 border-b border-gray-200 dark:border-slate-700 flex justify-center">
                <Title text="Create New Post" />
            </div>

            {/* Form Container */}
            <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
                <form onSubmit={onSubmit} className="space-y-5">
                    {/* Post Type & Private Users Section */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
                        <SelectInput
                            selectOptions={POST_TYPE_OPTIONS}
                            selectedOption={POST_TYPE_OPTIONS[0]}
                            selectLabel="Post Privacy"
                            className="!max-w-none"
                            onChange={handlePostTypeChange}
                        />

                        {/* Private Users List - Conditional Render */}
                        {showPrivateUsersList && (
                            <div className="border border-gray-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-700">
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    Select Users
                                </p>
                                <FollowersList
                                    onSelectionChange={(selectedIDs) => {
                                        formData.privateUsers = selectedIDs;
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Title Input */}
                    <div>
                        <InputField
                            htmlFor="title"
                            labelText="Post Title"
                            inputType="text"
                            inputName="title"
                            inputID="title"
                            inputValue={formData.title}
                            onInputChange={onInputChange('title')}
                            placeholderText="What's on your mind?"
                            isRequired={true}
                        />
                    </div>

                    {/* Content & Image Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Content - Takes 2 columns on large screens */}
                        <div className="lg:col-span-2 flex flex-col">
                            <label
                                htmlFor="message"
                                className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Post Content
                            </label>
                            <textarea
                                id="message"
                                className="flex-1 min-h-32 bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 dark:bg-slate-800 dark:border-slate-600 dark:placeholder-gray-500 dark:text-gray-100 resize-none transition-colors"
                                placeholder="Share your thoughts, photos, and news..."
                                value={formData.content}
                                onChange={onInputChange('content')}
                            />
                        </div>

                        {/* Image Input */}
                        <div className="lg:col-span-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                Add Image
                            </label>
                            <ImageInputField showPreview={true} />
                        </div>
                    </div>

                    {/* Footer: Error & Submit Button */}
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                                    {error}
                                </p>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full px-4 py-2.5 text-white font-semibold text-sm rounded-lg transition-all duration-200 cursor-pointer bg-blue-600 hover:bg-blue-700 active:scale-95 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-blue-800 shadow-sm hover:shadow-md"
                        >
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostFormUI;
