'use client';

import React, { useState } from 'react';
import InputField from '../InputField/InputField';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

type EventFormProps = {
    groupId: number;
    onEventCreated: () => void;
    onCancel: () => void;
};

const EventForm: React.FC<EventFormProps> = ({ groupId, onEventCreated, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim() || !description.trim() || !eventTime) {
            setError('All fields are required');
            return;
        }

        if (title.length > 100) {
            setError('Title must be 100 characters or less');
            return;
        }

        if (description.length > 500) {
            setError('Description must be 500 characters or less');
            return;
        }

        // Add this validation
        const selectedDate = new Date(eventTime);
        const now = new Date();
        if (selectedDate < now) {
            setError('Event date and time must be in the future');
            return;
        }

        setIsSubmitting(true);

        try {
            // Convert local datetime to RFC3339 format
            const localDate = new Date(eventTime);
            const eventTimeRFC3339 = localDate.toISOString();

            const response = await fetchWithAuth('http://localhost:8080/api/groups/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    groupId,
                    title: title.trim(),
                    description: description.trim(),
                    eventTime: eventTimeRFC3339,
                }),
            });

            if (!response.ok) {
                // Try to extract error message from response
                let errorMessage = 'Failed to create event';

                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType?.includes('application/json')) {
                        const errorData = await response.json();
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
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    }
                } catch {
                    // If parsing fails, use default message
                }

                setError(errorMessage);
                return;
            }

            onEventCreated();
            setTitle('');
            setDescription('');
            setEventTime('');
        } catch (err) {
            console.error('Error creating event:', err);
            setError(err instanceof Error ? err.message : 'Failed to create event');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Create Event</h2>

            {error && <div className="bg-red-900 text-red-200 p-3 rounded-md text-sm">{error}</div>}

            <div>
                <InputField
                    htmlFor="title"
                    labelText="Title"
                    inputType="text"
                    inputName="title"
                    inputID="title"
                    inputValue={title}
                    onInputChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTitle(e.target.value)
                    }
                    placeholderText="Event title (max 100 characters)"
                    isRequired={true}
                />
                <p className="text-gray-400 text-xs mt-1">{title.length}/100</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Event description (max 500 characters)"
                    maxLength={500}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-400 text-xs mt-1">{description.length}/500</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date and Time
                </label>
                <input
                    type="datetime-local"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)} // Add this line
                    required
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex gap-2 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
            </div>
        </form>
    );
};

export default EventForm;
