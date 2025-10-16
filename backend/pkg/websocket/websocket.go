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
		fmt.Println(LoggedInUserID)
	}

	con, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade: %v", err)
		return
	}
	defer func() {

		con.Close()
	}()

	time.Sleep(100 * time.Millisecond)
	conn := &Conn{Conn: con}
	clients[LoggedInUserID] = conn
	log.Println("Client connected")

	UpdateUserList()

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
				fmt.Println("fuck2")
				fmt.Println("super fuck error")
				fmt.Println(err)
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
				
				fmt.Println("unmarshal error 1")
				continue
			}
			// fmt.Println("sento: " + sentom)
			fmt.Println(data)
			sento := data.UserID
			message := data.Message
			fmt.Println(message)
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

func BroadCast(response any) {
	for _, value := range clients {
		value.Lock.Lock()
		value.Conn.WriteJSON(response)
		value.Lock.Unlock()
	}
}

func UpdateUserList() {
	users, err := dbConn.GetAllUsers()
	if err != nil {
		fmt.Println(err)
		return
	}
	response := struct {
		Type  string
		Users []dbConn.UserDisplay
	}{
		Type: "userlist",
		Users: users,
	}

	BroadCast(response)
}
