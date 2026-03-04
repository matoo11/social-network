'use client';

import React, { useState } from 'react';
import CreateGroupUI from './CreateGroupUI';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

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
        
        // Frontend validation
        const title = formData.title.trim();
        const description = formData.description.trim();

        if (!title) {
            setError('Group title is required');
            return;
        }

        if (title.length > 100) {
            setError('Group title must be 100 characters or less');
            return;
        }

        if (!description) {
            setError('Group description is required');
            return;
        }

        if (description.length > 500) {
            setError('Group description must be 500 characters or less');
            return;
        }

        setLoading(true);

        try {
            // 1️⃣ Create group
            const res = await fetchWithAuth('http://localhost:8080/api/groups/create', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                }),
            });

            if (!res.ok) {
                // Try to extract error message from response
                let errorMessage = 'Failed to create group';
                
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

            const group = await res.json(); // contains GroupID
            console.log(group)
            // 2️⃣ Send invites (fire & forget or await all)
            const inviteResults = await Promise.allSettled(
                formData.invitees.map((userId) =>
                    fetchWithAuth('http://localhost:8080/api/groups/invite', {
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

            // Check if any invites failed
            const failedInvites = inviteResults.filter(r => r.status === 'rejected');
            if (failedInvites.length > 0) {
                console.warn(`${failedInvites.length} invite(s) failed`);
            }

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
