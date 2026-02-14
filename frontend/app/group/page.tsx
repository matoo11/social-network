'use client';

import GroupList from '@/components/ChatList/GroupList';
import Popup from '@/components/Popup/Popup';
import { useState } from 'react';
import PostForm from '@/components/PostForm/PostForm';
import EventsList from '@/components/EventsList/EventsList';
import ChatArea from '@/components/ChatArea/ChatArea';
import PostContent from '@/components/PostContent/PostContent';
import { useEffect } from 'react';
import CreateGroup from '@/components/CreateGroupForm/CreateGroup';
import GroupPostForm from '@/components/PostForm/GroupPostForm';
import GroupPostList from '@/components/PostList/GroupPostList';
import Navbar from '@/components/Navbar/Navbar';
import GroupChat from '@/components/ChatArea/GroupChatArea';
import { ChatCardProps } from '@/components/ChatCard/ChatCard';
import Title from '@/components/Title/Title';
import AllUsersList from '@/components/AllUsersList/AllUsersList';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import {
    FaUsers,
    FaHome,
    FaComments,
    FaUser,
    FaChevronLeft,
    FaChevronRight,
    FaChevronDown,
    FaExchangeAlt,
} from 'react-icons/fa';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProfilePopup from '@/components/ProfilePopup/ProfilePopup';
import { useUser } from '../context/UserContext';
import SignInForm from '@/components/SignInForm/SignInForm';

type GroupListItem = ChatCardProps & { joined?: boolean };

export default function SocialFeed() {
    const router = useRouter();
    const { user } = useUser();
    const [chatWith, setChatWith] = useState<string>('');
    const [chatter, setChatter] = useState<string>('');
    const [chatID, setchatID] = useState<string>('');
    const [isPostFormPopupOpen, setIsPostFormPopupOpen] = useState(false);
    const [isChatGroupPopupOpen, setIsGroupListPopupOpen] = useState(false);
    const [isChatAreaPopupOpen, setIsChatAreaPopupOpen] = useState(false);
    const [isEventsListPopupOpen, setIsEventsListPopupOpen] = useState(false);
    const [desktopPostListRefreshFn, setDesktopPostListRefreshFn] = useState<() => void>();
    const [mobilePostListRefreshFn, setMobilePostListRefreshFn] = useState<() => void>();
    const [isPostContentPopupOpen, setPostContentPopup] = useState(false);
    const [selectedPostID, setSelectedPostID] = useState<number>(0);
    const [chatsData, setChatsData] = useState<GroupListItem[]>([]);

    const [groupListMode, setGroupListMode] = useState<'mine' | 'all'>('mine');

    const [isInviteMembersOpen, setIsInviteMembersOpen] = useState(false);
    const [isSeeMembersOpen, setIsSeeMembersOpen] = useState(false);
    const [actionGroupId, setActionGroupId] = useState<string>('');
    const [actionGroupTitle, setActionGroupTitle] = useState<string>('');
    const [selectedInviteeIds, setSelectedInviteeIds] = useState<number[]>([]);
    const [groupMembers, setGroupMembers] = useState<{ userId: number; username: string }[]>([]);
    const [pendingInviteeIds, setPendingInviteeIds] = useState<number[]>([]);
    const [isMobileGroupListOpen, setIsMobileGroupListOpen] = useState(false);
    const [isMobileGroupChatOpen, setIsMobileGroupChatOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);
    const [isGroupListCollapsed, setIsGroupListCollapsed] = useState(false);
    const [isGroupChatCollapsed, setIsGroupChatCollapsed] = useState(false);
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
    const groupDropdownRef = useRef<HTMLDivElement>(null);
    const mobileGroupDropdownRef = useRef<HTMLDivElement>(null);
    const [isMobileGroupDropdownOpen, setIsMobileGroupDropdownOpen] = useState(false);

    const fetchGroups = async (mode: 'mine' | 'all', isInitial = false) => {
        try {
            const endpoint = mode === 'mine' ? '/api/groups/mine' : '/api/groups/all';

            const [res, myRes] = await Promise.all([
                fetchWithAuth(`http://localhost:8080${endpoint}`, { credentials: 'include' }),
                mode === 'all'
                    ? fetchWithAuth('http://localhost:8080/api/groups/mine', {
                          credentials: 'include',
                      })
                    : Promise.resolve(null),
            ]);

            type GroupSummary = {
                groupId: number;
                title: string;
                last_message?: string;
            };

            const myData: unknown = myRes ? await myRes.json() : [];
            const myList = Array.isArray(myData) ? (myData as GroupSummary[]) : [];
            const myGroupIds = new Set(myList.map((g) => String(g.groupId)));

            const data: unknown = await res.json();
            const list = Array.isArray(data) ? (data as GroupSummary[]) : [];
            const mapped = list.map((item) => ({
                id: String(item.groupId),
                username: item.title,
                lastMessage: item.last_message || '',
                joined: mode === 'all' ? myGroupIds.has(String(item.groupId)) : undefined,
            }));
            setChatsData(mapped);

            if (mapped.length === 0) {
                setchatID('');
                setChatWith('');
                setChatter('');
            }
            // Only auto-select on initial load (not on refresh via events)
            else if (isInitial && mapped.length > 0 && chatID === '') {
                if (mode === 'mine') {
                    setchatID(mapped[0].id);
                    setChatWith(mapped[0].username);
                    setChatter('Me');
                } else {
                    const firstJoined = mapped.find((m) => m.joined);
                    if (firstJoined) {
                        setchatID(firstJoined.id);
                        setChatWith(firstJoined.username);
                        setChatter('Me');
                    } else {
                        // no auto-select for non-members
                        setchatID('');
                        setChatWith('');
                        setChatter('');
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    // GroupList refresh function (doesn't reset selection)
    const refreshGroups = async () => {
        await fetchGroups(groupListMode, false);
    };

    useEffect(() => {
        fetchGroups(groupListMode, true);
    }, [groupListMode]);

    useEffect(() => {
        const handleChatMessage = () => {
            refreshGroups();
        };

        const handleMessageSent = () => {
            refreshGroups();
        };

        const handleGroupInviteAccepted = () => {
            refreshGroups();
        };

        window.addEventListener('ws-chat', handleChatMessage);
        window.addEventListener('message-sent', handleMessageSent);
        window.addEventListener('group-invite-accepted', handleGroupInviteAccepted);

        return () => {
            window.removeEventListener('ws-chat', handleChatMessage);
            window.removeEventListener('message-sent', handleMessageSent);
            window.removeEventListener('group-invite-accepted', handleGroupInviteAccepted);
        };
    }, [groupListMode]);

    const toggleGroupListMode = () => {
        setGroupListMode((prev) => (prev === 'mine' ? 'all' : 'mine'));
        setchatID('');
        setChatWith('');
        setChatter('Me');
    };

    const requestToJoin = async (groupId: string) => {
        try {
            const res = await fetchWithAuth('http://localhost:8080/api/groups/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ groupId: Number(groupId) }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || 'Failed to request to join');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openInviteMembers = async (groupId: string, groupTitle: string) => {
        setActionGroupId(groupId);
        setActionGroupTitle(groupTitle);
        setSelectedInviteeIds([]);

        // Fetch group members and pending invites to exclude them from the invite list
        try {
            const [membersRes, pendingRes] = await Promise.all([
                fetchWithAuth('http://localhost:8080/api/groups/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ groupId: Number(groupId) }),
                }),
                fetchWithAuth('http://localhost:8080/api/groups/pendingInvites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ groupId: Number(groupId) }),
                }),
            ]);

            if (!membersRes.ok) {
                const txt = await membersRes.text();
                throw new Error(txt || 'Failed to fetch group members');
            }
            const membersData = await membersRes.json();
            setGroupMembers(Array.isArray(membersData) ? membersData : []);

            if (!pendingRes.ok) {
                const txt = await pendingRes.text();
                throw new Error(txt || 'Failed to fetch pending invites');
            }
            const pendingData = await pendingRes.json();
            setPendingInviteeIds(Array.isArray(pendingData) ? pendingData : []);
        } catch (err) {
            console.error(err);
            setGroupMembers([]);
            setPendingInviteeIds([]);
        }

        setIsInviteMembersOpen(true);
    };

    const openSeeMembers = async (groupId: string, groupTitle: string) => {
        setActionGroupId(groupId);
        setActionGroupTitle(groupTitle);
        setIsSeeMembersOpen(true);

        try {
            const res = await fetchWithAuth('http://localhost:8080/api/groups/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ groupId: Number(groupId) }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || 'Failed to fetch group members');
            }
            const data = await res.json();
            setGroupMembers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setGroupMembers([]);
        }
    };

    const sendInvites = async () => {
        try {
            await Promise.all(
                selectedInviteeIds.map(async (inviteeId) => {
                    const res = await fetchWithAuth('http://localhost:8080/api/groups/invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ groupId: Number(actionGroupId), inviteeId }),
                    });
                    if (!res.ok) {
                        const txt = await res.text();
                        throw new Error(txt || 'Failed to send invite');
                    }
                }),
            );

            setIsInviteMembersOpen(false);
            setSelectedInviteeIds([]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNewPostCreated = () => {
        desktopPostListRefreshFn?.();
        mobilePostListRefreshFn?.();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (groupDropdownRef.current && !groupDropdownRef.current.contains(e.target as Node)) {
                setIsGroupDropdownOpen(false);
            }
            if (
                mobileGroupDropdownRef.current &&
                !mobileGroupDropdownRef.current.contains(e.target as Node)
            ) {
                setIsMobileGroupDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered groups for the dropdown (only joined groups)
    const joinedGroups = groupListMode === 'mine' ? chatsData : chatsData.filter((g) => g.joined);

    const GroupSelector = ({ isMobile = false }: { isMobile?: boolean }) => {
        const isOpen = isMobile ? isMobileGroupDropdownOpen : isGroupDropdownOpen;
        const setIsOpen = isMobile ? setIsMobileGroupDropdownOpen : setIsGroupDropdownOpen;
        const ref = isMobile ? mobileGroupDropdownRef : groupDropdownRef;

        return (
            <div ref={ref} className="relative w-full max-w-md mx-auto px-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 hover:border-emerald-600/50 transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <FaUsers className="text-emerald-500 flex-shrink-0" />
                        <span className="text-white font-medium truncate">
                            {chatWith || 'Select a group'}
                        </span>
                    </div>
                    <FaChevronDown
                        className={`text-gray-400 group-hover:text-emerald-400 text-xs transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-4 right-4 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-30 max-h-64 overflow-y-auto hide-scrollbar">
                        {joinedGroups.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400">
                                No groups joined yet
                            </div>
                        ) : (
                            joinedGroups.map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => {
                                        setchatID(g.id || '');
                                        setChatWith(g.username || '');
                                        setChatter('Me');
                                        setIsOpen(false);
                                        if (!isMobile) {
                                            setIsGroupChatCollapsed(false);
                                        }
                                    }}
                                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-700 transition-colors cursor-pointer ${
                                        g.id === chatID
                                            ? 'bg-emerald-600/20 border-l-2 border-emerald-500'
                                            : 'border-l-2 border-transparent'
                                    }`}
                                >
                                    <FaUsers
                                        className={`flex-shrink-0 ${
                                            g.id === chatID ? 'text-emerald-400' : 'text-gray-500'
                                        }`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div
                                            className={`font-medium truncate ${
                                                g.id === chatID ? 'text-emerald-400' : 'text-white'
                                            }`}
                                        >
                                            {g.username}
                                        </div>
                                        {g.lastMessage && (
                                            <div className="text-xs text-gray-500 truncate">
                                                {g.lastMessage}
                                            </div>
                                        )}
                                    </div>
                                    {g.id === chatID && (
                                        <span className="text-xs text-emerald-400 flex-shrink-0">
                                            Selected
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full h-dvh">
            {/* Header with Navbar */}
            <Navbar />

            {/* Mobile Bottom Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700 px-2 h-14 safe-area-bottom">
                <div className="flex justify-around items-center h-full">
                    <button
                        onClick={() => router.push('/social-feed')}
                        className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <FaHome className="text-xl" />
                    </button>
                    <button
                        onClick={() => setIsMobileGroupListOpen(true)}
                        className="flex flex-col items-center gap-1 p-2 text-emerald-500"
                    >
                        <FaUsers className="text-xl" />
                    </button>
                    <button
                        onClick={() => setIsMobileGroupListOpen(true)}
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

            {/* Mobile Group List Overlay - Full Screen */}
            <div
                className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
                    isMobileGroupListOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`absolute inset-0 bg-gray-900 flex flex-col transform transition-transform duration-300 ${
                        isMobileGroupListOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-700">
                        <span className="text-white font-semibold">Groups</span>
                        <button
                            onClick={() => setIsMobileGroupListOpen(false)}
                            className="text-gray-400 hover:text-white p-2"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <GroupList
                            chats={chatsData}
                            mode={groupListMode}
                            onToggleMode={toggleGroupListMode}
                            popupHandler={() => setIsGroupListPopupOpen(true)}
                            selectedChatId={chatID}
                            onSelectChat={(id, username) => {
                                setchatID(id);
                                setChatWith(username);
                                setChatter('Me');
                                setIsMobileGroupListOpen(false);
                                setIsMobileGroupChatOpen(true);
                            }}
                            onInviteMembers={openInviteMembers}
                            onSeeMembers={openSeeMembers}
                            onRequestToJoin={(groupId) => requestToJoin(groupId)}
                            onOpenEvents={(groupId) => {
                                setchatID(groupId);
                                setIsEventsListPopupOpen(true);
                            }}
                            onOpenChat={(groupId, groupTitle) => {
                                setchatID(groupId);
                                setChatWith(groupTitle);
                                setChatter('Me');
                                setIsMobileGroupListOpen(false);
                                setIsMobileGroupChatOpen(true);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Group Chat Overlay - Full Screen */}
            <div
                className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
                    isMobileGroupChatOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`absolute inset-0 bg-gray-900 flex flex-col transform transition-transform duration-300 ${
                        isMobileGroupChatOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-700">
                        <button
                            onClick={() => {
                                setIsMobileGroupChatOpen(false);
                                setIsMobileGroupListOpen(true);
                            }}
                            className="text-gray-400 hover:text-white p-2"
                        >
                            ← Back
                        </button>
                        <span className="text-white font-semibold">{chatWith || 'Group Chat'}</span>
                        <button
                            onClick={() => setIsMobileGroupChatOpen(false)}
                            className="text-gray-400 hover:text-white p-2"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <GroupChat chatID={chatID} chatWith={chatWith} chatter={chatter} />
                    </div>
                </div>
            </div>

            {/* Desktop 3-column layout using flexbox */}
            <div className="hidden lg:flex flex-1 min-h-0 mt-[7vh] relative">
                {/* Left sidebar - Group List */}
                <div
                    className={`flex-shrink-0 bg-gray-900 overflow-hidden transition-[width] duration-300 ease-in-out ${
                        isGroupListCollapsed ? 'w-0' : 'w-[300px]'
                    }`}
                >
                    <div className="w-[300px] h-full">
                        <GroupList
                            chats={chatsData}
                            mode={groupListMode}
                            onToggleMode={toggleGroupListMode}
                            popupHandler={() => setIsGroupListPopupOpen(true)}
                            selectedChatId={chatID}
                            onSelectChat={(id, username) => {
                                setchatID(id);
                                setChatWith(username);
                                setChatter('Me');
                            }}
                            onInviteMembers={openInviteMembers}
                            onSeeMembers={openSeeMembers}
                            onRequestToJoin={(groupId) => requestToJoin(groupId)}
                            onOpenEvents={(groupId) => {
                                setchatID(groupId);
                                setIsEventsListPopupOpen(true);
                            }}
                            onOpenChat={(groupId, groupTitle) => {
                                setchatID(groupId);
                                setChatWith(groupTitle);
                                setChatter('Me');
                                setIsGroupChatCollapsed(false);
                            }}
                        />
                    </div>
                </div>

                {/* Left toggle */}
                <button
                    onClick={() => setIsGroupListCollapsed(!isGroupListCollapsed)}
                    className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-5 h-14 rounded-r-lg bg-gray-800 hover:bg-emerald-600 border border-l-0 border-gray-700 shadow-md transition-all duration-300 cursor-pointer group"
                    style={{ left: isGroupListCollapsed ? 0 : 300 }}
                    title={isGroupListCollapsed ? 'Show Groups' : 'Hide Groups'}
                >
                    {isGroupListCollapsed ? (
                        <FaChevronRight className="text-gray-400 group-hover:text-white text-[10px] transition-colors" />
                    ) : (
                        <FaChevronLeft className="text-gray-400 group-hover:text-white text-[10px] transition-colors" />
                    )}
                </button>

                {/* Middle - Group Post Feed (fills remaining space) */}
                <div className="flex-1 min-w-0 bg-gray-900 flex flex-col">
                    <div className="flex-shrink-0 flex justify-center items-center py-3">
                        <div className="flex items-center gap-1 bg-gray-800/60 rounded-xl p-1">
                            <button
                                onClick={() => router.push('/social-feed')}
                                className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Social Feed
                            </button>
                            <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white cursor-default">
                                Groups
                            </button>
                        </div>
                    </div>
                    <div className="flex-shrink-0 py-1">
                        <GroupSelector />
                    </div>
                    <div className="flex-1 min-h-0">
                        <GroupPostList
                            groupId={Number(chatID)}
                            popupHandler={() => setIsPostFormPopupOpen(true)}
                            onRef={(refreshFn) => setDesktopPostListRefreshFn(() => refreshFn)}
                            postContentPopupHandler={(postID: number) => {
                                console.log('Open post content popup for post ID:', postID);
                                setSelectedPostID(postID);
                                setPostContentPopup(true);
                            }}
                        />
                    </div>
                </div>

                {/* Right toggle */}
                <button
                    onClick={() => setIsGroupChatCollapsed(!isGroupChatCollapsed)}
                    className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-5 h-14 rounded-l-lg bg-gray-800 hover:bg-emerald-600 border border-r-0 border-gray-700 shadow-md transition-all duration-300 cursor-pointer group"
                    style={{ right: isGroupChatCollapsed ? 0 : 450 }}
                    title={isGroupChatCollapsed ? 'Show Chat' : 'Hide Chat'}
                >
                    {isGroupChatCollapsed ? (
                        <FaChevronLeft className="text-gray-400 group-hover:text-white text-[10px] transition-colors" />
                    ) : (
                        <FaChevronRight className="text-gray-400 group-hover:text-white text-[10px] transition-colors" />
                    )}
                </button>

                {/* Right sidebar - Group Chat */}
                <div
                    className={`flex-shrink-0 bg-gray-900 overflow-hidden transition-[width] duration-300 ease-in-out ${
                        isGroupChatCollapsed ? 'w-0' : 'w-[450px]'
                    }`}
                >
                    <div className="w-[450px] h-full">
                        <GroupChat chatID={chatID} chatWith={chatWith} chatter={chatter} />
                    </div>
                </div>
            </div>

            {/* Mobile - Group Post Feed only */}
            <div className="lg:hidden mt-[7vh] h-[calc(100dvh_-_7vh_-_3.5rem)] bg-gray-900 overflow-hidden flex flex-col">
                <div className="flex-shrink-0 flex justify-center items-center py-1.5">
                    <div className="flex items-center gap-1 bg-gray-800/60 rounded-xl p-1">
                        <button
                            onClick={() => router.push('/social-feed')}
                            className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            Social Feed
                        </button>
                        <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white cursor-default">
                            Groups
                        </button>
                    </div>
                </div>
                <div className="flex-shrink-0 py-1">
                    <GroupSelector isMobile />
                </div>
                <div className="flex-1 min-h-0">
                    <GroupPostList
                        groupId={Number(chatID)}
                        popupHandler={() => setIsPostFormPopupOpen(true)}
                        onRef={(refreshFn) => setMobilePostListRefreshFn(() => refreshFn)}
                        postContentPopupHandler={(postID: number) => {
                            console.log('Open post content popup for post ID:', postID);
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
                        refreshGroups();
                    }}
                />
            </Popup>

            <Popup
                isOpen={isInviteMembersOpen}
                onClose={() => setIsInviteMembersOpen(false)}
                className="max-w-3xl"
            >
                <div className="border-2 border-gray-600 rounded-lg shadow-sm bg-gray-900 dark:bg-gray-900 p-4 h-full flex flex-col gap-4">
                    <Title
                        text={
                            actionGroupTitle
                                ? `Invite members to ${actionGroupTitle}`
                                : 'Invite members'
                        }
                    />
                    <div className="flex-1 min-h-0">
                        <AllUsersList
                            onSelectionChange={(ids) => setSelectedInviteeIds(ids)}
                            excludeUserIds={[
                                ...groupMembers.map((m) => m.userId),
                                ...pendingInviteeIds,
                            ]}
                        />
                    </div>
                    <button
                        type="button"
                        className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
                        disabled={!actionGroupId || selectedInviteeIds.length === 0}
                        onClick={sendInvites}
                    >
                        Send invites
                    </button>
                </div>
            </Popup>

            <Popup
                isOpen={isSeeMembersOpen}
                onClose={() => setIsSeeMembersOpen(false)}
                className="max-w-lg"
            >
                <div className="border-2 border-gray-600 rounded-lg shadow-sm bg-gray-900 dark:bg-gray-900 p-4 h-full flex flex-col gap-4">
                    <Title
                        text={actionGroupTitle ? `Members of ${actionGroupTitle}` : 'Group members'}
                    />
                    <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar flex flex-col gap-2">
                        {groupMembers.length === 0 ? (
                            <p className="text-sm text-gray-400">No members found.</p>
                        ) : (
                            groupMembers.map((m) => (
                                <div
                                    key={m.userId}
                                    className="p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                                >
                                    {m.username}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Popup>

            <Popup
                isOpen={isEventsListPopupOpen}
                onClose={() => setIsEventsListPopupOpen(false)}
                className="max-w-4xl"
            >
                {chatID && <EventsList groupId={Number(chatID)} />}
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
