'use client';

import React, { useEffect, useState } from 'react';
import Title from '../Title/Title';
import NotificationRenderer from './NotificationRenderer';

export type NotificationType =
    | 'GROUP_INVITE'
    | 'MESSAGE'
    | 'FOLLOW_REQUEST'
    | 'JOIN_GROUP_REQUEST'
    | 'GROUP_CREATED';

export type Notification = {
    id: number;
    type: NotificationType;
    data: any;
};

type NotificationCenterProps = {
    onGroupInviteHandled?: () => void;
};

const NotificationCenter = ({ onGroupInviteHandled }: NotificationCenterProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {

        const fetchNotifications = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/notifications/get',{
                    credentials: "include",
                });
                if (!res.ok) throw new Error('Failed to fetch notifications');
                const data = await res.json();
                
                const notifs = Array.isArray(data) ? data : data.data;
                if (Array.isArray(notifs)) setNotifications(notifs);
            } catch (err) {
                console.error(err);
            }
        };
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            const incoming = (e as CustomEvent).detail as Notification;

            setNotifications((prev) => [incoming, ...prev]);
        };

        window.addEventListener('ws-notification', handler);
        return () => window.removeEventListener('ws-notification', handler);
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
