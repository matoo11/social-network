import { Notification } from './NotificationCenter';
import GroupInviteNotification from './GroupInviteNotification';
import JoinGroupRequestNotification from './JoinGroupRequestNotification';
import FollowRequestNotification from './FollowRequestNotification';

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

        case 'FOLLOW_REQUEST':
            return (
                <FollowRequestNotification
                    notificationId={notification.id}
                    requesterId={notification.data.requesterId}
                    requesterName={notification.data.requesterName}
                    onHandled={onHandled}
                />
            );

        // future cases:
        // case 'MESSAGE':

        default:
            return null;
    }
};

export default NotificationRenderer;
