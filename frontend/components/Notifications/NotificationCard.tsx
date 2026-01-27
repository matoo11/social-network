type NotificationCardProps = {
    children: React.ReactNode;
};

const NotificationCard: React.FC<NotificationCardProps> = ({ children }) => {
    return (
        <div className="border border-gray-600 rounded-lg p-4 bg-gray-800 text-white flex flex-col gap-2">
            {children}
        </div>
    );
};

export default NotificationCard;
