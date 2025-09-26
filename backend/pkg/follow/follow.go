package follow

import (
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
)

func AddFollow(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int
	// fmt.Println("ok")
	session, err := dbConn.GetSessionFromCookie(r)
	// fmt.Println("ok")
	if err != nil {
		auth.ErrorPage(w, 401)
		return
	} else {
		LoggedInUserID = session.UserID
	}

	data := struct {
		FollowedID int `json:"userID"`
	}{}

	if err := auth.JsonDecode(w, r, &data); err != nil {
		auth.ErrorPage(w, http.StatusBadRequest)
		return
	}
	follow := dbConn.Follow{
		FollowerID: LoggedInUserID,
		FollowedID: data.FollowedID,
	}

	err = dbConn.CreateFollow(follow)
	if err != nil {
		fmt.Println(err)
		if err.Error() == "you already following this user" {
			http.Error(w, err.Error(), 400)
		}
		return
	}
}
