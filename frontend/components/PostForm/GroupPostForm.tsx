'use client';

import React, { useState } from 'react';
import GroupPostFormUI from './GroupPostFormUI';

type GroupPostFormProps = {
    groupId: number;
    onSubmit?: () => void;
};

const GroupPostForm: React.FC<GroupPostFormProps> = ({ groupId, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        text: '',
    });

    const [error, setError] = useState('');

    const handleInputChange =
        (field: 'title' | 'text') =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData((prev) => ({
                ...prev,
                [field]: e.target.value,
            }));
        };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        // Frontend validation
        const title = formData.title.trim();
        const text = formData.text.trim();

        if (!title) {
            setError('Title is required');
            return;
        }

        if (title.length > 30) {
            setError('Title must be 30 characters or less');
            return;
        }

        if (!text) {
            setError('Post text is required');
            return;
        }

        if (text.length > 2000) {
            setError('Post text must be 2000 characters or less');
            return;
        }

        const formDataPayload = new FormData();
        const postData = {
            groupId,
            title: formData.title,
            text: formData.text,
        };
        formDataPayload.append('data', JSON.stringify(postData));

        // Handle image upload
        const fileInput = document.querySelector<HTMLInputElement>('#file_input');
        if (fileInput && fileInput.files?.length) {
            formDataPayload.append('image', fileInput.files[0]);
        }

        try {
            const res = await fetchWithAuth('http://localhost:8080/api/groups/posts/create', {
                method: 'POST',
                credentials: 'include',
                body: formDataPayload,
            });

            if (!res.ok) {
                // Try to extract error message from response
                let errorMessage = 'Failed to create group post';
                
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
                    }
                } catch {
                    // If parsing fails, use default message
                }
                
                setError(errorMessage);
                return;
            }

            onSubmit?.();
            setFormData({ title: '', text: '' });
            
            // Clear the file input
            if (fileInput) {
                fileInput.value = '';
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unexpected error');
        }
    };

    return (
        <GroupPostFormUI
            formData={formData}
            error={error}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
        />
    );
};

export default GroupPostForm;
