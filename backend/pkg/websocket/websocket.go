package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"social/backend/pkg/db/dbConn"
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
		var LoggedInUsername string
		err := conn.Conn.ReadJSON(&msg)

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
				ChatID  int    `json:"chatID"`
				Type    int    `json:"type"`
			}{}

			if err := json.Unmarshal(msg.Data, &data); err != nil {

				fmt.Println("unmarshal error 1")
				continue
			}

			sento := data.ChatID
			message := data.Message
			ChatHandler(sento, message, conn, LoggedInUserID, LoggedInUsername, data.Type)

		case "notification":

		}
	}

	clientsLock.Lock()
	if storedConn, ok := clients[LoggedInUserID]; ok && storedConn == conn {
		delete(clients, LoggedInUserID)
	}
	clientsLock.Unlock()

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
		Type  string               `json:"type"`
		Users []dbConn.UserDisplay `json:"users"`
	}{
		Type:  "userlist",
		Users: users,
	}

	BroadCast(response)
}
