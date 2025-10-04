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

type Conn struct {
	Conn *websocket.Conn
	Lock sync.Mutex
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[int]*Conn)

var clientsLock sync.Mutex
var ConnLock sync.Mutex

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

	con, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade: %v", err)
		return
	}
	defer func() {

		// clients[LoggedInUserID].Close()
		con.Close()
	}()

	time.Sleep(100 * time.Millisecond)
	conn := &Conn{Conn: con}
	clients[LoggedInUserID] = conn
	log.Println("Client connected")

	// updateOnlineUsers()
	for {
		var msg Response
		conn.Lock.Lock()
		err := conn.Conn.ReadJSON(&msg)
		conn.Lock.Unlock()
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
		case "notification":

		}
	}

	// log.Printf("Received: %+v", msg.Data)

	log.Println("Client disconnected")
	conn.Lock.Lock()
	conn.Conn.Close()
	conn.Lock.Unlock()
}

func GetClientConn(userID int) *Conn {
	clientsLock.Lock()
	conn := clients[userID]
	clientsLock.Unlock()
	return conn
}
