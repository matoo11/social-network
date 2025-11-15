'use client';

import ChatList from '@/components/ChatList/ChatList';
import PostList from '@/components/PostList/PostList';
import Popup from '@/components/Popup/Popup';
import { useState } from 'react';
import PostForm from '@/components/PostForm/PostForm';
import EventsList from '@/components/EventsList/EventsList';
import EventCalendar from '@/components/EventCalendar/EventCalendar';
import ChatArea from '@/components/ChatArea/ChatArea';
import PostContent from '@/components/PostContent/PostContent';

export default function SocialFeed() {
    const [chatWith, setChatWith] = useState<string>('');
    const [chatter, setChatter] = useState<string>('');
    const [isPostFormPopupOpen, setIsPostFormPopupOpen] = useState(false);
    const [isChatListPopupOpen, setIsChatListPopupOpen] = useState(false);
    const [isChatAreaPopupOpen, setIsChatAreaPopupOpen] = useState(false);
    const [isEventsListPopupOpen, setIsEventsListPopupOpen] = useState(false); // TODO: Need to Create EventsList Popup
    const [postListRefreshFn, setPostListRefreshFn] = useState<() => void>();
    const [isPostContentPopupOpen, setPostContentPopup] = useState(false);
    const [selectedPostID, setSelectedPostID] = useState<number>(0);

    const handleNewPostCreated = () => {
        if (postListRefreshFn) {
            postListRefreshFn(); // refresh PostList
        }
    };

    return (
        <div className="flex w-full h-full mt-[10vh]">
            {/* Left column - 17.5% */}
            <div className="w-[17.5%] bg-gray-900 flex flex-col gap-2 fixed h-[90%]">
                <ChatList
                    chats={[
                        { id: '1', username: 'Alice', lastMessage: 'Hello!' },
                        { id: '2', username: 'Bob', lastMessage: 'How are you?' },
                        { id: '3', username: 'Charlie', lastMessage: 'See you later.' },
                        { id: '4', username: 'Diana', lastMessage: 'Let’s meet tomorrow.' },
                        { id: '5', username: 'Ethan', lastMessage: 'Can you call me?' },
                        { id: '6', username: 'Fiona', lastMessage: 'Got the files, thanks!' },
                        { id: '7', username: 'George', lastMessage: 'Where are you?' },
                        { id: '8', username: 'Hannah', lastMessage: 'Lunch at 1?' },
                        { id: '9', username: 'Ivan', lastMessage: 'I’ll check and let you know.' },
                        { id: '10', username: 'Julia', lastMessage: 'Awesome work today!' },
                        { id: '11', username: 'Kevin', lastMessage: 'I’ll be there in 10.' },
                        { id: '12', username: 'Laura', lastMessage: 'Don’t forget the meeting.' },
                        { id: '13', username: 'Mike', lastMessage: 'That sounds great!' },
                        { id: '14', username: 'Nina', lastMessage: 'Thanks for the update.' },
                        { id: '15', username: 'Oscar', lastMessage: 'Can we reschedule?' },
                        { id: '16', username: 'Paula', lastMessage: 'See you at the event.' },
                    ]}
                    popupHandler={() => setIsChatListPopupOpen(true)}
                    onSelectChat={(username) => {
                        console.log('Selected chat with:', username);
                        setIsChatAreaPopupOpen(true);
                        setChatWith(username);
                        setChatter('Admin'); // Assuming 'Admin' is the current user
                    }}
                />
            </div>

            {/* Middle column - 52.5% */}
            <div className="w-[52.5%] bg-gray-900 ml-[17.5%] fixed h-[90%]">
                <PostList
                    popupHandler={() => setIsPostFormPopupOpen(true)}
                    onRef={(refreshFn) => setPostListRefreshFn(() => refreshFn)}
                    postContentPopupHandler={(postID: number) => {
                        console.log('Open post content popup for post ID:', postID);
                        setPostContentPopup(true);
                    }}
                />
            </div>

            {/* Right column - 30% */}
            <div className="w-[30%] bg-gray-900 fixed h-[90%] right-0">
                <EventsList popupHandler={() => setIsEventsListPopupOpen(false)} />
            </div>

            {/* Popups */}
            <Popup
                isOpen={isPostFormPopupOpen}
                onClose={() => setIsPostFormPopupOpen(false)}
                className="max-w-6xl"
            >
                <PostForm
                    onSubmit={() => {
                        setIsPostFormPopupOpen(false);
                        handleNewPostCreated();
                    }}
                />
            </Popup>
            <Popup
                isOpen={isChatAreaPopupOpen}
                onClose={() => setIsChatAreaPopupOpen(false)}
                className="max-w-3xl"
            >
                <ChatArea chatWith={chatWith} chatter={chatter} />
            </Popup>

            <Popup
                isOpen={isPostContentPopupOpen}
                onClose={() => {
                    setPostContentPopup(false);
                    setSelectedPostID(0);
                }}
                className="max-w-9xl"
            >
                <PostContent postID={selectedPostID} />
            </Popup>
        </div>
    );
}
