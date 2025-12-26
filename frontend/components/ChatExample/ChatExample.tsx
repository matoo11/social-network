'use client';

import { useWebSocket } from '@/app/context/WebSocketContext';
import { useEffect } from 'react';

export default function ChatComponent() {
    const { chatWS } = useWebSocket();

    useEffect(() => {
        // You can now use chatWS to send messages
        if (chatWS) {
            // Example: Request chat list
            chatWS.send({
                payLoadType: 'getChatList',
                data: {},
            });
        }
    }, [chatWS]);

    const sendMessage = (recipientId: number, message: string) => {
        if (chatWS) {
            chatWS.send({
                payLoadType: 'sendMessage',
                data: {
                    to: recipientId,
                    messageText: message,
                },
            });
        }
    };

    return <div>{/* Your chat UI */}</div>;
}
