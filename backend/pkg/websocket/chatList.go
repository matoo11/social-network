package websocket


func SendChatListRefresh(userID int) {
	conn := GetClientConn(userID)
	if conn == nil {
		return
	}

	response := struct {
		Type string `json:"type"`
		Data string `json:"data"`
	}{
		Type: "chatlist_refresh",
		Data: "refresh",
	}

	conn.Lock.Lock()
	conn.Conn.WriteJSON(response)
	conn.Lock.Unlock()
}