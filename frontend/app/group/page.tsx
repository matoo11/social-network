'use client';

import GroupList from '@/components/ChatList/GroupList';
import PostList from '@/components/PostList/PostList';
import Popup from '@/components/Popup/Popup';
import { useState } from 'react';
import PostForm from '@/components/PostForm/PostForm';
import EventsList from '@/components/EventsList/EventsList';
import EventCalendar from '@/components/EventCalendar/EventCalendar';
import ChatArea from '@/components/ChatArea/ChatArea';
import PostContent from '@/components/PostContent/PostContent';
import { useEffect } from 'react';
import Testing from '@/components/ChatArea/GroupChatArea';
import CreateGroup from '@/components/CreateGroupForm/CreateGroup';
import GroupPostForm from '@/components/PostForm/GroupPostForm';
import GroupPostList from '@/components/PostList/GroupPostList';
import NotificationCenter from '@/components/Notifications/NotificationCenter';
import Navbar from '@/components/Navbar/Navbar';
import GroupChat from '@/components/ChatArea/GroupChatArea';

export default function SocialFeed() {
    const [chatWith, setChatWith] = useState<string>('');
    const [chatter, setChatter] = useState<string>('');
    const [chatID, setchatID] = useState<string>('');
    const [isPostFormPopupOpen, setIsPostFormPopupOpen] = useState(false);
    const [isChatGroupPopupOpen, setIsGroupListPopupOpen] = useState(false);
    const [isChatAreaPopupOpen, setIsChatAreaPopupOpen] = useState(false);
    const [isEventsListPopupOpen, setIsEventsListPopupOpen] = useState(false); // TODO: Need to Create EventsList Popup
    const [postListRefreshFn, setPostListRefreshFn] = useState<() => void>();
    const [isPostContentPopupOpen, setPostContentPopup] = useState(false);
    const [selectedPostID, setSelectedPostID] = useState<number>(0);
    const [chatsData, setChatsData] = useState([]);
    const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

    // GroupList refresh function
    const refreshGroups = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/groups/mine", {
                credentials: 'include',
            });
            const data = await res.json();
            const mapped = data.map((item: any) => ({
                id: String(item.groupId),
                username: item.title,
                lastMessage: item.last_message || ''
            }));
            setChatsData(mapped);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        refreshGroups();
    }, []);


    const handleNewPostCreated = () => {
        if (postListRefreshFn) {
            postListRefreshFn(); // refresh PostList
        }
    };



    return (
        <div className="flex w-full h-full mt-[10vh]">
            {/* Header with Navbar and Notifications button */}
            <Navbar onNotificationsClick={() => setIsNotificationCenterOpen(true)} />
            {/* Left column - 17.5% */}
            <div className="w-[17.5%] bg-gray-900 flex flex-col gap-2 fixed h-[90%]">
                <GroupList
                    chats={chatsData}
                    popupHandler={() => setIsGroupListPopupOpen(true)}
                    selectedChatId={chatID}
                    onSelectChat={(id, username) => {
                        setchatID(id);
                        setChatWith(username);
                        setChatter("Me");
                    }}

                />
            </div>

            {/* Middle column - 52.5% */}
            <div className="w-[52.5%] bg-gray-900 ml-[17.5%] fixed h-[90%]">
                <GroupPostList
                    groupId={Number(chatID)}
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
                {/* <EventsList popupHandler={() => setIsEventsListPopupOpen(false)} /> */}
                {/* <GroupChatArea chatID='1' chatWith='hrar' chatter='2'/> */}
                <GroupChat chatID={chatID} chatWith={chatWith} chatter={chatter} />
            </div>

            {/* Popups */}
            <Popup
                isOpen={isPostFormPopupOpen}
                onClose={() => setIsPostFormPopupOpen(false)}
                className="max-w-6xl"
            >
                <GroupPostForm
                    onSubmit={() => {
                        setIsPostFormPopupOpen(false);
                        handleNewPostCreated();
                    }}
                    groupId={Number(chatID)}
                />

                {/* <NotificationCenter /> */}
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

            <Popup
                isOpen={isChatGroupPopupOpen}
                onClose={() => {
                    setIsGroupListPopupOpen(false);
                }}
                className="max-w-6xl"
            >
                <CreateGroup
                    onSubmit={() => {
                        setIsGroupListPopupOpen(false);
                    }} />
                    
            </Popup>

            {/* Notification Center Popup */}
            {/* Pass refreshGroups to NotificationCenter as onGroupInviteHandled */}
            <Popup
                isOpen={isNotificationCenterOpen}
                onClose={() => setIsNotificationCenterOpen(false)}
                className="max-w-lg"
            >
                <NotificationCenter onGroupInviteHandled={refreshGroups} />
            </Popup>

        </div>
    );
}
