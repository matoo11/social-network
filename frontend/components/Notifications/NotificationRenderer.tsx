import { Notification } from './NotificationCenter';
import GroupInviteNotification from './GroupInviteNotification';
import JoinGroupRequestNotification from './JoinGroupRequestNotification';

type Props = {
    notification: Notification;
    onHandled: () => void;
};

const NotificationRenderer = ({ notification, onHandled }: Props) => {
    switch (notification.type) {
        case 'GROUP_INVITE':
            console.log(notification)
            return (
                <GroupInviteNotification
                    notificationId={notification.id}
                    inviteId={notification.data.inviteId}
                    groupName={notification.data.groupName}
                    inviterName={notification.data.inviterName}
                    onHandled={onHandled}
                />
            );

        case 'JOIN_GROUP_REQUEST':
            return (
                <JoinGroupRequestNotification
                    notificationId={notification.id}
                    inviteId={notification.data.inviteId}
                    groupName={notification.data.groupName}
                    requesterName={notification.data.requesterName}
                    onHandled={onHandled}
                />
            );

        // future cases:
        // case 'MESSAGE':
        // case 'FOLLOW_REQUEST':

        default:
            return null;
    }
};

export default NotificationRenderer;
