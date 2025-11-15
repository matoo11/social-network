'use clinet';

import React from 'react';
import { useState } from 'react';
import PostFormUI from './PostFormUI';
import { title } from 'process';

type PostFormProps = {
    onSubmit?: () => void;
};

const PostForm: React.FC<PostFormProps> = ({onSubmit}) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imgageUrl: '',
        postType: 1,
        privateUsers: [] as number[],
    });
    const [error, setError] = useState('');

    const handleInputChange =
        (field: string | number) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setFormData((prev) => ({
                ...prev,
                [field]: e.target.value,
            }));
        };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form data on submit:', formData);
        try {
            await handleCreatePost(formData);
            onSubmit?.(); // notify parent if callback provided
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };

    async function handleCreatePost(formData: any) {
        setError('');
        const title = formData.title;
        const message = formData.content;
        const typeId = formData.postType;
        const privateUsers = formData.privateUsers;

        try {
            const res = await fetch('http://localhost:8080/api/createPost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({title, message, typeId}),
            });

            if (!res.ok) {
                throw new Error('Failed to create post');
            }

            //   router.push('/login');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };

    return (
        <PostFormUI
            formData={formData}
            error={error}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
        />
    );
};

export default PostForm;
