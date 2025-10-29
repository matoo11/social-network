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
	Time             time.Time `json:"time"`
}

func ChatHandler(sento int, message string, conn *Conn, LoggedInUserID int, LoggedInUsername string, Type int) {
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

func groupChat() {

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
