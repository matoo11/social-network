package auth

import (
	"fmt"
	"net/http"
	"social/backend/pkg/db/dbConn"
	"social/backend/pkg/util"
)

func Authenticator(w http.ResponseWriter, r *http.Request) (dbConn.User, bool) {
	session, err := dbConn.GetSessionFromCookie(r)
	fmt.Println("Authenticator called, session:", session, "error:", err)
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

func GetUserDataHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("user data handler called")
	user, authenticated := Authenticator(w, r)
	if !authenticated {
		// ErrorPage(w, 401)
		util.Respond(w, r, http.StatusOK, nil, "user is guest")
		return
	}

	err := JsonEncode(w, user)
	if err != nil {
		fmt.Println(err)
		return
	}
}
