'use client';

import React, { useState } from 'react';
import { FaCalendarAlt, FaCheck, FaTimes, FaQuestion } from 'react-icons/fa';
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
            const response = await fetchWithAuth(
                'http://localhost:8080/api/groups/events/respond',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        eventId: event.eventId,
                        optionId: optionId,
                    }),
                },
            );

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
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 w-full">
            <div className="flex items-start justify-between gap-3 px-4 pt-2.5 pb-1">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white break-words">
                        {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
                        <FaCalendarAlt className="text-[11px] text-emerald-500" />
                        <span>{formatEventTime(event.eventTime)}</span>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-2">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-snug break-words">
                    {event.description}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                {event.responses.map((option) => {
                    const isSelected = event.userChoiceId === option.optionId;
                    const normalized = option.optionName.trim().toLowerCase();
                    const isNotGoing = normalized.includes('not') && normalized.includes('going');
                    const isGoing = !isNotGoing && normalized.includes('going');
                    const Icon = isGoing ? FaCheck : isNotGoing ? FaTimes : FaQuestion;
                    const iconClass = isSelected
                        ? 'text-white/90'
                        : isGoing
                          ? 'text-emerald-400'
                          : isNotGoing
                            ? 'text-rose-400'
                            : 'text-amber-400';
                    const selectedClass = isGoing
                        ? 'bg-emerald-700/80 text-white hover:bg-emerald-700'
                        : isNotGoing
                          ? 'bg-rose-700/80 text-white hover:bg-rose-700'
                          : 'bg-amber-600/80 text-white hover:bg-amber-600';
                    return (
                        <button
                            key={option.optionId}
                            type="button"
                            onClick={() => handleResponse(option.optionId)}
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
                                isSelected
                                    ? selectedClass
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`flex items-center justify-center w-3 h-3 ${iconClass}`}
                            >
                                <Icon className="text-[10px]" />
                            </span>
                            <span className="truncate max-w-[120px]">{option.optionName}</span>
                            <span
                                className={`ml-1 inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                    isSelected
                                        ? 'bg-white/15 text-white'
                                        : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100'
                                }`}
                            >
                                {option.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default EventCard;
