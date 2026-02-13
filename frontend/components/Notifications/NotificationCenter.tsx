'use client';

import React, { useEffect, useRef, useState } from 'react';
import Title from '../Title/Title';
import NotificationRenderer from './NotificationRenderer';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

export type NotificationType =
    | 'GROUP_INVITE'
    | 'MESSAGE'
    | 'FOLLOW_REQUEST'
    | 'JOIN_GROUP_REQUEST'
    | 'GROUP_CREATED'
    | 'EVENT_CREATED';

export type Notification = {
    id: number;
    type: NotificationType;
    data: any;
};

type NotificationCenterProps = {
    onGroupInviteHandled?: () => void;
    onNotificationHandled?: () => void;
};

type ActiveChat = { type: 'private' | 'group'; id: number } | null;

const NotificationCenter = ({
    onGroupInviteHandled,
    onNotificationHandled,
}: NotificationCenterProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const activeChatRef = useRef<ActiveChat>(null);

    const shouldIgnore = (notification: Notification) => {
        if (notification.type !== 'MESSAGE') return false;

        const data = notification.data ?? {};
        const senderId = Number(data.senderId ?? data.senderID ?? data.sender_id);
        const groupId = Number(data.groupId ?? data.groupID ?? data.group_id);
        const active = activeChatRef.current;

        if (!active) return false;
        if (active.type === 'private' && senderId && senderId === active.id) return true;
        if (active.type === 'group' && groupId && groupId === active.id) return true;

        return false;
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetchWithAuth('http://localhost:8080/api/notifications/get', {
                    credentials: 'include',
                });
                if (!res.ok) {
                    console.error('Failed to fetch notifications');
                    setNotifications([]);
                    return;
                }
                const data = await res.json();

                if (!data) {
                    setNotifications([]);
                    return;
                }

                const notifs = Array.isArray(data) ? data : data.data || [];
                const safeList = Array.isArray(notifs) ? notifs : [];
                setNotifications(safeList.filter((n) => !shouldIgnore(n)));
            } catch (err) {
                console.error(err);
                setNotifications([]);
            }
        };
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            activeChatRef.current = (e as CustomEvent).detail as ActiveChat;
        };

        window.addEventListener('active-chat', handler);
        return () => window.removeEventListener('active-chat', handler);
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            const incoming = (e as CustomEvent).detail as Notification;

            if (shouldIgnore(incoming)) return;

            setNotifications((prev) => [incoming, ...prev]);
        };

        window.addEventListener('ws-notification', handler);
        return () => window.removeEventListener('ws-notification', handler);
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            const data = (e as CustomEvent).detail;
            const notificationId = data.notificationId;

            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        };

        window.addEventListener('ws-notification-removed', handler);
        return () => window.removeEventListener('ws-notification-removed', handler);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    // Handler for when a group invite is accepted/rejected
    const handleGroupInvite = () => {
        removeNotification;
        if (onGroupInviteHandled) onGroupInviteHandled();
    };

    return (
        <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden dark:bg-gray-900">
            <div className="flex justify-center items-center h-[7.5%] pt-2 border-b-2 border-gray-600">
                <Title text="Notifications" />
            </div>
            <div className="h-[92.5%] p-4 space-y-3 overflow-y-auto">
                {notifications.map((n) => (
                    <NotificationRenderer
                        key={n.id}
                        notification={n}
                        onHandled={() => {
                            removeNotification(n.id);
                            if (onNotificationHandled) {
                                onNotificationHandled();
                            }
                            if (n.type === 'GROUP_INVITE' && onGroupInviteHandled) {
                                onGroupInviteHandled();
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationCenter;
