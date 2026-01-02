package chat

import (
	"net/http"

	"github.com/gorilla/websocket"
)

// =============================================================================
// Constants
// =============================================================================

// PayloadTypes is a map of all valid payload types for WebSocket messages
var PayloadTypes = map[string]string{
    "chatList":        "chatList",
    "privateMessagesHistory": "privateMessagesHistory",
    "messageSent":     "messageSent",
    "messageReceived": "messageReceived",
    "initialChatList": "initialChatList",
}

// Allowed origins for WebSocket connections
var allowedOrigins = []string{
	"http://localhost:3000",
}

// =============================================================================
// WebSocket Configuration
// =============================================================================

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				return true
			}
		}
		return false
	},
}

// =============================================================================
// Types
// =============================================================================

// WsPayload represents the standard WebSocket message envelope
type WsPayload struct {
	PayLoadType string `json:"payLoadType"`
	Data        any    `json:"data"`
}

// ChatList contains user lists for the chat UI
type ChatList struct {
	AllUsers    []string `json:"allUsers"`
	OnlineUsers []string `json:"onlineUsers"`
}

// WSMessage represents an incoming WebSocket message from a client
type WSMessage struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Content string `json:"content"`
}
