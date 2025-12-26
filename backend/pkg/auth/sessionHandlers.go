package auth

import (
	"fmt"
	"net/http"
	"social/backend/pkg/db/dbConn"
	"time"
)

func SessionHandler(w http.ResponseWriter, r *http.Request, user *dbConn.User) {
	userID := user.User_ID

	fmt.Println(userID)
	err := dbConn.DeleteInactiveSessionsForUser(userID)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	session, err := dbConn.GetActiveSessionForUser(userID)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	if session != nil && session.IsActive && session.ExpiryTime.After(time.Now()) {
		_, err := r.Cookie("session_id")
		if err != nil {
			if err == http.ErrNoCookie {
				dbConn.DeleteSession(session.SessionID)
				sessionID, err := dbConn.CreateSession(userID)
				if err != nil {
					http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
					return
				}
				SetSessionCookie(w, sessionID)
			} else {
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
				return
			}
		} else {

			session, err := dbConn.GetActiveSessionForUser(userID)
			if err != nil {
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
				return
			}
			cookie, err := r.Cookie("session_id")
			if err != nil {
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
				return
			}
			if cookie.Value == session.SessionID {
				SetSessionCookie(w, session.SessionID)
			} else {
				dbConn.DeleteSession(session.SessionID)
				sessionID, err := dbConn.CreateSession(userID)
				if err != nil {
					http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
					return
				}
				SetSessionCookie(w, sessionID)
			}

		}
	} else {
		sessionID, err := dbConn.CreateSession(userID)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}
		SetSessionCookie(w, sessionID)
	}

data := struct {
    UserID   int    `json:"userID"`
    UserName string `json:"userName"`
    NickName string `json:"nickName"`
    Email    string `json:"email"`
    ImageID  int    `json:"imageID"`
}{
    UserID:   user.User_ID,
    UserName: user.User_Name,
    NickName: user.Nick_Name,
    Email:    user.Email,
    ImageID:  user.Image_ID,
}
	Respond(w, r, 200, data, "login Successful")
}

func SetSessionCookie(w http.ResponseWriter, sessionID string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Expires:  time.Now().Add(1 * time.Hour),
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})
}
