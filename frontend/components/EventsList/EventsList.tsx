'use client';

import React from 'react';
import Title from '../Title/Title';
import PopupBtn from '../PopupBtn/PopupBtn';

type EventItem = {};

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
                <div className="flex flex-col gap-2 p-4 ">{/* Event cards would go here */}</div>
            </div>
        </div>
    );
};

export default EventsList;
