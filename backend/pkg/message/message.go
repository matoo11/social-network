package message

import (
	"encoding/json"
	"fmt"
	"social/backend/pkg/websocket"
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

	sentoConn := websocket.Clients[sento]
	if sentoConn == nil {
		fmt.Println("the user is not online")
		conn := websocket.Clients[owner]
		if conn == nil {
			fmt.Println("fuck error")
			return
		}

		chat := ChatData{
			Message: "user is not online",
		}
		jsonChat, _ := json.Marshal(chat)
		response := websocket.Response{
			Type: "chat",
			Data: jsonChat,
		}
		// conn.Mu.Lock()
		conn.WriteJSON(response)
		// conn.Mu.Unlock()

		return
	}
	chat := ChatData{
		Message:        message,
		RecieverID:     sento,
		SenderID:       owner,
		SenderUsername: ownerUsername,
	}
	dbchat := dbConn.Chat{
		SenderID:    chat.SenderID,
		ReceiverID:  chat.RecieverID,
		MessageText: chat.Message,
		CreatedByID: chat.SenderID,
	}
	dbConn.CreateChatMessage(dbchat)
	response := websocket.Response{
		Type: "chat",
		Data: chat,
	}
	// sentoConn.Mu.Lock()
	sentoConn.WriteJSON(response)
	// sentoConn.Mu.Unlock()

}
