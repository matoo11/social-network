'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import WebSocketManager from '@/lib/util/web-socket-manager';
import { useUser } from './UserContext';

type WebSocketContextType = {
    chatWS: WebSocketManager | null;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const chatWSRef = useRef<WebSocketManager | null>(null);
    const { user } = useUser();

    useEffect(() => {
        // Only connect if user is logged in
        if (user.userId > 0 && !chatWSRef.current) {
            console.log('Initializing WebSocket connection...');

            const wsManager = new WebSocketManager('chat');

            // Set up message handler
            wsManager.onMessage((event: MessageEvent) => {
                const parsedData = JSON.parse(event.data);
                console.log('WebSocket message received:', parsedData);

                switch (parsedData.payLoadType) {
                    case 'chatList':
                        // Handle chat list updates
                        console.log('Chat list updated');
                        break;
                    case 'privateMessages':
                        // Handle private messages
                        console.log('Private messages received');
                        break;
                    case 'messageSent':
                        // Handle sent message confirmation
                        console.log('Message sent confirmation');
                        break;
                    case 'messageReceived':
                        // Handle received message
                        console.log('New message received');
                        break;
                    case 'notification':
                        // Handle notifications
                        console.log('Notification received');
                        break;
                    default:
                        console.log('Unknown message type:', parsedData.payLoadType);
                }
            });

            // Set up error handler
            wsManager.onError((error: Event) => {
                console.error('WebSocket error:', error);
            });

            // Set up close handler with reconnection logic
            wsManager.onClose((event: CloseEvent) => {
                console.log('WebSocket closed:', event.code, event.reason);

                // Reconnect after 3 seconds if not a normal closure
                if (event.code !== 1000) {
                    setTimeout(() => {
                        console.log('Attempting to reconnect...');
                        wsManager.connect('ws://localhost:8080/api/ws');
                    }, 3000);
                }
            });

            // Connect
            wsManager
                .connect('ws://localhost:8080/api/ws')
                .then(() => {
                    console.log('WebSocket connection initiated');
                })
                .catch((error) => {
                    console.error('WebSocket connection error:', error);
                });

            chatWSRef.current = wsManager;
        }

        // Cleanup on unmount or when user logs out
        return () => {
            if (chatWSRef.current && user.userId === 0) {
                console.log('Disconnecting WebSocket...');
                chatWSRef.current.disconnect();
                chatWSRef.current = null;
            }
        };
    }, [user.userId]);

    return (
        <WebSocketContext.Provider value={{ chatWS: chatWSRef.current }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) throw new Error('useWebSocket must be used inside WebSocketProvider');
    return ctx;
};
