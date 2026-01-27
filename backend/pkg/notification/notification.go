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

type Notification struct {
	Id   int    `json:"id"`
	Type string `json:"type"`
	Data any    `json:"data"`
}

func GetGroupInviteNotificationsHandler(w http.ResponseWriter, r *http.Request) {
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

	var out []Notification
	for _, n := range notifs {
		switch n.NotificationTypeID {
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
