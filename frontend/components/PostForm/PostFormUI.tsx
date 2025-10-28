'use client';

import React from 'react';
import { useState } from 'react';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';
import ImageInputField from '../ImageInputField/ImageInputField';
import SelectInput from '../SelectInput/SelectInput';
import SearchInput from '../SearchInput/SearchInput';
import FollowerCard from '../FollowerCard/FollowerCard';

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
        field: string | number,
    ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const selectInputOptions = [
    { optionText: 'Public', optionValue: 1 },
    { optionText: 'Followers Only', optionValue: 2 },
    { optionText: 'Private', optionValue: 3 },
];

const PostFormUI: React.FC<PostFormUIProps> = ({ formData, error, onInputChange, onSubmit }) => {
    const [isVisible, setIsVisible] = useState(false);

    const followers = [
        { id: 1, username: 'John Doe', description: 'Follows you', avatarUrl: '/avatars/john.jpg' },
        {
            id: 2,
            username: 'Jane Smith',
            description: 'Follows you',
            avatarUrl: '/avatars/jane.jpg',
        },
        {
            id: 3,
            username: 'Alice Johnson',
            description: 'Follows you',
            avatarUrl: '/avatars/alice.jpg',
        },
        { id: 4, username: 'Bob Brown', description: 'Follows you', avatarUrl: '/avatars/bob.jpg' },
        {
            id: 5,
            username: 'Charlie Davis',
            description: 'Follows you',
            avatarUrl: '/avatars/charlie.jpg',
        },
        {
            id: 6,
            username: 'Emily Wilson',
            description: 'Follows you',
            avatarUrl: '/avatars/emily.jpg',
        },
        {
            id: 7,
            username: 'Frank Miller',
            description: 'Follows you',
            avatarUrl: '/avatars/frank.jpg',
        },
        {
            id: 8,
            username: 'Grace Lee',
            description: 'Follows you',
            avatarUrl: '/avatars/grace.jpg',
        },
        {
            id: 9,
            username: 'Henry Scott',
            description: 'Follows you',
            avatarUrl: '/avatars/henry.jpg',
        },
        {
            id: 10,
            username: 'Ivy Adams',
            description: 'Follows you',
            avatarUrl: '/avatars/ivy.jpg',
        },
    ];

    return (
        <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden dark:bg-gray-900">
            <div className="flex justify-center gap-5 items-center h-[7.5%] pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
                <Title text="Create New Post" />
            </div>
            <div className="h-[92.5%] overflow-y-auto hide-scrollbar p-6">
                <form onSubmit={onSubmit} className="flex flex-col w-full h-full">
                    <div className="flex flex-col md:flex-row gap-6 h-full">
                        <div className="flex-1 h-[90%] bg-gray-900">
                            <SelectInput
                                selectOptions={selectInputOptions}
                                selectedOption={selectInputOptions[0]}
                                onChange={(option) => {
                                    formData.postType = option.optionValue;
                                    onInputChange('postType');
                                    setIsVisible(formData.postType === 3);
                                }}
                            />
                            <div>
                                {isVisible && (
                                    <div>
                                        <SearchInput
                                            onSearch={(query) => {
                                                console.log('Searching for:', query);
                                            }}
                                        />
                                        <div className="max-w-md mx-auto mt-5 space-y-2">
                                            {followers.map((follower) => (
                                                <FollowerCard
                                                    key={follower.id}
                                                    username={follower.username}
                                                    description={follower.description}
                                                    avatarUrl={follower.avatarUrl}
                                                    onCheckChange={(checked) =>
                                                        console.log(
                                                            `${follower.username} checked:`,
                                                            checked,
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="hidden md:block w-px bg-gray-300 dark:bg-gray-600 h-[95%]"></div>

                        {/* Left column: stacked inputs */}
                        <div className="flex-1 flex flex-col h-[90%]">
                            <div className="h-[25%]">
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
                            </div>

                            <div className="flex-1 w-full h-[75%]">
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium text-gray-900 dark:text-white h-[10%]"
                                >
                                    Post Content
                                </label>
                                <textarea
                                    id="message"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white resize-none h-[90%]"
                                    placeholder="Your post content..."
                                    value={formData.content}
                                    onChange={onInputChange('content')}
                                ></textarea>
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="hidden md:block w-px bg-gray-300 dark:bg-gray-600 h-[95%]"></div>

                        {/* Right column: image input */}
                        <div className="flex-1 h-[90%]">
                            <ImageInputField showPreview={true} />
                        </div>
                    </div>

                    {/* Full-width submit button */}
                    <div className="mt-auto h-[10%]">
                        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                        <button
                            type="submit"
                            className="cursor-pointer w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                        >
                            Submit Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostFormUI;
