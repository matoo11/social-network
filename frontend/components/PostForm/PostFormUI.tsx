'use client';

import React from 'react';
import { useState } from 'react';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';

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
        field: string,
    ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const PostFormUI: React.FC<PostFormUIProps> = ({ formData, error, onInputChange, onSubmit }) => {
    return (
        <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden dark:bg-gray-900">
            <div className="flex justify-center gap-5 items-center h-[7.5%] pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
                <Title text="Create New Post" />
            </div>
            <div className="h-[92.5%] overflow-y-auto hide-scrollbar">
                <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-4 md:space-y-6">
                    <InputField
                        htmlFor="title"
                        labelText="Post Title"
                        inputType="text"
                        inputName="title"
                        inputID="title"
                        inputValue={formData.title}
                        onInputChange={onInputChange('title')}
                        placeholderText="Post Title"
                        isRequired={true}
                    />
                    <InputField
                        htmlFor="content"
                        labelText="Post Content"
                        inputType="text"
                        inputName="content"
                        inputID="content"
                        inputValue={formData.content}
                        onInputChange={onInputChange('content')}
                        placeholderText="Post Content"
                        isRequired={true}
                    />
                    <InputField
                        htmlFor="imageUrl"
                        labelText="Image URL"
                        inputType="file"
                        inputName="imageUrl"
                        inputID="imageUrl"
                        inputValue={formData.imgageUrl || ''}
                        onInputChange={onInputChange('imageUrl')}
                        placeholderText="Image URL"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                    >
                        Submit Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostFormUI;
