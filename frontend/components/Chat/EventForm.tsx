'use client';

import React, { useState } from 'react';
import InputField from '../General/InputField';
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

        // Validate event time is in the future (compare in UTC)
        const selectedDate = new Date(eventTime);
        const nowUTC = new Date();
        if (selectedDate.getTime() <= nowUTC.getTime()) {
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
        <div className="bg-slate-900 rounded-xl shadow-md border border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-1.5 border-b border-slate-700 flex justify-center">
                <h2 className="text-base sm:text-lg font-semibold text-gray-100">Create Event</h2>
            </div>

            <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <label className="text-sm font-semibold text-gray-300 mb-2 block">
                                Date and Time
                            </label>
                            <input
                                type="datetime-local"
                                value={eventTime}
                                onChange={(e) => setEventTime(e.target.value)}
                                // min={new Date().toISOString().slice(0, 16)} // Add this line
                                // required
                                className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Event description (max 500 characters)"
                            maxLength={500}
                            required
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 resize-none transition-colors"
                        />
                        <p className="text-gray-400 text-xs mt-1">{description.length}/500</p>
                    </div>

                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-slate-800 text-gray-200 rounded-lg border border-slate-600 hover:bg-slate-700 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-white font-semibold text-sm rounded-lg transition-all duration-200 cursor-pointer bg-blue-700 hover:bg-blue-600 active:scale-95 focus:ring-4 focus:outline-none focus:ring-blue-800 shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventForm;
