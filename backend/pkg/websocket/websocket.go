package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"social/backend/pkg/db/dbConn"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Response struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var Clients map[int]*websocket.Conn
var connLock sync.Mutex

func WebsocketHandler(w http.ResponseWriter, r *http.Request) {

	var LoggedInUserID int
	var LoggedInUsername string
	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return
	} else {
		LoggedInUserID = session.UserID
		_, err := dbConn.GetUserByID(LoggedInUserID)
		if err != nil {
			fmt.Println("super fuck error")
			return
		}

	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade: %v", err)
		return
	}
	defer func() {

		// clients[LoggedInUserID].Close()
		conn.Close()
	}()

	time.Sleep(100 * time.Millisecond)

	clients[LoggedInUserID] = conn
	log.Println("Client connected")

	// updateOnlineUsers()
	for {
		var msg Response
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("Read error: %v", err)
			break
		}

		session, err := dbConn.GetSessionFromCookie(r)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			break
		} else {
			LoggedInUserID = session.UserID
			User, err := dbConn.GetUserByID(LoggedInUserID)
			if err != nil {
				fmt.Println("super fuck error")
				break
			}
			LoggedInUsername = User.User_Name

		}
		switch msg.Type {
		case "chat":
			data := struct {
				Message string `json:"message"`
				UserID  int    `json:"userID"`
			}{}

			if err := json.Unmarshal(msg.Data, &data); err != nil {
				// fmt.Println("chat from", chatMsg.User, ":", chatMsg.Message)
				fmt.Println("unmarshal error 1")
				continue
			}
			// fmt.Println("sento: " + sentom)

			sento := data.UserID
			message := data.Message
			if len(message) >= 100 {
				chat := ChatData{
					Message: "The message is too long",
				}
				chatJson, _ := json.Marshal(chat)
				response := Response{
					Type: "chat",
					Data: chatJson,
				}

				conn.WriteJSON(response)

			} else if len(strings.TrimSpace(message)) == 0 || len(message) == 0 {
				chat := ChatData{
					Message: "Enter a valid message",
				}
				hrar, _ := json.Marshal(chat)
				response := Response{
					Type: "chat",
					Data: hrar,
				}

				conn.WriteJSON(response)

			} else {
				sendChatMessage(LoggedInUserID, LoggedInUsername, sento, message)

			}
		case "notification":

		}
	}

	// log.Printf("Received: %+v", msg.Data)

	log.Println("Client disconnected")
	conn.Close()
}

func GetClientConn(userID int) {

}
