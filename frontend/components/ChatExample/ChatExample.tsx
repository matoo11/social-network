'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/app/context/WebSocketContext';

type ChatListData = {
    allUsers: string[];
    onlineUsers: string[];
};

export default function ChatComponent() {
    const [allUsers, setAllUsers] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { subscribe, send } = useWebSocket();

    useEffect(() => {
        console.log('ChatComponent mounted, subscribe:', !!subscribe, 'send:', !!send);

        if (!subscribe || !send) {
            console.log('Subscribe or send not available yet');
            return;
        }

        // Subscribe to WebSocket open event
        const unsubOpen = subscribe('__open__', () => {
            console.log('WebSocket opened, requesting initial chat list');
            send({
                payLoadType: 'initialChatList',
                data: {},
            });
        });

        // Subscribe to all message types to debug
        const unsubAll = subscribe('*', (payload: any) => {
            console.log('Received ANY message:', payload);
        });

        const unsubInitial = subscribe('initialChatList', (data: ChatListData) => {
            console.log('Received initialChatList data:', data);
            setAllUsers(data.allUsers ?? []);
            setOnlineUsers(data.onlineUsers ?? []);
        });

        const unsubChatList = subscribe('chatList', (data: ChatListData) => {
            console.log('Received chatList data:', data);
            setAllUsers(data.allUsers ?? []);
            setOnlineUsers(data.onlineUsers ?? []);
        });

        // If WebSocket is already open, request immediately
        // (This handles cases where component mounts after WS is connected)
        send({
            payLoadType: 'initialChatList',
            data: {},
        });

        return () => {
            console.log('ChatComponent unmounting, cleaning up subscriptions');
            unsubOpen();
            unsubAll();
            unsubInitial();
            unsubChatList();
        };
    }, [subscribe, send]);

    const handleSendTest = () => {
        console.log('Sending test message');
        send?.({
            payLoadType: 'messageSent',
            data: { from: 'admin', to: 'test', content: 'hello from client' },
        });
    };

    const handleRequestChatList = () => {
        console.log('Requesting chat list');
        send?.({
            payLoadType: 'initialChatList',
            data: {},
        });
    };

    return (
        <div>
            <h2>All Users ({allUsers.length})</h2>
            <button onClick={handleSendTest}>Send Message</button>
            <button onClick={handleRequestChatList}>Request Chat List</button>
            <ul>
                {allUsers.map((user) => (
                    <li key={user} style={{ color: onlineUsers.includes(user) ? 'green' : 'gray' }}>
                        {user} {onlineUsers.includes(user) && '● Online'}
                    </li>
                ))}
            </ul>
        </div>
    );
}
