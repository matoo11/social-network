package websocket

import (
	"encoding/json"
	"fmt"
	"social/backend/pkg/db/dbConn"
	"time"
)

type ChatData struct {
	Message          string    `json:"message"`
	RecieverID       int       `json:"recieverID"`
	SenderID         int       `json:"senderID"`
	SenderUsername   string    `json:"senderUsername"`
	RecieverUsername string    `json:"recieverUsername"`
	Time             time.Time `json:"time"`
}

func SendChatMessage(owner int, ownerUsername string, sento int, message string) {

	sentoConn := GetClientConn(sento)
	if sentoConn == nil {
		fmt.Println("the user is not online")
		conn := GetClientConn(owner)
		if conn.Conn == nil {
			fmt.Println("fuck error")
			return
		}

		chat := ChatData{
			Message: "user is not online",
		}
		jsonChat, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: jsonChat,
		}
		
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()
		return
	}
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
	dbConn.CreateChatMessage(dbchat)
	chatJson, _ := json.Marshal(chat)
	response := Response{
		Type: "chat",
		Data: chatJson,
	}
	
	sentoConn.Lock.Lock()
	sentoConn.Conn.WriteJSON(response)
	sentoConn.Lock.Unlock()
}
