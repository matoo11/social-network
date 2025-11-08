import React from "react";

interface Event {
  id: number;
  title: string;
  time?: string; // optional
}

interface AgendaListProps {
  date: Date | null;
  events: Record<string, Event[]>; // key: date string like 'Mon Nov 08 2025'
}

const AgendaList: React.FC<AgendaListProps> = ({ date, events }) => {
  if (!date) {
    return (
      <div className="text-gray-500 dark:text-gray-400 mt-4 text-center">
        Select a date to view events
      </div>
    );
  }

  const dateKey = date.toDateString();
  const dayEvents = events[dateKey] || [];

  return (
    <div className="p-4 bg-white dark:bg-gray-800 w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Events on {dateKey}
      </h3>

      {dayEvents.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No events for this day.</p>
      ) : (
        <ul className="space-y-2">
          {dayEvents.map((event) => (
            <li
              key={event.id}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <span className="font-medium">{event.title}</span>
              {event.time && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {event.time}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AgendaList;
