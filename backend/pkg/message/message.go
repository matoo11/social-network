package message

import (
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
)

func GetPrivateMessages(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)

	if err != nil {
		auth.ErrorPage(w, 401)
		return
	} else {
		LoggedInUserID = session.UserID
	}

	data := struct {
		ChatID int `json:"userID"`
	}{}

	if err := auth.JsonDecode(w, r, &data); err != nil {
		auth.ErrorPage(w, http.StatusBadRequest)
		return
	}

	messages, err := dbConn.GetChatMessagesBetweenUsers(LoggedInUserID, data.ChatID)
	if err != nil {
		fmt.Println(err)
		return
	}

	var displayMessages []dbConn.MessageDisplay
	for _, f := range messages {
		message := dbConn.MessageDisplay{
			MessageID:  f.MessageID,
			SenderID:   f.SenderID,
			RecieverID: f.ReceiverID,
			Content:    f.MessageText,
		}
		displayMessages = append(displayMessages, message)
	}

	if err := auth.JsonEncode(w, displayMessages); err != nil {
		http.Error(w, "hrar error", 500)
	}
}
