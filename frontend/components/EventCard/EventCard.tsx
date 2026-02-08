'use client';

import React, { useState } from 'react';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

export type EventData = {
    eventId: number;
    groupId: number;
    title: string;
    description: string;
    eventTime: string;
    creatorId: number;
    responses: {
        optionId: number;
        optionName: string;
        count: number;
    }[];
    userChoiceId: number | null;
};

type EventCardProps = {
    event: EventData;
    onResponseUpdated: () => void;
};

const EventCard: React.FC<EventCardProps> = ({ event, onResponseUpdated }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleResponse = async (optionId: number) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetchWithAuth('http://localhost:8080/api/groups/events/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    eventId: event.eventId,
                    optionId: optionId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to respond to event');
            }

            onResponseUpdated();
        } catch (error) {
            console.error('Error responding to event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatEventTime = (timeStr: string) => {
        const date = new Date(timeStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
            <p className="text-gray-300 text-sm mb-3">{event.description}</p>
            <p className="text-gray-400 text-sm mb-4">
                📅 {formatEventTime(event.eventTime)}
            </p>

            <div className="flex gap-2 flex-wrap">
                {event.responses.map((option) => {
                    const isSelected = event.userChoiceId === option.optionId;
                    return (
                        <button
                            key={option.optionId}
                            type="button"
                            onClick={() => handleResponse(option.optionId)}
                            disabled={isSubmitting}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                                isSelected
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {option.optionName} ({option.count})
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default EventCard;
