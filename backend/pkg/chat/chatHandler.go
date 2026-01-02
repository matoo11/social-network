package chat

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	"social/backend/pkg/logs"
	"social/backend/pkg/util"
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
		isSender := (LoggedInUserID == f.SenderID)
		message := dbConn.MessageDisplay{
			MessageID:    f.MessageID,
			SenderID:     f.SenderID,
			RecieverID:   f.ReceiverID,
			Content:      f.MessageText,
			CreationTime: f.CreationTime,
			IsSender:     isSender,
		}
		displayMessages = append(displayMessages, message)
	}

	if err := auth.JsonEncode(w, displayMessages); err != nil {
		fmt.Println(err)
		http.Error(w, "hrar error", 500)
	}
}

func GetChatList(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)

	if err != nil {
		auth.ErrorPage(w, 401)
		return
	} else {
		LoggedInUserID = session.UserID
	}

	hrar, err := dbConn.GetChatUsers(LoggedInUserID)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("here")
	fmt.Println(err)
	fmt.Println(hrar)

	if err := auth.JsonEncode(w, hrar); err != nil {
		fmt.Println(err)
		http.Error(w, "hrar error", 500)
	}

}

// =============================================================================
// HTTP Handlers
// =============================================================================

// FIXME: logic not implemented
// MoreMessagesHandler handles pagination requests for loading older messages.
func MoreMessagesHandler(w http.ResponseWriter, r *http.Request) {
	_, authenticated := auth.Authenticator(w, r)
	if !authenticated {
		util.Respond(w, r, http.StatusUnauthorized, nil, "user not signed in")
		return
	}

	var timestamp string
	if err := json.NewDecoder(r.Body).Decode(&timestamp); err != nil {
		util.Respond(w, r, http.StatusBadRequest, nil, "invalid request body")
		return
	}

	logs.LogInfo("Loading more messages before: %s", timestamp)

	util.Respond(w, r, http.StatusOK, nil, "loading more messages successful")
}
