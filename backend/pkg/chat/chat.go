package chat

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	"social/backend/pkg/logs"
	"social/backend/pkg/util"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		// Allow Next.js frontend on port 3000
		return origin == "http://localhost:3000"
	},
}

// var Clients = make(map[string]*websocket.Conn)

// var Clients = make(map[*websocket.Conn]string)

type ChatPayload struct {
	PayLoadType string `json:"payLoadType"`
	Data        any    `json:"data"`
}

type ChatList struct {
	AllUsers    []string `json:"allUsers"`
	OnlineUsers []string `json:"onlineUsers"`
}

type WSMessage struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Content string `json:"content"`
}

func ChatHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("WebSocket Endpoint Hit")
	user, authenticated := auth.Authenticator(w, r)

	if !authenticated {
		util.Respond(w, r, http.StatusUnauthorized, nil, "User unauthorized")
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil { // Handle message...
		util.Respond(w, r, http.StatusBadRequest, nil, fmt.Sprintf("WebSocket upgrade failed: %v", err))
		return
	}
	logs.LogInfo(fmt.Sprintf("New Client has Connected (%v) ", user.Nick_Name))

	// Clean up on function exit (connection close or error)
	defer func() {
		logs.LogInfo("Connection in backend is closing...")

		clientManager.RemoveClient(ws)
		go clientManager.UpdateAllUsersList()
		ws.Close()
	}()

	// Update Online Users List
	clientManager.AddClient(user.Nick_Name, ws)
	go clientManager.UpdateUsersList(ws)

	// Get Chat List per User
	userList, err := dbConn.RetrieveChatListForDisplay(user.Nick_Name)
	if err != nil {
		logs.LogError(err.Error())
	}

	// Get Online Users List
	onlineClientList := clientManager.GetOnlineUsers()

	// Prepare payLoad to send it to FrontEnd
	var chatList ChatList
	chatList.AllUsers = userList
	chatList.OnlineUsers = onlineClientList

	var payLoad ChatPayload
	payLoad.PayLoadType = "chatList"
	payLoad.Data = chatList

	err = ws.WriteJSON(payLoad)
	if err != nil {
		logs.LogError("Error writing JSON for the payLoad in ChatHandler")
	}

	displayedMessagesMap, err := dbConn.RetieveMessagesMapForDisplayByUserID(user.User_ID)
	if err != nil {
		logs.LogError("Error writing JSON for the payLoad in ChatHandler")
	}

	payLoad.PayLoadType = "privateMessages"
	payLoad.Data = displayedMessagesMap

	err = ws.WriteJSON(payLoad)
	if err != nil {
		logs.LogError("Error writing JSON for the payLoad in ChatHandler")
	}

	for {
		var msg WSMessage
		err := ws.ReadJSON(&msg)
		if err != nil {
			logs.LogError("Read error: " + err.Error())
			break
		}

		sender, err := dbConn.GetUserIDByUserNickname(msg.From)
		if err != nil {
			logs.LogError("Read error: " + err.Error())
			break
		}
		receiver, err := dbConn.GetUserIDByUserNickname(msg.To)
		if err != nil {
			logs.LogError("Read error: " + err.Error())
			break
		}

		dbMsg := dbConn.Message{
			MessageText: strings.TrimSpace(msg.Content),
			SenderID:    sender.User_ID,
			ReceiverID:  receiver.User_ID,
		}
		messageID, err := dbConn.CreateNewMessage(dbMsg)
		if err != nil {
			logs.LogError("DB error: " + err.Error())
			break
		}

		displayedMessage, err := dbConn.RetrieveMessageForDisplayByID(messageID)
		if err != nil {
			logs.LogError("DB error: " + err.Error())
			break
		}

		var payLoad ChatPayload
		payLoad.PayLoadType = "messageSent"
		payLoad.Data = displayedMessage

		err = ws.WriteJSON(payLoad)
		if err != nil {
			logs.LogError("Error writing JSON for the payLoad in ChatHandler")
		}
		go clientManager.NotifyMessageReceiver(displayedMessage.To, payLoad)

	}
}

//  ===============================================================================
//  ===============================================================================

type ClientManager struct {
	clients    sync.Map // map[string]*sync.Map (conn → true)
	connToUser sync.Map // map[*websocket.Conn]string
}

var clientManager = &ClientManager{}

// Add a client connection
func (cm *ClientManager) AddClient(userNickname string, conn *websocket.Conn) {
	val, _ := cm.clients.LoadOrStore(userNickname, &sync.Map{})
	conns := val.(*sync.Map)
	conns.Store(conn, true)

	cm.connToUser.Store(conn, userNickname)
}

// Remove a specific client connection
func (cm *ClientManager) RemoveClient(conn *websocket.Conn) {
	// Lookup username by connection
	userNicknameInterface, exists := cm.connToUser.Load(conn)
	if !exists {
		return
	}
	userNickname := userNicknameInterface.(string)

	val, exists := cm.clients.Load(userNickname)
	if !exists {
		return
	}
	conns := val.(*sync.Map)

	conns.Delete(conn)
	cm.connToUser.Delete(conn)

	// If no more connections, remove the username from clients map
	hasConns := false
	conns.Range(func(k, v interface{}) bool {
		hasConns = true
		return false // stop early if any connection found
	})

	if !hasConns {
		cm.clients.Delete(userNickname)
	}
}

func (cm *ClientManager) RemoveClientByUsername(userNickname string) {
	// Load user's connection map
	val, exists := cm.clients.Load(userNickname)
	if !exists {
		return
	}
	conns := val.(*sync.Map)

	// Remove all connections from connToUser
	conns.Range(func(k, v interface{}) bool {
		conn := k.(*websocket.Conn)
		cm.connToUser.Delete(conn)
		conns.Delete(conn) // Optional: clean up internal sync.Map too
		return true
	})

	// Finally, delete the user entry from clients map
	cm.clients.Delete(userNickname)
}

// Check if user is online
func (cm *ClientManager) IsUserOnline(userNickname string) bool {
	_, exists := cm.clients.Load(userNickname)
	return exists
}

// Get list of online usernames
func (cm *ClientManager) GetOnlineUsers() []string {
	var users []string
	cm.clients.Range(func(key, value interface{}) bool {
		users = append(users, key.(string))
		return true
	})
	return users
}

func (cm *ClientManager) UpdateUsersList(newWS *websocket.Conn) {
	var chatList ChatList

	var payLoad ChatPayload
	payLoad.PayLoadType = "chatList"

	chatList.OnlineUsers = cm.GetOnlineUsers()

	cm.connToUser.Range(func(key, value any) bool {
		ws := key.(*websocket.Conn)
		currentUser := value.(string)

		userList, err := dbConn.RetrieveChatListForDisplay(currentUser)
		if err != nil {
			logs.LogError(err.Error())
		}

		chatList.AllUsers = userList
		fmt.Println(chatList)
		payLoad.Data = chatList
		if ws != newWS {
			ws.WriteJSON(payLoad)
		}

		return true
	})
}

func (cm *ClientManager) UpdateAllUsersList() {
	var chatList ChatList

	var payLoad ChatPayload
	payLoad.PayLoadType = "chatList"

	chatList.OnlineUsers = cm.GetOnlineUsers()

	cm.connToUser.Range(func(key, value any) bool {
		ws := key.(*websocket.Conn)
		currentUser := value.(string)

		userList, err := dbConn.RetrieveChatListForDisplay(currentUser)
		if err != nil {
			logs.LogError(err.Error())
		}

		chatList.AllUsers = userList
		payLoad.Data = chatList

		ws.WriteJSON(payLoad)
		return true
	})
}

func (cm *ClientManager) GetConnByUsername(username string) *websocket.Conn {
	var result *websocket.Conn
	cm.connToUser.Range(func(key, value interface{}) bool {
		if val, ok := value.(string); ok && val == username {
			if conn, ok := key.(*websocket.Conn); ok {
				result = conn
				return false // found, stop iteration
			}
		}
		return true // continue searching
	})
	return result
}

func (cm *ClientManager) NotifyMessageReceiver(receiverNickname string, payLoad ChatPayload) error {
	payLoad.PayLoadType = "messageReceived"
	wsConnection := cm.GetConnByUsername(receiverNickname)

	err := wsConnection.WriteJSON(payLoad)
	if err != nil {
		return err
	}
	return nil
}

func MoreMessagesHandler(w http.ResponseWriter, r *http.Request) {
	_, authenticated := auth.Authenticator(w, r)

	if !authenticated {
		util.Respond(w, r, http.StatusBadRequest, nil, "user not signed in")
		return
	}

	var time string
	err := json.NewDecoder(r.Body).Decode(&time)
	if err != nil {
		util.Respond(w, r, http.StatusInternalServerError, nil, "error loading more messges")
		return
	}

	logs.LogInfo(fmt.Sprint(time))

	util.Respond(w, r, http.StatusOK, nil, "loading more messges successful")
}
