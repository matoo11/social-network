import NotificationCard from './NotificationCard';

const GroupCreatedNotification = ({ groupName }: { groupName: string }) => {
    return (
        <NotificationCard>
            <p className="text-sm">
                Group <strong>{groupName}</strong> was created successfully
            </p>
        </NotificationCard>
    );
};

export default GroupCreatedNotification;
