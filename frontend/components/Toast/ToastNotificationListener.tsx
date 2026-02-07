'use client';

import React, { useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

const ToastNotificationListener: React.FC = () => {
    const { addToast } = useToast();

    useEffect(() => {
        // Listen for notification events
        const handleNotification = (e: Event) => {
            const notification = (e as CustomEvent).detail;

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
