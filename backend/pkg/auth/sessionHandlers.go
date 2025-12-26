package auth

import (
	"fmt"
	"net/http"
	"social/backend/pkg/db/dbConn"
	"time"
)

func SessionHandler(w http.ResponseWriter, r *http.Request, userID int) {
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
	// http.Redirect(w, r, "/", http.StatusFound)
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
