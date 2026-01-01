'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/app/context/WebSocketContext';

type ChatListData = {
    allUsers: string[];
    onlineUsers: string[];
};

type PayLoad = {
    payLoadType: string;
    data: ChatListData;
};

export default function ChatComponent() {
    const [allUsers, setAllUsers] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { subscribe, send } = useWebSocket();

    useEffect(() => {
        const unsub =
            subscribe?.('chatList', (data: PayLoad) => {
                console.log('Received chatList data', data);
                setAllUsers(data.data.allUsers ?? []);
                setOnlineUsers(data.data.onlineUsers ?? []);
            }) ?? (() => {});

        return () => {
            unsub();
        };
    }, [subscribe]);

    const handleSendTest = () => {
        console.log('Sending test message');
        send?.({ from: 'admin', to: 'test', content: 'hello from client' });
    };

    return (
        <div>
            <h2>All Users ({allUsers.length})</h2>
            <button onClick={handleSendTest}>Send</button>
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
