import React, { useState } from 'react';
import AgendaList from '../AgendaList/AgendaList';

interface Event {
    id: number;
    title: string;
    time?: string;
}

const EventCalendar: React.FC = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const generateCalendarDays = () => {
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="p-2 text-gray-400"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const thisDate = new Date(currentYear, currentMonth, day);
            const isToday = thisDate.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === thisDate.toDateString();

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(thisDate)}
                    className={`
            flex items-center justify-center h-10 w-10 rounded-full cursor-pointer transition
            ${isSelected ? 'bg-blue-500 text-white' : ''}
            ${!isSelected && isToday ? 'border border-blue-500' : ''}
            ${!isSelected && !isToday ? 'hover:bg-blue-100 dark:hover:bg-gray-700' : ''}
          `}
                >
                    {day}
                </div>,
            );
        }

        return days;
    };

    // Example event data
    const events: Record<string, Event[]> = {
        [today.toDateString()]: [
            { id: 1, title: 'Team Meeting', time: '10:00 AM' },
            { id: 2, title: 'Lunch with Sarah', time: '1:00 PM' },
        ],
        [new Date(currentYear, currentMonth, 15).toDateString()]: [
            { id: 3, title: 'Project Deadline' },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-start gap-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={prevMonth}
                        className="cursor-pointer px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        ←
                    </button>

                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {currentDate.toLocaleString('default', { month: 'long' })} {currentYear}
                    </h2>

                    <button
                        onClick={nextMonth}
                        className="cursor-pointer px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        →
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {weekdays.map((day) => (
                        <div key={day}>{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">{generateCalendarDays()}</div>
            </div>

            {/* Show events for the selected date */}
            <AgendaList date={selectedDate} events={events} />
        </div>
    );
};

export default EventCalendar;
