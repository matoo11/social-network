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
import { useEffect } from 'react';

export default function SocialFeed() {
    const [chatWith, setChatWith] = useState<string>('');
    const [chatter, setChatter] = useState<string>('');
    const [chatID, setchatID] = useState<string>('');
    const [isPostFormPopupOpen, setIsPostFormPopupOpen] = useState(false);
    const [isChatListPopupOpen, setIsChatListPopupOpen] = useState(false);
    const [isChatAreaPopupOpen, setIsChatAreaPopupOpen] = useState(false);
    const [isEventsListPopupOpen, setIsEventsListPopupOpen] = useState(false); // TODO: Need to Create EventsList Popup
    const [postListRefreshFn, setPostListRefreshFn] = useState<() => void>();
    const [isPostContentPopupOpen, setPostContentPopup] = useState(false);
    const [selectedPostID, setSelectedPostID] = useState<number>(0);
    const [chatsData, setChatsData] = useState([]);

    useEffect(() => {
        const loadChats = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/getFollowers", {
                    credentials: 'include',
                });
                const data = await res.json();
                // setChatsData(data);
                const mapped = data.map((item: any) => ({
                    id: String(item.FollowerID),        // or whatever your backend sends
                    username: item.FollowerUsername,    // match your API field
                    lastMessage: item.last_message || '' // fallback if backend doesn't send
                }));

                setChatsData(mapped);
                // console.log(mapped)
            } catch (err) {
                console.error(err);
            }
        };

        loadChats();
    }, []);


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
                    chats={chatsData}
                    popupHandler={() => setIsChatListPopupOpen(true)}
                    onSelectChat={(id, username) => {
                        setIsChatAreaPopupOpen(true);
                        setchatID(id);
                        console.log(id)
                        setChatWith(username);
                        setChatter("Me");
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
                        setSelectedPostID(postID);
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
                <ChatArea chatWith={chatWith} chatter={chatter} chatID={chatID} />

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
