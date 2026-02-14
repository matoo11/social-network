'use client';

import React, { useState, useEffect } from 'react';
import EventCard, { EventData } from '../EventCard/EventCard';
import EventForm from '../EventForm/EventForm';
import PopupBtn from '../PopupBtn/PopupBtn';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

type EventsListProps = {
    groupId: number;
};

const EventsList: React.FC<EventsListProps> = ({ groupId }) => {
    const [events, setEvents] = useState<EventData[]>([]);
    // const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const fetchEvents = async () => {
        // setIsLoading(true);
        try {
            const response = await fetchWithAuth(
                `http://localhost:8080/api/groups/events?groupId=${groupId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            // setIsLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchEvents();
        }
    }, [groupId]);

    useEffect(() => {
        // Listen for real-time event response updates via WebSocket
        const handleEventResponse = (event: CustomEvent) => {
            const data = event.detail;
            // Check if the event response is for this group
            if (data && data.groupId === groupId) {
                console.log('Event response received via WebSocket:', data);
                // Refresh the events list to show updated counts
                fetchEvents();
            }
        };

        window.addEventListener('ws-event-response', handleEventResponse as EventListener);

        return () => {
            window.removeEventListener('ws-event-response', handleEventResponse as EventListener);
        };
    }, [groupId]);

    const handleEventCreated = () => {
        setIsCreating(false);
        fetchEvents();
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden h-full w-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 px-6 py-2 border-b border-gray-200 dark:border-slate-700 flex justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-4 sm:h-5 bg-emerald-500 rounded-full"></div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
                        Group Events
                    </h2>
                    <PopupBtn
                        onClick={() => setIsCreating(!isCreating)}
                        color="emerald"
                        className="h-8"
                        disabled={false}
                        icon={isCreating ? 'minus' : 'plus'}
                    />
                </div>
            </div>

            <div className="p-6 flex-1 min-h-0 flex flex-col">
                {isCreating && (
                    <div className="mb-4 shrink-0">
                        <EventForm
                            groupId={groupId}
                            onEventCreated={handleEventCreated}
                            onCancel={() => setIsCreating(false)}
                        />
                    </div>
                )}

                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 hide-scrollbar">
                    {false ? (
                        <div className="text-center text-gray-400 py-8">Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            No events yet. Create one to get started!
                        </div>
                    ) : (
                        events.map((event) => (
                            <EventCard
                                key={event.eventId}
                                event={event}
                                onResponseUpdated={fetchEvents}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventsList;
