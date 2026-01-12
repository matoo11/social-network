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

type Notification struct {
	Id   int    `json:"Id"`
	Type string `json:"type"`
	Data any    `json:"data"`
}

func SendNotification(nId int, to int, nType int) {
	switch nType {
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
	}
}
