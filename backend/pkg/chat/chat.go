package chat

import (
	"fmt"
	"net/http"
	"strings"
	"sync"

	"github.com/gorilla/websocket"

	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	"social/backend/pkg/logs"
	"social/backend/pkg/util"
)

// =============================================================================
// WebSocket Handler
// =============================================================================

// ChatHandler handles WebSocket connections for real-time chat functionality.
// It authenticates the user, upgrades the connection, and manages message routing.
func ChatHandler(w http.ResponseWriter, r *http.Request) {
	logs.LogInfo("WebSocket endpoint hit")

	user, authenticated := auth.Authenticator(w, r)
	if !authenticated {
		util.Respond(w, r, http.StatusUnauthorized, nil, "User unauthorized")
		return
	}

	// Upgrade HTTP connection to WebSocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logs.LogError("WebSocket upgrade failed: %v", err)
		util.Respond(w, r, http.StatusBadRequest, nil, fmt.Sprintf("WebSocket upgrade failed: %v", err))
		return
	}
	logs.LogInfo("Client connected: %s", user.Nick_Name)

	// Clean up on function exit (connection close or error)
	defer func() {
		logs.LogInfo("Client disconnecting: %s", user.Nick_Name)
		clientManager.RemoveClient(ws)
		go clientManager.UpdateAllUsersList()
		ws.Close()
	}()

	// Register client connection
	clientManager.AddClient(user.Nick_Name, ws)
	go clientManager.UpdateUsersList(ws)

	// Send initial chat list to the newly connected client
	if err := sendInitialChatList(ws, user.Nick_Name); err != nil {
		logs.LogError("Failed to send initial chat list: %v", err)
		return
	}

	// Send message history to the client
	if err := sendMessageHistory(ws, user.User_ID); err != nil {
		logs.LogError("Failed to send message history: %v", err)
		return
	}

	// Main message processing loop
	for {
		var msg WSMessage
		if err := ws.ReadJSON(&msg); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logs.LogError("WebSocket read error: %v", err)
			}
			break
		}

		logs.LogInfo("Message received: from=%s, to=%s", msg.From, msg.To)

		if err := processAndDeliverMessage(ws, msg); err != nil {
			logs.LogError("Failed to process message: %v", err)
			// Continue processing other messages instead of breaking
			continue
		}
	}
}

// =============================================================================
// Helper Functions
// =============================================================================

// sendInitialChatList sends the chat list (all users and online users) to a client
func sendInitialChatList(ws *websocket.Conn, userNickname string) error {
	userList, err := dbConn.RetrieveChatListForDisplay(userNickname)
	if err != nil {
		return fmt.Errorf("failed to retrieve chat list: %w", err)
	}

	chatList := ChatList{
		AllUsers:    userList,
		OnlineUsers: clientManager.GetOnlineUsers(),
	}

	payload := ChatPayload{
		PayLoadType: PayloadTypeChatList,
		Data:        chatList,
	}

	if err := ws.WriteJSON(payload); err != nil {
		return fmt.Errorf("failed to write chat list: %w", err)
	}
	return nil
}

// sendMessageHistory sends the user's message history
func sendMessageHistory(ws *websocket.Conn, userID int) error {
	messagesMap, err := dbConn.RetieveMessagesMapForDisplayByUserID(userID)
	if err != nil {
		return fmt.Errorf("failed to retrieve messages: %w", err)
	}

	payload := ChatPayload{
		PayLoadType: PayloadTypePrivateMessages,
		Data:        messagesMap,
	}

	if err := ws.WriteJSON(payload); err != nil {
		return fmt.Errorf("failed to write messages: %w", err)
	}
	return nil
}

// processAndDeliverMessage handles the complete flow of processing and delivering a message
func processAndDeliverMessage(ws *websocket.Conn, msg WSMessage) error {
	// Validate message content
	content := strings.TrimSpace(msg.Content)
	if content == "" {
		return fmt.Errorf("empty message content")
	}

	// Look up sender and receiver
	sender, err := dbConn.GetUserIDByUserNickname(msg.From)
	if err != nil {
		return fmt.Errorf("failed to find sender '%s': %w", msg.From, err)
	}

	receiver, err := dbConn.GetUserIDByUserNickname(msg.To)
	if err != nil {
		return fmt.Errorf("failed to find receiver '%s': %w", msg.To, err)
	}

	// Persist message to database
	dbMsg := dbConn.Message{
		MessageText: content,
		SenderID:    sender.User_ID,
		ReceiverID:  receiver.User_ID,
	}

	messageID, err := dbConn.CreateNewMessage(dbMsg)
	if err != nil {
		return fmt.Errorf("failed to save message: %w", err)
	}

	// Retrieve the saved message for display
	displayedMessage, err := dbConn.RetrieveMessageForDisplayByID(messageID)
	if err != nil {
		return fmt.Errorf("failed to retrieve saved message: %w", err)
	}

	// Send confirmation to sender
	payload := ChatPayload{
		PayLoadType: PayloadTypeMessageSent,
		Data:        displayedMessage,
	}

	if err := ws.WriteJSON(payload); err != nil {
		return fmt.Errorf("failed to send confirmation: %w", err)
	}

	// Notify recipient asynchronously
	go clientManager.NotifyMessageReceiver(displayedMessage.To, payload)

	return nil
}

// =============================================================================
// Client Manager
// =============================================================================

// ClientManager handles WebSocket client connections and provides
// thread-safe operations for managing connected users.
type ClientManager struct {
	clients    sync.Map // map[string]*sync.Map (userNickname → connections)
	connToUser sync.Map // map[*websocket.Conn]string (connection → userNickname)
}

// clientManager is the singleton instance for managing all WebSocket clients
var clientManager = &ClientManager{}

// AddClient registers a new WebSocket connection for a user.
// Supports multiple connections per user (e.g., multiple browser tabs).
func (cm *ClientManager) AddClient(userNickname string, conn *websocket.Conn) {
	val, _ := cm.clients.LoadOrStore(userNickname, &sync.Map{})
	conns := val.(*sync.Map)
	conns.Store(conn, true)
	cm.connToUser.Store(conn, userNickname)
}

// RemoveClient removes a specific WebSocket connection.
// If the user has no remaining connections, they are marked as offline.
func (cm *ClientManager) RemoveClient(conn *websocket.Conn) {
	userNicknameVal, exists := cm.connToUser.Load(conn)
	if !exists {
		return
	}
	userNickname := userNicknameVal.(string)

	val, exists := cm.clients.Load(userNickname)
	if !exists {
		return
	}
	conns := val.(*sync.Map)

	conns.Delete(conn)
	cm.connToUser.Delete(conn)

	// Check if user has any remaining connections
	if !cm.hasConnections(conns) {
		cm.clients.Delete(userNickname)
	}
}

// RemoveClientByUsername forcefully disconnects all connections for a user.
func (cm *ClientManager) RemoveClientByUsername(userNickname string) {
	val, exists := cm.clients.Load(userNickname)
	if !exists {
		return
	}
	conns := val.(*sync.Map)

	conns.Range(func(k, v interface{}) bool {
		conn := k.(*websocket.Conn)
		cm.connToUser.Delete(conn)
		conns.Delete(conn)
		return true
	})

	cm.clients.Delete(userNickname)
}

// hasConnections checks if a connection map has any active connections
func (cm *ClientManager) hasConnections(conns *sync.Map) bool {
	hasConns := false
	conns.Range(func(k, v interface{}) bool {
		hasConns = true
		return false // stop early
	})
	return hasConns
}

// IsUserOnline checks if a user has any active WebSocket connections.
func (cm *ClientManager) IsUserOnline(userNickname string) bool {
	_, exists := cm.clients.Load(userNickname)
	return exists
}

// GetOnlineUsers returns a list of all currently connected usernames.
func (cm *ClientManager) GetOnlineUsers() []string {
	users := make([]string, 0)
	cm.clients.Range(func(key, value interface{}) bool {
		users = append(users, key.(string))
		return true
	})
	return users
}

// UpdateUsersList broadcasts the updated user list to all connected clients
// except the newly connected one (they already received it).
func (cm *ClientManager) UpdateUsersList(excludeConn *websocket.Conn) {
	onlineUsers := cm.GetOnlineUsers()

	cm.connToUser.Range(func(key, value any) bool {
		ws := key.(*websocket.Conn)
		if ws == excludeConn {
			return true // skip the excluded connection
		}

		currentUser := value.(string)
		userList, err := dbConn.RetrieveChatListForDisplay(currentUser)
		if err != nil {
			logs.LogError("Failed to retrieve chat list for %s: %v", currentUser, err)
			return true
		}

		payload := ChatPayload{
			PayLoadType: PayloadTypeChatList,
			Data: ChatList{
				AllUsers:    userList,
				OnlineUsers: onlineUsers,
			},
		}

		if err := ws.WriteJSON(payload); err != nil {
			logs.LogError("Failed to send user list update: %v", err)
		}
		return true
	})
}

// UpdateAllUsersList broadcasts the updated user list to all connected clients.
func (cm *ClientManager) UpdateAllUsersList() {
	onlineUsers := cm.GetOnlineUsers()

	cm.connToUser.Range(func(key, value any) bool {
		ws := key.(*websocket.Conn)
		currentUser := value.(string)

		userList, err := dbConn.RetrieveChatListForDisplay(currentUser)
		if err != nil {
			logs.LogError("Failed to retrieve chat list for %s: %v", currentUser, err)
			return true
		}

		payload := ChatPayload{
			PayLoadType: PayloadTypeChatList,
			Data: ChatList{
				AllUsers:    userList,
				OnlineUsers: onlineUsers,
			},
		}

		if err := ws.WriteJSON(payload); err != nil {
			logs.LogError("Failed to send user list update: %v", err)
		}
		return true
	})
}

// GetConnByUsername finds and returns the first WebSocket connection for a user.
// Returns nil if the user is not connected.
func (cm *ClientManager) GetConnByUsername(username string) *websocket.Conn {
	var result *websocket.Conn
	cm.connToUser.Range(func(key, value interface{}) bool {
		if nickname, ok := value.(string); ok && nickname == username {
			if conn, ok := key.(*websocket.Conn); ok {
				result = conn
				return false // found, stop iteration
			}
		}
		return true
	})
	return result
}

// NotifyMessageReceiver sends a message notification to the recipient.
// Returns an error if the recipient is offline or the send fails.
func (cm *ClientManager) NotifyMessageReceiver(receiverNickname string, payload ChatPayload) error {
	payload.PayLoadType = PayloadTypeMessageReceived

	wsConn := cm.GetConnByUsername(receiverNickname)
	if wsConn == nil {
		// User is offline - this is not necessarily an error
		logs.LogInfo("User %s is offline, message will be delivered on next login", receiverNickname)
		return nil
	}

	if err := wsConn.WriteJSON(payload); err != nil {
		logs.LogError("Failed to notify receiver %s: %v", receiverNickname, err)
		return fmt.Errorf("failed to notify receiver %s: %w", receiverNickname, err)
	}
	return nil
}
