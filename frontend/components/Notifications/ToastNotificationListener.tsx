'use client';

import React, { useEffect, useRef } from 'react';
import { useToast } from '@/context/ToastContext';

type ActiveChat = { type: 'private' | 'group'; id: number } | null;

const ToastNotificationListener: React.FC = () => {
    const { addToast } = useToast();
    const activeChatRef = useRef<ActiveChat>(null);

    const shouldIgnoreNotification = (notification: any) => {
        if (notification?.type !== 'MESSAGE') return false;

        const data = notification?.data ?? {};
        const senderId = Number(data.senderId ?? data.senderID ?? data.sender_id);
        const groupId = Number(data.groupId ?? data.groupID ?? data.group_id);
        const active = activeChatRef.current;

        if (!active) return false;
        if (active.type === 'private' && senderId && senderId === active.id) return true;
        if (active.type === 'group' && groupId && groupId === active.id) return true;

        return false;
    };

    useEffect(() => {
        const handler = (e: Event) => {
            activeChatRef.current = (e as CustomEvent).detail as ActiveChat;
        };

        window.addEventListener('active-chat', handler);
        return () => window.removeEventListener('active-chat', handler);
    }, []);

    useEffect(() => {
        // Listen for notification events
        const handleNotification = (e: Event) => {
            const notification = (e as CustomEvent).detail;

            if (shouldIgnoreNotification(notification)) return;

            const titleMap: Record<string, string> = {
                GROUP_INVITE: 'Group Invite',
                FOLLOW_REQUEST: 'Follow Request',
                JOIN_GROUP_REQUEST: 'Join Request',
                GROUP_CREATED: 'Group Created',
                EVENT_CREATED: 'Event Created',
                MESSAGE: 'New Message',
            };

            const title = titleMap[notification.type] || 'Notification';
            const message =
                notification.NotificationText ||
                notification.message ||
                'You have a new notification';

            addToast({
                type: 'info',
                title,
                message,
                duration: 5000,
            });
        };

        window.addEventListener('ws-notification', handleNotification);
        return () => window.removeEventListener('ws-notification', handleNotification);
    }, [addToast]);

    useEffect(() => {
        // Listen for private messages
        const handlePrivateMessage = (e: Event) => {
            const messageData = (e as CustomEvent).detail;

            const active = activeChatRef.current;
            const senderId = Number(messageData?.senderID ?? messageData?.senderId);
            const isActivePrivate =
                active?.type === 'private' && senderId && senderId === active.id;
            if (isActivePrivate) return;

            // Only show toast for received messages (not sent)
            // Check if message has receiverID (private message) but not groupID
            if (messageData?.recieverID && !messageData?.groupID) {
                addToast({
                    type: 'info',
                    title: `Message from ${messageData.senderUsername || 'Unknown'}`,
                    message: messageData.message,
                    duration: 5000,
                });
            }
        };

        window.addEventListener('ws-chat', handlePrivateMessage);
        return () => window.removeEventListener('ws-chat', handlePrivateMessage);
    }, [addToast]);

    return null;
};

export default ToastNotificationListener;
