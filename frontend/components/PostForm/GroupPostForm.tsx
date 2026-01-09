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

        try {
            const res = await fetch('http://localhost:8080/api/groups/posts/create', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupId,
                    title: formData.title,
                    text: formData.text,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Failed to create group post');
            }

            onSubmit?.();
            setFormData({ title: '', text: '' });
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
