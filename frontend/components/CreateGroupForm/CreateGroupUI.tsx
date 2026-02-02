'use client';

import React from 'react';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';
import AllUsersList from '../AllUsersList/AllUsersList';

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
        <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden dark:bg-gray-900">
            {/* Header */}
            <div className="flex justify-center items-center h-[7.5%] pt-2 border-b-2 border-gray-600">
                <Title text="Create New Group" />
            </div>

            <div className="h-[92.5%] p-6">
                <form onSubmit={onSubmit} className="flex flex-col h-full">
                    <div className="flex gap-6 flex-1">
                        {/* Left: Group Info */}
                        <div className="flex-1 flex flex-col gap-4">
                            <InputField
                                htmlFor="title"
                                labelText="Group Title"
                                inputType="text"
                                inputName="title"
                                inputID="title"
                                inputValue={formData.title}
                                onInputChange={onInputChange('title')}
                                placeholderText="Group title"
                                isRequired
                            />

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-white mb-1">
                                    Group Description
                                </label>
                                <textarea
                                    className="bg-gray-700 border border-gray-500 text-white text-sm rounded-lg
                                               focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                                               resize-none h-full"
                                    placeholder="Describe the group..."
                                    value={formData.description}
                                    onChange={onInputChange('description')}
                                />
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="w-px bg-gray-600"></div>

                        {/* Right: Invite Members */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="text-sm font-medium text-white mb-2">
                                Invite Members
                            </h3>
                            <AllUsersList onSelectionChange={onInviteChange} />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-4">
                        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white bg-blue-600 hover:bg-blue-700
                                       disabled:opacity-50 rounded-lg text-sm px-5 py-2.5"
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
