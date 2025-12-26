package follow

import (
	"database/sql"
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
)

func AddFollow(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)

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

func FollowStatus(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int
	session, err := dbConn.GetSessionFromCookie(r)

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
	status := 0
	isFollowing, err := dbConn.IsFollowing(LoggedInUserID, data.FollowedID)
	if err != nil {
		auth.ErrorPage(w, 500)
		return
	}

	if !isFollowing {
		checkRequest, err := dbConn.RequestStatus(LoggedInUserID, data.FollowedID)
		if err != nil {
			if err != sql.ErrNoRows {
				auth.ErrorPage(w, 500)
				fmt.Println("here")
				return
			}
			status = 3
		} else {
			status = checkRequest
		}
	} else {
		status = 2
	}

	if err := auth.JsonEncode(w, status); err != nil {
		fmt.Println("encode")
		auth.ErrorPage(w, 500)
		return
	}

}

func UnFollow(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int
	session, err := dbConn.GetSessionFromCookie(r)

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

	err = dbConn.DeleteFollow(LoggedInUserID, data.FollowedID)

	if err != nil {
		auth.ErrorPage(w, 400)
	}
}

func GetFollowers(w http.ResponseWriter, r *http.Request) {

	fmt.Println("GetFollowers called")
	session, err := dbConn.GetSessionFromCookie(r)

	if err != nil {
		auth.ErrorPage(w, 401)
		return
	} else {
		// LoggedInUserID = session.UserID
	}
	fmt.Println("Session validated")

	fmt.Println(session.UserID)
	data := struct {
		FollowedID int `json:"userID"`
	}{}

	data.FollowedID = session.UserID

	fmt.Println("Fetching followers for user ID:", data.FollowedID)
	followers, err := dbConn.GetFollowersByUserID(data.FollowedID)

	if err != nil {
		fmt.Println(err)
		auth.ErrorPage(w, 400)
	}
	for i, follower := range followers {
		user, err := dbConn.GetUserByID(follower.FollowerID)
		if err != nil {
			fmt.Println(err)
			// auth.ErrorPage(w, 500)
			return
		}
		follower.FollowerUsername = user.User_Name
		followers[i] = follower
	}
	if err := auth.JsonEncode(w, followers); err != nil {
		auth.ErrorPage(w, 500)
		return
	}

}
