package auth

import (
	"fmt"
	"net/http"
	"social/backend/pkg/db/dbConn"
)

func Authenticator(w http.ResponseWriter, r *http.Request) (dbConn.User, bool) {
	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		// LoggedInUserID = 0
		// LoggedInNickname = ""
		return dbConn.User{}, false
	}
	user, err := dbConn.GetUserByID(session.UserID)
	if err != nil {
		fmt.Println(err)
	}
	// LoggedInUserID = session.UserID
	// LoggedInNickname = user.Nickname
	return user, true
}
