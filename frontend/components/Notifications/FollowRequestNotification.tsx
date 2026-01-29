'use client';

import { useState } from 'react';
import NotificationCard from './NotificationCard';

type Props = {
    notificationId: number;
    requesterId: number;
    requesterName: string;
    onHandled: () => void;
};

const FollowRequestNotification = ({ notificationId, requesterId, requesterName, onHandled }: Props) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAccept = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch('http://localhost:8080/api/follow/acceptRequest', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterId }),
            });

            if (response.ok) {
                // await fetch(`http://localhost:8080/api/notifications/delete/${notificationId}`, {
                //     method: 'DELETE',
                //     credentials: 'include',
                // });
                onHandled();
            } else {
                console.error('Failed to accept follow request');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Error accepting follow request:', error);
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch('http://localhost:8080/api/follow/rejectRequest', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterId }),
            });

            if (response.ok) {
                await fetch(`http://localhost:8080/api/notifications/delete/${notificationId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                onHandled();
            } else {
                console.error('Failed to reject follow request');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Error rejecting follow request:', error);
            setIsProcessing(false);
        }
    };

    return (
        <NotificationCard>
            <p className="text-sm">
                <strong>{requesterName}</strong> wants to follow you
            </p>

            <div className="flex gap-2">
                <button
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-1 rounded disabled:opacity-50"
                >
                    Accept
                </button>
                <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-1 rounded disabled:opacity-50"
                >
                    Reject
                </button>
            </div>
        </NotificationCard>
    );
};

export default FollowRequestNotification;
