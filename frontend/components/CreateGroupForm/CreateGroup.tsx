'use client';

import React, { useState } from 'react';
import CreateGroupUI from './CreateGroupUI';

type CreateGroupProps = {
    onSubmit?: () => void;
};

const CreateGroup: React.FC<CreateGroupProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        invitees: [] as number[],
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange =
        (field: 'title' | 'description') =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData((prev) => ({
                ...prev,
                [field]: e.target.value,
            }));
        };

    const handleInviteChange = (ids: number[]) => {
        setFormData((prev) => ({
            ...prev,
            invitees: ids,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1️⃣ Create group
            const res = await fetch('http://localhost:8080/api/groups/create', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to create group');
            }

            const group = await res.json(); // contains GroupID
            console.log(group)
            // 2️⃣ Send invites (fire & forget or await all)
            await Promise.all(
                formData.invitees.map((userId) =>
                    fetch('http://localhost:8080/api/groups/invite', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            groupId: group.groupId,
                            inviteeId: userId,
                        }),
                    }),
                ),
            );

            onSubmit?.();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <CreateGroupUI
            formData={formData}
            error={error}
            loading={loading}
            onInputChange={handleInputChange}
            onInviteChange={handleInviteChange}
            onSubmit={handleSubmit}
        />
    );
};

export default CreateGroup;
