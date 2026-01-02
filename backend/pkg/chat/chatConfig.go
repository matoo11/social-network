package chat

import (
	"net/http"

	"github.com/gorilla/websocket"
)

// =============================================================================
// Constants
// =============================================================================

// PayloadType constants for WebSocket message types
const (
	PayloadTypeChatList        = "chatList"
	PayloadTypePrivateMessages = "privateMessages"
	PayloadTypeMessageSent     = "messageSent"
	PayloadTypeMessageReceived = "messageReceived"
)

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

// ChatPayload represents the standard WebSocket message envelope
type ChatPayload struct {
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
