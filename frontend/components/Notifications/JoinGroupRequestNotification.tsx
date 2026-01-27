import NotificationCard from './NotificationCard';

const JoinGroupRequestNotification = ({
    notificationId,
    inviteId,
    requesterName,
    groupName,
    onHandled,
}: {
    notificationId: number;
    inviteId: number;
    requesterName: string;
    groupName: string;
    onHandled: () => void;
}) => {
    const respond = async (accept: boolean) => {
        const res = await fetch('http://localhost:8080/api/groups/invite/respond', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notificationId,
                inviteId,
                accept,
            }),
        });

        if (res.ok) {
            onHandled();
        }
    };

    return (
        <NotificationCard>
            <p className="text-sm">
                <strong>{requesterName}</strong> requested to join
                <strong> {groupName}</strong>
            </p>

            <div className="flex gap-2">
                <button
                    onClick={() => respond(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-1 rounded"
                >
                    Approve
                </button>
                <button
                    onClick={() => respond(false)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-1 rounded"
                >
                    Reject
                </button>
            </div>
        </NotificationCard>
    );
};

export default JoinGroupRequestNotification;
