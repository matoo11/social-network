'use clinet';

import React from 'react';
import { useState } from 'react';
import PostFormUI from './PostFormUI';

type PostFormProps = {
    onSubmit?: () => void;
};

const PostForm: React.FC<PostFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imgageUrl: '',
        postType: 1,
        privateUsers: [] as number[],
    });
    const [error, setError] = useState('');

    const handleInputChange =
        (field: string) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            let value: any = e.target.value;

            if (field === 'postType') {
                // Convert number field
                value = parseInt(value, 10);
            }

            if (field === 'privateUsers') {
                // Assume multi-select <select multiple>
                const select = e.target as HTMLSelectElement;
                value = Array.from(select.selectedOptions).map((o) => parseInt(o.value, 10));
            }

            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // console.log('Form data on submit:', formData);

        const formDataa = new FormData();
        const postDataa = {
            title: formData.title,
            message: formData.content,
            typeId: formData.postType,
            privateUsers: formData.privateUsers,
        };
        formDataa.append('data', JSON.stringify(postDataa));

        const fileInput = document.querySelector<HTMLInputElement>('#file_input');
        if (fileInput && fileInput.files?.length) {
            formDataa.append('image', fileInput.files[0]);
        }

        try {
            console.log(postDataa);
            await handleCreatePost(formDataa);
            onSubmit?.(); // notify parent if callback provided
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };

    // TODO: Need to handle guest when creating post (disable form or redirect to login)
    async function handleCreatePost(formData: FormData) {
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/createPost', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to create post');
            }

            //   router.push('/login');
        } catch (err: unknown) {
            console.error('Error creating post:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    }

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
