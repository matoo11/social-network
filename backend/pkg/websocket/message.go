package websocket

import (
	"encoding/json"
	"fmt"
	"social/backend/pkg/db/dbConn"
	"strings"
	"time"
)

type ChatData struct {
	Message          string    `json:"message"`
	RecieverID       int       `json:"recieverID"`
	SenderID         int       `json:"senderID"`
	SenderUsername   string    `json:"senderUsername"`
	RecieverUsername string    `json:"recieverUsername"`
	GroupID          int       `json:"groupID"`
	Time             time.Time `json:"time"`
}

func ChatHandler(sento int, message string, conn *Conn, LoggedInUserID int, LoggedInUsername string, Type int) {
	switch Type {
	case 1:
		PrivateChat(sento, message, conn, LoggedInUserID, LoggedInUsername)
	case 2:
		GroupChat(sento, message, conn, LoggedInUserID, LoggedInUsername)
	}
}

func PrivateChat(sento int, message string, conn *Conn, LoggedInUserID int, LoggedInUsername string) {
	if len(message) >= 100 {
		chat := ChatData{
			Message: "The message is too long",
		}
		chatJson, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: chatJson,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()

	} else if len(strings.TrimSpace(message)) == 0 || len(message) == 0 {
		chat := ChatData{
			Message: "Enter a valid message",
		}
		hrar, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: hrar,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()

	} else {
		SendChatMessage(LoggedInUserID, LoggedInUsername, sento, message)

	}
}

func SendChatMessage(owner int, ownerUsername string, sento int, message string) {

	sentoConn := GetClientConn(sento)

	chat := ChatData{
		Message:        message,
		RecieverID:     sento,
		SenderID:       owner,
		SenderUsername: ownerUsername,
	}
	dbchat := dbConn.Message{
		SenderID:    chat.SenderID,
		ReceiverID:  chat.RecieverID,
		MessageText: chat.Message,
		CreatedByID: chat.SenderID,
	}
	if err := dbConn.CreateChatMessage(dbchat); err != nil {
		fmt.Println(err)
	}
	chatJson, _ := json.Marshal(chat)
	response := Response{
		Type: "chat",
		Data: chatJson,
	}
	if sentoConn != nil {
		fmt.Println("worked")
		sentoConn.Lock.Lock()
		sentoConn.Conn.WriteJSON(response)
		sentoConn.Lock.Unlock()
	}
}

func GroupChat(groupID int, message string, conn *Conn, LoggedInUserID int, LoggedInUsername string) {
	check, err := dbConn.IsGroupMember(groupID, LoggedInUserID)
	if err != nil {
		fmt.Println("idk error")
		return
	}
	if !check {
		fmt.Println("the user is not a member of the group")
		chat := ChatData{
			Message: "You are not a member of the group",
		}
		chatJSON, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: chatJSON,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()
		return
	}

	if len(strings.TrimSpace(message)) == 0 {
		chat := ChatData{
			Message: "Enter a valid message",
		}
		chatJSON, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: chatJSON,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()
		return
	}

	if len(message) > 300 {
		chat := ChatData{
			Message: "The message is too long (max 300 characters)",
		}
		chatJSON, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: chatJSON,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()
		return
	}

	// Store message in DB
	dbMsg := dbConn.GroupMessage{
		GroupID:     groupID,
		SenderID:    LoggedInUserID,
		MessageText: message,
		CreatedByID: LoggedInUserID,
	}
	if err := dbConn.CreateGroupMessage(dbMsg); err != nil {
		fmt.Println("failed to insert group message:", err)
		return
	}

	// Build message payload
	chat := ChatData{
		Message:        message,
		SenderID:       LoggedInUserID,
		SenderUsername: LoggedInUsername,
		GroupID:        groupID,
		Time:           time.Now(),
	}

	// Broadcast to all online members of this group
	BroadCastGroup(groupID, chat)
}

func BroadCastGroup(groupID int, chat ChatData) {
	groupMembers, err := dbConn.GetGroupMembers(groupID)
	if err != nil {
		fmt.Println("failed to fetch group members:", err)
		return
	}

	chatJSON, _ := json.Marshal(chat)
	response := Response{
		Type: "chat",
		Data: chatJSON,
	}

	for _, member := range groupMembers {
		memberConn := GetClientConn(member.UserID)
		if memberConn != nil {
			memberConn.Lock.Lock()
			memberConn.Conn.WriteJSON(response)
			memberConn.Lock.Unlock()
		}
	}
}
