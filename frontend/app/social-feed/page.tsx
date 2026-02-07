'use client';

import ChatList from '@/components/ChatList/ChatList';
import PostList from '@/components/PostList/PostList';
import Popup from '@/components/Popup/Popup';
import { useEffect, useState } from 'react';
import PostForm from '@/components/PostForm/PostForm';
import ChatArea from '@/components/ChatArea/ChatArea';
import PostContent from '@/components/PostContent/PostContent';
import { useUser } from '../context/UserContext';
import SignInForm from '@/components/SignInForm/SignInForm';
import Navbar from '@/components/Navbar/Navbar';
import PrivateChatArea from '@/components/ChatArea/PrivateChatArea';

type ChatItem = {
    id: string;
    username: string;
    lastMessage: string;
    avatarNumber?: number;
};

export default function SocialFeed() {
    const { user } = useUser();
    const [chatWith, setChatWith] = useState<string>('');
    const [chatter, setChatter] = useState<string>('');
    const [chatID, setchatID] = useState<string>('');
    const [isPostFormPopupOpen, setIsPostFormPopupOpen] = useState(false);
    const [isChatListPopupOpen, setIsChatListPopupOpen] = useState(false);
    const [isChatAreaPopupOpen, setIsChatAreaPopupOpen] = useState(false);
    const [postListRefreshFn, setPostListRefreshFn] = useState<() => void>();
    const [isPostContentPopupOpen, setPostContentPopup] = useState(false);
    const [selectedPostID, setSelectedPostID] = useState<number>(0);
    const [chatsData, setChatsData] = useState<ChatItem[]>([]);
    const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);

    const loadChats = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/chat/getChatList', {
                credentials: 'include',
            });

            // Check if the response is OK
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            // Get response text first to check if it's empty
            const text = await res.text();
            if (!text) {
                setChatsData([]);
                return;
            }

            // Parse JSON safely
            let data: unknown;
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                console.error('Failed to parse JSON:', parseErr);
                setChatsData([]);
                return;
            }

            // Ensure data is an array before mapping
            const list = Array.isArray(data) ? data : [];

            const mapped: ChatItem[] = list.map((item: any) => ({
                id: String(item.UserID),
                username: item.Username,
                lastMessage: item.last_message || '',
                avatarNumber: item.AvatarNumber || 1,
            }));

            setChatsData(mapped);

            if (mapped.length > 0 && !chatID) {
                setchatID(mapped[0].id);
                setChatWith(mapped[0].username);
                setChatter('Me');
            }
        } catch (err) {
            console.error('Failed to load chats:', err);
            setChatsData([]); // fallback to empty array on error
        }
    };

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        // Listen for WebSocket chat messages to refresh chat list
        const handleChatMessage = () => {
            loadChats();
            console.log('Chat list refreshed due to WebSocket message');
        };

        // Listen for sent messages to refresh chat list
        const handleMessageSent = () => {
            loadChats();
            console.log('Chat list refreshed due to sent message');
        };

        // Listen for follow/unfollow actions to refresh chat list
        const handleFollowUpdated = () => {
            loadChats();
            console.log('Chat list refreshed due to follow action');
        };

        // Listen for WebSocket chatlist refresh
        const handleChatListRefresh = () => {
            loadChats();
            console.log('Chat list refreshed via WebSocket');
        };

        window.addEventListener('ws-chat', handleChatMessage);
        window.addEventListener('message-sent', handleMessageSent);
        window.addEventListener('follow-updated', handleFollowUpdated);
        window.addEventListener('ws-chatlist-refresh', handleChatListRefresh);

        return () => {
            window.removeEventListener('ws-chat', handleChatMessage);
            window.removeEventListener('message-sent', handleMessageSent);
            window.removeEventListener('follow-updated', handleFollowUpdated);
            window.removeEventListener('ws-chatlist-refresh', handleChatListRefresh);
        };
    }, []);

    const handleNewPostCreated = () => {
        if (postListRefreshFn) {
            postListRefreshFn(); // refresh PostList
        }
    };

    return (
        <div className="flex w-full h-full mt-[7vh]">
            <Navbar />

            {/* Left column - 17.5% */}
            <div className="w-[17.5%] bg-gray-900 flex flex-col gap-2 fixed h-[93%] left-0">
                <ChatList
                    chats={chatsData}
                    popupHandler={() => setIsChatListPopupOpen(true)}
                    selectedChatId={chatID}
                    onSelectChat={(id, username) => {
                        setchatID(id);
                        setChatWith(username);
                        setChatter('Me');
                    }}
                />
            </div>

            {/* Middle column - 52.5% */}
            <div className="w-[52.5%] bg-gray-900 ml-[17.5%] fixed h-[93%]">
                <PostList
                    popupHandler={() => {
                        if (user.userId !== 0) {
                            setIsPostFormPopupOpen(true);
                        } else {
                            setIsSignInPopupOpen(true);
                        }
                    }}
                    onRef={(refreshFn) => setPostListRefreshFn(() => refreshFn)}
                    postContentPopupHandler={(postID: number) => {
                        setSelectedPostID(postID);
                        setPostContentPopup(true);
                    }}
                />
            </div>

            {/* Right column - 30% */}
            <div className="w-[30%] bg-gray-900 fixed h-[93%] right-0">
                <PrivateChatArea chatWith={chatWith} chatter={chatter} chatID={chatID} />
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

            {/* <Popup
                isOpen={isChatAreaPopupOpen}
                onClose={() => setIsChatAreaPopupOpen(false)}
                className="max-w-6xl"
            >
                <ChatArea chatWith={chatWith} chatter={chatter} chatID={chatID} />
            </Popup> */}

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
                isOpen={isSignInPopupOpen}
                onClose={() => setIsSignInPopupOpen(false)}
                className="max-w-sm"
            >
                <SignInForm onSuccess={() => setIsSignInPopupOpen(false)} />
            </Popup>
        </div>
    );
}
