package notification

import (
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
)

type GroupInvite struct {
	InviteId    int    `json:"inviteId"`
	GroupName   string `json:"groupName"`
	InviterName string `json:"inviterName"`
}

type JoinGroupRequest struct {
	InviteId      int    `json:"inviteId"`
	GroupName     string `json:"groupName"`
	RequesterName string `json:"requesterName"`
}

type FollowRequest struct {
	RequesterID   int    `json:"requesterId"`
	RequesterName string `json:"requesterName"`
}

type EventCreated struct {
	EventID   int    `json:"eventId"`
	GroupID   int    `json:"groupId"`
	GroupName string `json:"groupName"`
	EventName string `json:"eventName"`
}

type Notification struct {
	Id   int    `json:"id"`
	Type string `json:"type"`
	Data any    `json:"data"`
}

func GetNotifications(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.Authenticator(w, r)
	if !ok {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return
	}

	notifs, err := dbConn.GetNotificationsByTargetID(user.User_ID)
	if err != nil {
		fmt.Println("GetNotificationsByTargetID error:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	out := make([]Notification, 0)
	for _, n := range notifs {
		switch n.NotificationTypeID {
		case 3: // Follow Request
			notif, ok := mapFollowRequestNotification(n)
			if ok {
				out = append(out, notif)
			}
		case 6: // Group Invite
			notif, ok := mapGroupInviteNotification(n)
			if ok {
				out = append(out, notif)
			}
		case 10: // Join Group Request
			notif, ok := mapJoinGroupRequestNotification(n)
			if ok {
				out = append(out, notif)
			}
		case 11: // Event Created
			notif, ok := mapEventCreatedNotification(n)
			if ok {
				out = append(out, notif)
			}
			// Add more cases for other notification types in the future
		}
	}

	if err := auth.JsonEncode(w, out); err != nil {
		fmt.Println("JsonEncode error:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}

func mapGroupInviteNotification(n dbConn.NotificationDisplay) (Notification, bool) {
	inviteId := n.SourceID
	inv, err := dbConn.GetGroupInviteByID(inviteId)
	if err != nil {
		return Notification{}, false
	}
	group, err := dbConn.GetGroupByID(inv.GroupID)
	if err != nil {
		return Notification{}, false
	}
	inviter, err := dbConn.GetUserByID(inv.InviterID)
	inviterName := ""
	if err == nil {
		inviterName = inviter.User_Name
	}
	return Notification{
		Id:   n.NotificationID,
		Type: "GROUP_INVITE",
		Data: GroupInvite{
			InviteId:    inviteId,
			GroupName:   group.Title,
			InviterName: inviterName,
		},
	}, true
}

func mapJoinGroupRequestNotification(n dbConn.NotificationDisplay) (Notification, bool) {
	inviteId := n.SourceID
	inv, err := dbConn.GetGroupInviteByID(inviteId)
	if err != nil {
		return Notification{}, false
	}
	group, err := dbConn.GetGroupByID(inv.GroupID)
	if err != nil {
		return Notification{}, false
	}
	requester, err := dbConn.GetUserByID(inv.InviterID)
	requesterName := ""
	if err == nil {
		requesterName = requester.User_Name
	}

	return Notification{
		Id:   n.NotificationID,
		Type: "JOIN_GROUP_REQUEST",
		Data: JoinGroupRequest{
			InviteId:      inviteId,
			GroupName:     group.Title,
			RequesterName: requesterName,
		},
	}, true
}

func mapFollowRequestNotification(n dbConn.NotificationDisplay) (Notification, bool) {
	requesterID := n.SourceID
	requester, err := dbConn.GetUserByID(requesterID)
	if err != nil {
		return Notification{}, false
	}

	return Notification{
		Id:   n.NotificationID,
		Type: "FOLLOW_REQUEST",
		Data: FollowRequest{
			RequesterID:   requesterID,
			RequesterName: requester.User_Name,
		},
	}, true
}

func mapEventCreatedNotification(n dbConn.NotificationDisplay) (Notification, bool) {
	eventID := n.SourceID
	event, err := dbConn.GetGroupEventByID(eventID)
	if err != nil {
		return Notification{}, false
	}
	group, err := dbConn.GetGroupByID(event.GroupID)
	if err != nil {
		return Notification{}, false
	}

	return Notification{
		Id:   n.NotificationID,
		Type: "EVENT_CREATED",
		Data: EventCreated{
			EventID:   eventID,
			GroupID:   event.GroupID,
			GroupName: group.Title,
			EventName: event.Title,
		},
	}, true
}

func DismissNotification(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}

	user, ok := auth.Authenticator(w, r)
	if !ok {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return
	}

	var payload struct {
		NotificationID int `json:"notificationId"`
	}

	if err := auth.JsonDecode(w, r, &payload); err != nil {
		http.Error(w, "invalid JSON payload", http.StatusBadRequest)
		return
	}

	notif, err := dbConn.GetNotificationByID(payload.NotificationID)
	if err != nil {
		http.Error(w, "notification not found", http.StatusNotFound)
		return
	}

	if notif.TargetID != user.User_ID {
		http.Error(w, "unauthorized", http.StatusForbidden)
		return
	}

	if err := dbConn.DeactivateNotification(payload.NotificationID); err != nil {
		http.Error(w, "failed to dismiss notification", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
