'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import WebSocketManager from '@/lib/util/web-socket-manager';
import { useUser } from './UserContext';

type WebSocketContextType = {
    chatWS: WebSocketManager | null;
    subscribe: (eventType: string, cb: (data: any) => void) => () => void;
    send: (data: unknown) => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const chatWSRef = useRef<WebSocketManager | null>(null);
    const { user } = useUser();

    useEffect(() => {
        const url = 'ws://localhost:8080/api/ws';

        if (user.userId > 0 && !chatWSRef.current) {
            const wsManager = new WebSocketManager('chat');

            // lifecycle subscriptions
            const unsubOpen = wsManager.subscribe('__open__', () => {
                console.log('WebSocket opened');
            });
            const unsubClose = wsManager.subscribe('__close__', (ev: CloseEvent) => {
                console.log('WebSocket closed', ev.code, ev.reason);
                if (ev.code !== 1000) {
                    setTimeout(() => wsManager.connect(url).catch(() => {}), 3000);
                }
            });
            const unsubError = wsManager.subscribe('__error__', (err: Event) => {
                console.error('WebSocket error', err);
            });

            wsManager.connect(url).catch((err) => console.error('WS connect error', err));

            chatWSRef.current = wsManager;

            return () => {
                unsubOpen();
                unsubClose();
                unsubError();
                wsManager.disconnect();
                chatWSRef.current = null;
            };
        }

        // cleanup on logout
        return () => {
            if (chatWSRef.current && user.userId === 0) {
                chatWSRef.current.disconnect();
                chatWSRef.current = null;
            }
        };
    }, [user.userId]);

    const subscribe = (eventType: string, cb: (data: any) => void) => {
        if (!chatWSRef.current) return () => {};
        return chatWSRef.current.subscribe(eventType, cb);
    };

    const send = (data: unknown) => {
        chatWSRef.current?.send(data);
    };

    return (
        <WebSocketContext.Provider value={{ chatWS: chatWSRef.current, subscribe, send }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) throw new Error('useWebSocket must be used inside WebSocketProvider');
    return ctx;
};
