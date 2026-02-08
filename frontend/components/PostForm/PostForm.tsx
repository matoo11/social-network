'use client';

import React from 'react';
import { useState } from 'react';
import PostFormUI from './PostFormUI';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

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
        setError('');

        // Frontend validation
        const title = formData.title.trim();
        const content = formData.content.trim();

        if (!title) {
            setError('Title is required');
            return;
        }

        if (title.length > 60) {
            setError('Title must be 60 characters or less');
            return;
        }

        if (!content) {
            setError('Message is required');
            return;
        }

        if (content.length > 600) {
            setError('Message must be 600 characters or less');
            return;
        }

        if (formData.postType === 3 && formData.privateUsers.length === 0) {
            setError('Please select at least one user for private posts');
            return;
        }

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

        console.log(postDataa);
        const success = await handleCreatePost(formDataa);
        if (success) {
            onSubmit?.();
        }
    };

    async function handleCreatePost(formData: FormData): Promise<boolean> {
        setError('');

        try {
            const res = await fetchWithAuth('http://localhost:8080/api/createPost', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!res.ok) {
                // Try to extract error message from response
                let errorMessage = 'Failed to create post';
                
                try {
                    const contentType = res.headers.get('content-type');
                    if (contentType?.includes('application/json')) {
                        const errorData = await res.json();
                        // Handle different error response formats
                        if (errorData.message) {
                            errorMessage = errorData.message;
                        } else if (errorData.error) {
                            errorMessage = errorData.error;
                            // If there are field-specific errors, append them
                            if (errorData.fields) {
                                const fieldErrors = Object.entries(errorData.fields)
                                    .map(([field, msg]) => `${field}: ${msg}`)
                                    .join(', ');
                                errorMessage += ` - ${fieldErrors}`;
                            }
                        }
                    } else {
                        const errorText = await res.text();
                        errorMessage = errorText || errorMessage;
                        console.log("here")
                    }
                } catch {
                    // If parsing fails, use default message
                }
                
                setError(errorMessage);
                return false;
            }
            return true;
        } catch (err: unknown) {
            console.error('Error creating post:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
            return false;
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
