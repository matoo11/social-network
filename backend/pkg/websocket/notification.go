package websocket

import (
	"encoding/json"
	"fmt"
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

type EventCreated struct {
	EventID   int    `json:"eventId"`
	GroupID   int    `json:"groupId"`
	GroupName string `json:"groupName"`
	EventName string `json:"eventName"`
}

type Notification struct {
	Id   int    `json:"Id"`
	Type string `json:"type"`
	Data any    `json:"data"`
}

func SendNotification(nId int, to int, nType int) {
	switch nType {
	case 3:
		conn := GetClientConn(to)
		notification, err := dbConn.GetNotificationByID(nId)
		if err != nil {
			fmt.Println("notification error getting notification:", err)
			return
		}

		requester, err := dbConn.GetUserByID(notification.SourceID)
		if err != nil {
			fmt.Println("notification error getting requester:", err)
			return
		}

		type FollowRequest struct {
			RequesterID   int    `json:"requesterId"`
			RequesterName string `json:"requesterName"`
		}

		followReq := FollowRequest{
			RequesterID:   notification.SourceID,
			RequesterName: requester.User_Name,
		}

		f := Notification{
			Id:   nId,
			Type: "FOLLOW_REQUEST",
			Data: followReq,
		}

		data, _ := json.Marshal(f)
		res := Response{
			Type: "notification",
			Data: data,
		}

		if conn != nil {
			conn.Lock.Lock()
			conn.Conn.WriteJSON(res)
			conn.Lock.Unlock()

		}

	case 6:

		conn := GetClientConn(to)
		notification, err := dbConn.GetNotificationByID(nId)
		if err != nil {
			fmt.Printf("notification error getting notification: %v\n", err)
			return
		}

		inviteId := notification.SourceID
		invit, err := dbConn.GetGroupInviteByID(inviteId)

		if err != nil {
			fmt.Printf("notification error getting invite: %v\n", err)
			return
		}

		group, err := dbConn.GetGroupByID(invit.GroupID)

		if err != nil {
			fmt.Printf("notification error getting group: %v\n", err)
			return
		}
		invite := GroupInvite{
			InviteId:  inviteId,
			GroupName: group.Title,
		}

		f := Notification{
			Id:   nId,
			Type: "GROUP_INVITE",
			Data: invite,
		}

		data, _ := json.Marshal(f)
		res := Response{
			Type: "notification",
			Data: data,
		}

		if conn != nil {
			conn.Lock.Lock()
			conn.Conn.WriteJSON(res)
			conn.Lock.Unlock()

		}
	case 10:
		conn := GetClientConn(to)
		notification, err := dbConn.GetNotificationByID(nId)
		if err != nil {
			return
		}

		inviteId := notification.SourceID
		inv, err := dbConn.GetGroupInviteByID(inviteId)
		if err != nil {
			return
		}

		group, err := dbConn.GetGroupByID(inv.GroupID)
		if err != nil {
			return
		}

		requester, err := dbConn.GetUserByID(inv.InviterID)
		requesterName := ""
		if err == nil {
			requesterName = requester.User_Name
		}

		payload := JoinGroupRequest{
			InviteId:      inviteId,
			GroupName:     group.Title,
			RequesterName: requesterName,
		}

		f := Notification{
			Id:   nId,
			Type: "JOIN_GROUP_REQUEST",
			Data: payload,
		}

		data, _ := json.Marshal(f)
		res := Response{
			Type: "notification",
			Data: data,
		}

		if conn != nil {
			conn.Lock.Lock()
			conn.Conn.WriteJSON(res)
			conn.Lock.Unlock()
		}
	case 11:
		conn := GetClientConn(to)
		notification, err := dbConn.GetNotificationByID(nId)
		if err != nil {
			return
		}

		eventID := notification.SourceID
		event, err := dbConn.GetGroupEventByID(eventID)
		if err != nil {
			return
		}

		group, err := dbConn.GetGroupByID(event.GroupID)
		if err != nil {
			return
		}

		payload := EventCreated{
			EventID:   eventID,
			GroupID:   event.GroupID,
			GroupName: group.Title,
			EventName: event.Title,
		}

		f := Notification{
			Id:   nId,
			Type: "EVENT_CREATED",
			Data: payload,
		}

		data, _ := json.Marshal(f)
		res := Response{
			Type: "notification",
			Data: data,
		}

		if conn != nil {
			conn.Lock.Lock()
			conn.Conn.WriteJSON(res)
			conn.Lock.Unlock()
		}
	}
}

// SendNotificationRemoval sends a message to remove a notification from the client's UI
func SendNotificationRemoval(notificationID int, targetUserID int) {
	conn := GetClientConn(targetUserID)
	if conn == nil {
		return
	}

	payload := struct {
		NotificationID int `json:"notificationId"`
	}{
		NotificationID: notificationID,
	}

	data, _ := json.Marshal(payload)
	res := Response{
		Type: "notification_removed",
		Data: data,
	}

	conn.Lock.Lock()
	conn.Conn.WriteJSON(res)
	conn.Lock.Unlock()
}
