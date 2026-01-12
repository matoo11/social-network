import NotificationCard from './NotificationCard';

const JoinGroupRequestNotification = ({
    username,
    groupName,
}: {
    username: string;
    groupName: string;
}) => {
    return (
        <NotificationCard>
            <p className="text-sm">
                <strong>{username}</strong> requested to join
                <strong> {groupName}</strong>
            </p>

            <div className="flex gap-2">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-1 rounded">
                    Approve
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-1 rounded">
                    Reject
                </button>
            </div>
        </NotificationCard>
    );
};

export default JoinGroupRequestNotification;
