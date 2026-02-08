'use client';

import GroupList from '@/components/ChatList/GroupList';
import PostList from '@/components/PostList/PostList';
import Popup from '@/components/Popup/Popup';
import { useState } from 'react';
import PostForm from '@/components/PostForm/PostForm';
import EventsList from '@/components/EventsList/EventsList';
import ChatArea from '@/components/ChatArea/ChatArea';
import PostContent from '@/components/PostContent/PostContent';
import { useEffect } from 'react';
import Testing from '@/components/ChatArea/GroupChatArea';
import CreateGroup from '@/components/CreateGroupForm/CreateGroup';
import GroupPostForm from '@/components/PostForm/GroupPostForm';
import GroupPostList from '@/components/PostList/GroupPostList';
import Navbar from '@/components/Navbar/Navbar';
import GroupChat from '@/components/ChatArea/GroupChatArea';
import FollowersList from '@/components/FollowersList/FollowersList';
import { ChatCardProps } from '@/components/ChatCard/ChatCard';
import Title from '@/components/Title/Title';
import AllUsersList from '@/components/AllUsersList/AllUsersList';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

type GroupListItem = ChatCardProps & { joined?: boolean };

export default function SocialFeed() {
    const [chatWith, setChatWith] = useState<string>('');
    const [chatter, setChatter] = useState<string>('');
    const [chatID, setchatID] = useState<string>('');
    const [isPostFormPopupOpen, setIsPostFormPopupOpen] = useState(false);
    const [isChatGroupPopupOpen, setIsGroupListPopupOpen] = useState(false);
    const [isChatAreaPopupOpen, setIsChatAreaPopupOpen] = useState(false);
    const [isEventsListPopupOpen, setIsEventsListPopupOpen] = useState(false);
    const [postListRefreshFn, setPostListRefreshFn] = useState<() => void>();
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

    const fetchGroups = async (mode: 'mine' | 'all', isInitial = false) => {
        try {
            const endpoint = mode === 'mine' ? '/api/groups/mine' : '/api/groups/all';

            const [res, myRes] = await Promise.all([
                fetchWithAuth(`http://localhost:8080${endpoint}`, { credentials: 'include' }),
                mode === 'all'
                    ? fetchWithAuth('http://localhost:8080/api/groups/mine', { credentials: 'include' })
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
        if (postListRefreshFn) {
            postListRefreshFn(); // refresh PostList
        }
    };

    return (
        <div className="flex w-full h-full mt-[7vh]">
            {/* Header with Navbar and Notifications button */}
            <Navbar />
            {/* Left column - 17.5% */}
            <div className="w-[17.5%] bg-gray-900 flex flex-col gap-2 fixed h-[93%]">
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
                />
            </div>

            {/* Middle column - 52.5% */}
            <div className="w-[52.5%] bg-gray-900 ml-[17.5%] fixed h-[93%]">
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
            <div className="w-[30%] bg-gray-900 fixed h-[93%] right-0">
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
                            excludeUserIds={[...groupMembers.map(m => m.userId), ...pendingInviteeIds]}
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
        </div>
    );
}
