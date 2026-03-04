package websocket

import (
	"encoding/json"
	"fmt"
	"social/backend/pkg/db/dbConn"
	"strings"
	"sync"
	"time"
)

type ChatData struct {
	Message          string    `json:"message"`
	RecieverID       int       `json:"recieverID"`
	SenderID         int       `json:"senderID"`
	SenderUsername   string    `json:"senderUsername"`
	RecieverUsername string    `json:"recieverUsername"`
	GroupID          int       `json:"groupID"`
	Time             time.Time `json:"time"`
}

// MessageCooldown tracks the last message time for each user
type MessageCooldown struct {
	lastMessageTime map[int]time.Time
	mu              sync.RWMutex
}

var messageCooldown = &MessageCooldown{
	lastMessageTime: make(map[int]time.Time),
}

func init() {
	// Start cleanup goroutine to prevent memory leaks
	go cleanupOldCooldowns()
}

const (
	// MessageCooldownDuration is the time users must wait between messages
	MessageCooldownDuration = 1 * time.Second
	// CleanupInterval is how often we clean up old cooldown entries
	CleanupInterval = 5 * time.Minute
)

// cleanupOldCooldowns removes cooldown entries that haven't been used recently
func cleanupOldCooldowns() {
	ticker := time.NewTicker(CleanupInterval)
	defer ticker.Stop()

	for range ticker.C {
		messageCooldown.mu.Lock()
		now := time.Now()
		for userID, lastTime := range messageCooldown.lastMessageTime {
			// Remove entries older than 10 minutes
			if now.Sub(lastTime) > 10*time.Minute {
				delete(messageCooldown.lastMessageTime, userID)
			}
		}
		messageCooldown.mu.Unlock()
	}
}

// CheckCooldown checks if a user can send a message (returns true if allowed)
func (mc *MessageCooldown) CheckCooldown(userID int) bool {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	lastTime, exists := mc.lastMessageTime[userID]
	if !exists {
		mc.lastMessageTime[userID] = time.Now()
		return true
	}

	timeSinceLastMessage := time.Since(lastTime)
	if timeSinceLastMessage < MessageCooldownDuration {
		return false
	}

	mc.lastMessageTime[userID] = time.Now()
	return true
}

// GetRemainingCooldown returns how much time is left on cooldown
func (mc *MessageCooldown) GetRemainingCooldown(userID int) time.Duration {
	mc.mu.RLock()
	defer mc.mu.RUnlock()

	lastTime, exists := mc.lastMessageTime[userID]
	if !exists {
		return 0
	}

	elapsed := time.Since(lastTime)
	if elapsed >= MessageCooldownDuration {
		return 0
	}

	return MessageCooldownDuration - elapsed
}

func ChatHandler(sento int, message string, conn *Conn, LoggedInUserID int, LoggedInUsername string, Type int) {
	// Check cooldown before processing message
	if !messageCooldown.CheckCooldown(LoggedInUserID) {
		remaining := messageCooldown.GetRemainingCooldown(LoggedInUserID)
		chat := ChatData{
			Message: fmt.Sprintf("Please wait %.1f seconds before sending another message", remaining.Seconds()),
		}
		chatJson, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: chatJson,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()
		return
	}
	fmt.Println("Received message:", message, "from user:", LoggedInUserID, "to:", sento, "type:", Type)
	switch Type {
	case 1:
		PrivateChat(sento, message, conn, LoggedInUserID, LoggedInUsername)
	case 2:
		GroupChat(sento, message, conn, LoggedInUserID, LoggedInUsername)
	}
}

func PrivateChat(sento int, message string, conn *Conn, LoggedInUserID int, LoggedInUsername string) {

	isFollowing1, err1 := dbConn.IsFollowing(LoggedInUserID, sento)
	isFollowing2, err2 := dbConn.IsFollowing(sento, LoggedInUserID)

	if err1 != nil || err2 != nil {
		chat := ChatData{
			Message: "Failed to verify follow relationship",
		}
		chatJson, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: chatJson,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()
		return
	}

	if !isFollowing1 && !isFollowing2 {
		chat := ChatData{
			Message: "You can only send messages to users you follow or who follow you",
		}
		chatJson, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: chatJson,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()
		return
	}

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

		sentoConn.Lock.Lock()
		sentoConn.Conn.WriteJSON(response)
		sentoConn.Lock.Unlock()
	}
}

func GroupChat(groupID int, message string, conn *Conn, LoggedInUserID int, LoggedInUsername string) {
	check, err := dbConn.IsGroupMember(groupID, LoggedInUserID)
	if err != nil {
		fmt.Printf("failed to check group membership: %v\n", err)
		return
	}
	if !check {
		fmt.Println("the user is not a member of the group")
		chat := ChatData{
			Message: "You are not a member of the group",
		}
		chatJSON, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: chatJSON,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()
		return
	}

	if len(strings.TrimSpace(message)) == 0 {
		chat := ChatData{
			Message: "Enter a valid message",
		}
		chatJSON, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: chatJSON,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()
		return
	}

	if len(message) > 300 {
		chat := ChatData{
			Message: "The message is too long (max 300 characters)",
		}
		chatJSON, _ := json.Marshal(chat)
		response := Response{
			Type: "chat",
			Data: chatJSON,
		}
		conn.Lock.Lock()
		conn.Conn.WriteJSON(response)
		conn.Lock.Unlock()
		return
	}

	// Store message in DB
	dbMsg := dbConn.GroupMessage{
		GroupID:     groupID,
		SenderID:    LoggedInUserID,
		MessageText: message,
		CreatedByID: LoggedInUserID,
	}
	if err := dbConn.CreateGroupMessage(dbMsg); err != nil {
		fmt.Println("failed to insert group message:", err)
		return
	}

	// Build message payload
	chat := ChatData{
		Message:        message,
		SenderID:       LoggedInUserID,
		SenderUsername: LoggedInUsername,
		GroupID:        groupID,
		Time:           time.Now(),
	}

	// Broadcast to all online members of this group
	BroadCastGroup(groupID, chat, LoggedInUserID)
}

func BroadCastGroup(groupID int, chat ChatData, senderID int) {
	groupMembers, err := dbConn.GetGroupMembers(groupID)
	if err != nil {
		fmt.Println("failed to fetch group members:", err)
		return
	}

	chatJSON, _ := json.Marshal(chat)
	response := Response{
		Type: "chat",
		Data: chatJSON,
	}

	for _, member := range groupMembers {
		memberConn := GetClientConn(member.UserID)
		if memberConn != nil && member.UserID != senderID {
			memberConn.Lock.Lock()
			memberConn.Conn.WriteJSON(response)
			memberConn.Lock.Unlock()
		}
	}
}
