import NotificationCard from './NotificationCard';

type Props = {
    notificationId: number;
    groupId: number;
    groupName: string;
    inviterName: string;
    onHandled: () => void;
};

const GroupInviteNotification = ({
    notificationId,
    groupId,
    groupName,
    inviterName,
    onHandled,
}: Props) => {
    const respond = async (action: 'accept' | 'reject') => {
        const res = await fetch(
            'http://localhost:8080/api/groups/invite/respond',
            {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationId,
                    groupId,
                    action,
                }),
            },
        );

        if (res.ok) {
            onHandled();
        }
    };

    return (
        <NotificationCard>
            <p className="text-sm">
                <strong>{inviterName}</strong> invited you to join
                <strong> {groupName}</strong>
            </p>

            <div className="flex gap-2">
                <button
                    onClick={() => respond('accept')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-1 rounded"
                >
                    Accept
                </button>
                <button
                    onClick={() => respond('reject')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-1 rounded"
                >
                    Reject
                </button>
            </div>
        </NotificationCard>
    );
};

export default GroupInviteNotification;
