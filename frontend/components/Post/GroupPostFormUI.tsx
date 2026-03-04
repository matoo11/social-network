'use client';

import React from 'react';
import Title from '../General/Title';
import InputField from '../General/InputField';
import ImageInputField from '../General/ImageInputField';

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
        <div className="bg-slate-900 rounded-xl shadow-md border border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-2 border-b border-slate-700 flex justify-center">
                <Title text="Create Group Post" />
            </div>

            <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <InputField
                            htmlFor="title"
                            labelText="Post Title"
                            inputType="text"
                            inputName="title"
                            inputID="title"
                            inputValue={formData.title}
                            onInputChange={onInputChange('title')}
                            placeholderText="Post title (max 30 chars)"
                            isRequired
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 flex flex-col">
                            <label
                                htmlFor="text"
                                className="text-sm font-semibold text-gray-300 mb-2"
                            >
                                Post Content
                            </label>
                            <textarea
                                id="text"
                                className="flex-1 min-h-32 border-2 border-slate-600 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 bg-slate-800 placeholder-gray-500 text-gray-100 resize-none transition-colors"
                                placeholder="Write something… (max 2000 chars)"
                                value={formData.text}
                                onChange={onInputChange('text')}
                                required
                            />
                        </div>

                        <div className="lg:col-span-1">
                            <label className="text-sm font-semibold text-gray-300 mb-2 block">
                                Add Image
                            </label>
                            <ImageInputField showPreview={true} />
                        </div>
                    </div>

                    {/* Footer: Error & Submit Button */}
                    <div className="space-y-3 pt-4 border-t border-slate-700">
                        {error && (
                            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full px-4 py-2.5 text-white font-semibold text-sm rounded-lg transition-all duration-200 cursor-pointer active:scale-95 focus:ring-4 focus:outline-none bg-blue-700 hover:bg-blue-600 focus:ring-blue-800 shadow-sm hover:shadow-md"
                        >
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GroupPostFormUI;
