import NotificationCard from './NotificationCard';

const MessageNotification = ({
    senderName,
    message,
}: {
    senderName: string;
    message: string;
}) => {
    return (
        <NotificationCard>
            <p className="text-sm">
                New message from <strong>{senderName}</strong>
            </p>
            <p className="text-xs text-gray-300 truncate">
                {message}
            </p>
        </NotificationCard>
    );
};

export default MessageNotification;
