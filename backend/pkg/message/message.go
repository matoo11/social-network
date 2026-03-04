package message

import (
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	"time"
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

	fmt.Println(err)

	if err := auth.JsonEncode(w, hrar); err != nil {
		fmt.Println(err)
		http.Error(w, "hrar error", 500)
	}

}

func GetGroupMessages(w http.ResponseWriter, r *http.Request) {
	var loggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		auth.ErrorPage(w, http.StatusUnauthorized)
		return
	}
	loggedInUserID = session.UserID

	data := struct {
		GroupID int `json:"groupID"`
		ChatID  int `json:"chatID"`
		UserID  int `json:"userID"`
	}{}

	if err := auth.JsonDecode(w, r, &data); err != nil {
		auth.ErrorPage(w, http.StatusBadRequest)
		return
	}

	groupID := data.GroupID
	if groupID == 0 {
		if data.ChatID != 0 {
			groupID = data.ChatID
		} else {
			groupID = data.UserID
		}
	}
	if groupID == 0 {
		auth.ErrorPage(w, http.StatusBadRequest)
		return
	}

	isMember, err := dbConn.IsGroupMember(groupID, loggedInUserID)
	if err != nil {
		fmt.Println(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	if !isMember {
		auth.ErrorPage(w, http.StatusForbidden)
		return
	}

	messages, err := dbConn.GetGroupMessagesByID(groupID)
	if err != nil {
		fmt.Println(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	type GroupMessageDisplay struct {
		MessageID      int
		SenderID       int
		SenderUsername string
		GroupID        int
		Content        string
		CreationTime   time.Time
		IsSender       bool
	}

	var displayMessages []GroupMessageDisplay
	for _, m := range messages {
		sender, err := dbConn.GetUserByID(m.SenderID)
		if err != nil {
			fmt.Println(err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		displayMessages = append(displayMessages, GroupMessageDisplay{
			MessageID:      m.MessageID,
			SenderID:       m.SenderID,
			SenderUsername: sender.User_Name,
			GroupID:        m.GroupID,
			Content:        m.MessageText,
			CreationTime:   m.CreationTime,
			IsSender:       loggedInUserID == m.SenderID,
		})
	}

	if err := auth.JsonEncode(w, displayMessages); err != nil {
		fmt.Println(err)
		http.Error(w, "hrar error", http.StatusInternalServerError)
	}
}
