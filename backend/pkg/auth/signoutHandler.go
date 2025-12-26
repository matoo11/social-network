package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social/backend/pkg/db/dbConn"

	"time"
)

func SignoutHandler(w http.ResponseWriter, r *http.Request) {
	user, _ := Authenticator(w, r)
	fmt.Println("Signing out user:", user.Nick_Name)

	cookie, err := r.Cookie("session_id")
	if err == nil {
		err := dbConn.DeleteSession(cookie.Value)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unable to delete session"})
			return
		}
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Signout successful"})
}
