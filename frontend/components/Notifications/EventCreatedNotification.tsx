import NotificationCard from './NotificationCard';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

type Props = {
    notificationId: number;
    eventId: number;
    groupId: number;
    groupName: string;
    eventName: string;
    onHandled: () => void;
};

const EventCreatedNotification = ({
    notificationId,
    eventId,
    groupId,
    groupName,
    eventName,
    onHandled,
}: Props) => {
    const dismiss = async () => {
        try {
            const res = await fetchWithAuth('http://localhost:8080/api/notifications/dismiss', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });

            if (res.ok) {
                onHandled();
            }
        } catch (err) {
            console.error('Failed to dismiss notification:', err);
        }
    };

    return (
        <NotificationCard>
            <p className="text-sm">
                New event <strong>{eventName}</strong> created in group{' '}
                <strong>{groupName}</strong>
            </p>

            <div className="flex gap-2">
                <button
                    onClick={dismiss}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-1 rounded"
                >
                    Dismiss
                </button>
            </div>
        </NotificationCard>
    );
};

export default EventCreatedNotification;
