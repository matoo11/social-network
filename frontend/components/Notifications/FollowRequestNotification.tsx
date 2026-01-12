import NotificationCard from './NotificationCard';

const FollowRequestNotification = ({ username }: { username: string }) => {
    return (
        <NotificationCard>
            <p className="text-sm">
                <strong>{username}</strong> wants to follow you
            </p>

            <div className="flex gap-2">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-1 rounded">
                    Accept
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-1 rounded">
                    Reject
                </button>
            </div>
        </NotificationCard>
    );
};

export default FollowRequestNotification;
