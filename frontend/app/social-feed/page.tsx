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
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import { FaComments, FaHome, FaUsers, FaUser, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import ProfilePopup from '@/components/ProfilePopup/ProfilePopup';

type ChatItem = {
    id: string;
    username: string;
    lastMessage: string;
    avatarNumber?: number;
};

export default function SocialFeed() {
    const { user } = useUser();
    const router = useRouter();
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
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isMobileChatListOpen, setIsMobileChatListOpen] = useState(false);
    const [isMobilePrivateChatOpen, setIsMobilePrivateChatOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isChatListCollapsed, setIsChatListCollapsed] = useState(false);
    const [isPrivateChatCollapsed, setIsPrivateChatCollapsed] = useState(false);

    const loadChats = async () => {
        try {
            const res = await fetchWithAuth('http://localhost:8080/api/chat/getChatList', {
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

            if (mapped.length === 0) {
                setchatID('');
                setChatWith('');
                setChatter('');
            } else if (isInitialLoad && mapped.length > 0 && !chatID) {
                // setchatID(mapped[0].id);
                // setChatWith(mapped[0].username);
                setChatter('Me');
                setIsInitialLoad(false);
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
        <div className="flex flex-col w-full h-dvh">
            <Navbar />

            {/* Mobile Bottom Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700 px-2 h-14 safe-area-bottom">
                <div className="flex justify-around items-center h-full">
                    <button
                        onClick={() => router.push('/social-feed')}
                        className="flex flex-col items-center gap-1 p-2 text-blue-500"
                    >
                        <FaHome className="text-xl" />
                    </button>
                    <button
                        onClick={() => router.push('/group')}
                        className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <FaUsers className="text-xl" />
                    </button>
                    <button
                        onClick={() => setIsMobileChatListOpen(true)}
                        className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <FaComments className="text-xl" />
                    </button>
                    <button
                        onClick={() => {
                            if (user.userId !== 0) {
                                setIsProfileOpen(true);
                            } else {
                                setIsSignInPopupOpen(true);
                            }
                        }}
                        className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <FaUser className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Mobile Chat List Overlay - Full Screen */}
            <div
                className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
                    isMobileChatListOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`absolute inset-0 bg-gray-900 flex flex-col transform transition-transform duration-300 ${
                        isMobileChatListOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-700">
                        <span className="text-white font-semibold">Messages</span>
                        <button
                            onClick={() => setIsMobileChatListOpen(false)}
                            className="text-gray-400 hover:text-white p-2"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ChatList
                            chats={chatsData}
                            popupHandler={() => setIsChatListPopupOpen(true)}
                            selectedChatId={chatID}
                            onSelectChat={(id, username) => {
                                setchatID(id);
                                setChatWith(username);
                                setChatter('Me');
                                setIsMobileChatListOpen(false);
                                setIsMobilePrivateChatOpen(true);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Private Chat Overlay - Full Screen */}
            <div
                className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
                    isMobilePrivateChatOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`absolute inset-0 bg-gray-900 flex flex-col transform transition-transform duration-300 ${
                        isMobilePrivateChatOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-700">
                        <button
                            onClick={() => {
                                setIsMobilePrivateChatOpen(false);
                                setIsMobileChatListOpen(true);
                            }}
                            className="text-gray-400 hover:text-white p-2"
                        >
                            ← Back
                        </button>
                        <span className="text-white font-semibold">
                            {chatWith || 'Private Chat'}
                        </span>
                        <button
                            onClick={() => setIsMobilePrivateChatOpen(false)}
                            className="text-gray-400 hover:text-white p-2"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <PrivateChatArea chatWith={chatWith} chatter={chatter} chatID={chatID} />
                    </div>
                </div>
            </div>

            {/* Desktop 3-column layout using flexbox */}
            <div className="hidden lg:flex flex-1 min-h-0 mt-[7vh] relative">
                {/* Left sidebar - Chat List */}
                <div
                    className={`flex-shrink-0 bg-gray-900 overflow-hidden transition-[width] duration-300 ease-in-out ${
                        isChatListCollapsed ? 'w-0' : 'w-[300px]'
                    }`}
                >
                    <div className="w-[300px] h-full">
                        <ChatList
                            chats={chatsData}
                            popupHandler={() => setIsChatListPopupOpen(true)}
                            selectedChatId={chatID}
                            onSelectChat={(id, username) => {
                                setchatID(id);
                                setChatWith(username);
                                setChatter('Me');
                                setIsPrivateChatCollapsed(false);
                            }}
                        />
                    </div>
                </div>

                {/* Left toggle */}
                <button
                    onClick={() => setIsChatListCollapsed(!isChatListCollapsed)}
                    className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-5 h-14 rounded-r-lg bg-gray-800 hover:bg-blue-600 border border-l-0 border-gray-700 shadow-md transition-all duration-300 cursor-pointer group"
                    style={{ left: isChatListCollapsed ? 0 : 300 }}
                    title={isChatListCollapsed ? 'Show Messages' : 'Hide Messages'}
                >
                    {isChatListCollapsed ? (
                        <FaChevronRight className="text-gray-400 group-hover:text-white text-[10px] transition-colors" />
                    ) : (
                        <FaChevronLeft className="text-gray-400 group-hover:text-white text-[10px] transition-colors" />
                    )}
                </button>

                {/* Middle - Post Feed (fills remaining space) */}
                <div className="flex-1 min-w-0 bg-gray-900 flex flex-col">
                    <div className="flex-shrink-0 flex justify-center items-center py-3">
                        <div className="flex items-center gap-1 bg-gray-800/60 rounded-xl p-1">
                            <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white cursor-default">
                                Social Feed
                            </button>
                            <button
                                onClick={() => router.push('/group')}
                                className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Groups
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
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
                </div>

                {/* Right toggle */}
                <button
                    onClick={() => setIsPrivateChatCollapsed(!isPrivateChatCollapsed)}
                    className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-5 h-14 rounded-l-lg bg-gray-800 hover:bg-blue-600 border border-r-0 border-gray-700 shadow-md transition-all duration-300 cursor-pointer group"
                    style={{ right: isPrivateChatCollapsed ? 0 : 450 }}
                    title={isPrivateChatCollapsed ? 'Show Chat' : 'Hide Chat'}
                >
                    {isPrivateChatCollapsed ? (
                        <FaChevronLeft className="text-gray-400 group-hover:text-white text-[10px] transition-colors" />
                    ) : (
                        <FaChevronRight className="text-gray-400 group-hover:text-white text-[10px] transition-colors" />
                    )}
                </button>

                {/* Right sidebar - Private Chat */}
                <div
                    className={`flex-shrink-0 bg-gray-900 overflow-hidden transition-[width] duration-300 ease-in-out ${
                        isPrivateChatCollapsed ? 'w-0' : 'w-[450px]'
                    }`}
                >
                    <div className="w-[450px] h-full">
                        <PrivateChatArea chatWith={chatWith} chatter={chatter} chatID={chatID} />
                    </div>
                </div>
            </div>

            {/* Mobile - Post Feed only */}
            <div className="lg:hidden mt-[7vh] h-[calc(100dvh_-_7vh_-_3.5rem)] bg-gray-900 overflow-hidden flex flex-col">
                <div className="flex-shrink-0 flex justify-center items-center py-1.5">
                    <div className="flex items-center gap-1 bg-gray-800/60 rounded-xl p-1">
                        <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white cursor-default">
                            Social Feed
                        </button>
                        <button
                            onClick={() => router.push('/group')}
                            className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            Groups
                        </button>
                    </div>
                </div>
                <div className="flex-1 min-h-0">
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

            <ProfilePopup
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                userId={user.userId}
                onUserClick={() => {}}
            />
        </div>
    );
}
