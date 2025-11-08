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
        <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden dark:bg-gray-900">
            <div className="flex justify-center gap-5 items-center h-[7.5%] pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
                <Title text="Events" />
                <PopupBtn className="mb-2" onClick={popupHandler} />
            </div>
            <div className="h-[92.5%] overflow-y-auto hide-scrollbar">
                <EventCalendar />
            </div>
        </div>
    );
};

export default EventsList;
