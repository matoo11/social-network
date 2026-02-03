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
        <div className="border-2 border-gray-600 rounded-lg shadow-sm dark:bg-gray-900">
            <div className="border-b-2 border-gray-600 p-3">
                <Title text="Create Group Post" />
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
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
                    <label className="block text-sm font-medium text-white mb-1">
                        Post Text
                    </label>
                    <textarea
                        className="w-full h-40 p-2 rounded bg-gray-700 text-white resize-none"
                        value={formData.text}
                        onChange={onInputChange('text')}
                        placeholder="Write something… (max 2000 chars)"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-1">
                        Image (optional)
                    </label>
                    <ImageInputField showPreview={true} />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default GroupPostFormUI;
