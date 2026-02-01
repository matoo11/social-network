'use client';

import React, { useState, useEffect } from 'react';
import EventCard, { EventData } from '../EventCard/EventCard';
import EventForm from '../EventForm/EventForm';

type EventsListProps = {
    groupId: number;
};

const EventsList: React.FC<EventsListProps> = ({ groupId }) => {
    const [events, setEvents] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/groups/events?groupId=${groupId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
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
        <div className="flex flex-col h-full w-full bg-gray-900 p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Group Events</h2>
                <button
                    type="button"
                    onClick={() => setIsCreating(!isCreating)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                    {isCreating ? 'Cancel' : 'Create Event'}
                </button>
            </div>

            {isCreating && (
                <div className="mb-4">
                    <EventForm
                        groupId={groupId}
                        onEventCreated={handleEventCreated}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3">
                {isLoading ? (
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
    );
};

export default EventsList;
