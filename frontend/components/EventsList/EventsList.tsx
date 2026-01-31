'use client';

import React from 'react';
import Title from '../Title/Title';
import PopupBtn from '../PopupBtn/PopupBtn';
import EventCalendar from '../EventCalendar/EventCalendar';
import AgendaList from '../AgendaList/AgendaList';

type EventsListProps = {
    popupHandler: () => void;
};

const EventsList: React.FC<EventsListProps> = ({ popupHandler }) => {
    return (
        <div className="flex flex-col h-full w-full border-2 border-gray-600 rounded-lg shadow-sm overflow-hidden bg-gray-900">
            <div className="flex flex-shrink-0 justify-center gap-5 items-center pt-3 pb-3 px-4 border-b-2 border-gray-600 shadow-sm overflow-hidden bg-gray-900">
                <Title text="Events" />
                <PopupBtn className="mb-2" onClick={popupHandler} />
            </div>
            <div className="flex-1">
                <EventCalendar />
            </div>
        </div>
    );
};

export default EventsList;
