'use client';

import ChatList from '@/components/ChatList/ChatList';
import PostList from '@/components/PostList/PostList';
import Popup from '@/components/Popup/Popup';
import { useState } from 'react';
import PostForm from '@/components/PostForm/PostForm';
import EventsList from '@/components/EventsList/EventsList';

export default function SocialFeed() {
    const [isPostFormPopupOpen, setIsPostFormPopupOpen] = useState(false);
    const [isChatListPopupOpen, setIsChatListPopupOpen] = useState(false); // TODO: Need to Create ChatList Popup
    const [isEventsListPopupOpen, setIsEventsListPopupOpen] = useState(false); // TODO: Need to Create EventsList Popup

    return (
        <div className="flex w-full h-full mt-[10vh]">
            {/* Left column - 17.5% */}
            <div className="w-[17.5%] bg-gray-900 flex flex-col gap-2 fixed h-[90%]">
                <ChatList
                    chats={[
                        { id: '1', name: 'Alice', lastMessage: 'Hello!' },
                        { id: '2', name: 'Bob', lastMessage: 'How are you?' },
                        { id: '3', name: 'Charlie', lastMessage: 'See you later.' },
                        { id: '4', name: 'Diana', lastMessage: 'Let’s meet tomorrow.' },
                        { id: '5', name: 'Ethan', lastMessage: 'Can you call me?' },
                        { id: '6', name: 'Fiona', lastMessage: 'Got the files, thanks!' },
                        { id: '7', name: 'George', lastMessage: 'Where are you?' },
                        { id: '8', name: 'Hannah', lastMessage: 'Lunch at 1?' },
                        { id: '9', name: 'Ivan', lastMessage: 'I’ll check and let you know.' },
                        { id: '10', name: 'Julia', lastMessage: 'Awesome work today!' },
                        { id: '11', name: 'Kevin', lastMessage: 'I’ll be there in 10.' },
                        { id: '12', name: 'Laura', lastMessage: 'Don’t forget the meeting.' },
                        { id: '13', name: 'Mike', lastMessage: 'That sounds great!' },
                        { id: '14', name: 'Nina', lastMessage: 'Thanks for the update.' },
                        { id: '15', name: 'Oscar', lastMessage: 'Can we reschedule?' },
                        { id: '16', name: 'Paula', lastMessage: 'See you at the event.' },
                    ]}
                    popupHandler={() => setIsChatListPopupOpen(false)}
                />
            </div>

            {/* Middle column - 52.5% */}
            <div className="w-[52.5%] bg-gray-900 ml-[17.5%] fixed h-[90%]">
                <PostList popupHandler={() => setIsPostFormPopupOpen(true)} />
            </div>

            {/* Right column - 30% */}
            <div className="w-[30%] bg-gray-900 fixed h-[90%] right-0">
                <EventsList popupHandler={() => setIsEventsListPopupOpen(false)} />
            </div>

            

            {/* Popups */}
            <Popup isOpen={isPostFormPopupOpen} onClose={() => setIsPostFormPopupOpen(false)} className='max-w-6xl'>
                <PostForm />
            </Popup>
        </div>
    );
}
