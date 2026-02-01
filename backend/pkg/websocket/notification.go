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

type EventResponse struct {
	EventID  int    `json:"eventId"`
	GroupID  int    `json:"groupId"`
	UserID   int    `json:"userId"`
	UserName string `json:"userName"`
	OptionID int    `json:"optionId"`
	Option   string `json:"option"`
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
			fmt.Println("Follow request notification sent")
		}
		fmt.Println("here123")
	case 6:

		conn := GetClientConn(to)
		notification, err := dbConn.GetNotificationByID(nId)
		if err != nil {
			fmt.Println("notification error 1")
			return
		}

		inviteId := notification.SourceID
		invit, err := dbConn.GetGroupInviteByID(inviteId)

		if err != nil {
			fmt.Println("notification error 2")
			return
		}

		group, err := dbConn.GetGroupByID(invit.GroupID)

		if err != nil {
			fmt.Println("notification error 2")
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
			fmt.Println("sentttt")
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
	}
}

// SendEventResponse broadcasts event response updates to all group members
func SendEventResponse(eventID, groupID, userID, optionID int, userName, optionName string) {
	// Get all group members
	groupMembers, err := dbConn.GetGroupMembers(groupID)
	if err != nil {
		fmt.Println("Error getting group members for event response:", err)
		return
	}

	// Create event response payload
	eventResponse := EventResponse{
		EventID:  eventID,
		GroupID:  groupID,
		UserID:   userID,
		UserName: userName,
		OptionID: optionID,
		Option:   optionName,
	}

	responseData, err := json.Marshal(eventResponse)
	if err != nil {
		fmt.Println("Error marshaling event response:", err)
		return
	}

	res := Response{
		Type: "event_response",
		Data: responseData,
	}

	// Send to all group members
	for _, member := range groupMembers {
		memberConn := GetClientConn(member.UserID)
		if memberConn != nil {
			memberConn.Lock.Lock()
			if err := memberConn.Conn.WriteJSON(res); err != nil {
				fmt.Printf("Error sending event response to user %d: %v\n", member.UserID, err)
			}
			memberConn.Lock.Unlock()
		}
	}
	fmt.Printf("Event response broadcasted to %d group members\n", len(groupMembers))
}
