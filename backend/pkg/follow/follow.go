package follow

import (
	"database/sql"
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	wsManager "social/backend/pkg/websocket"
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

	targetProfile, err := dbConn.GetUserProfileDetails(data.FollowedID)
	if err != nil {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	privateTypeID, err := dbConn.GetProfileTypeIDByName("Private")
	if err != nil {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	if targetProfile.ProfileTypeID == privateTypeID {
		err = dbConn.CreateFollowRequest(LoggedInUserID, data.FollowedID)
		if err != nil {
			fmt.Println(err)
			if err.Error() == "follow request already sent" {
				http.Error(w, err.Error(), 400)
			} else {
				auth.ErrorPage(w, http.StatusInternalServerError)
			}
			return
		}

		// Create notification for follow request
		requester, err := dbConn.GetUserByID(LoggedInUserID)
		if err == nil {
			notification := dbConn.Notification{
				NotificationText:   requester.User_Name + " wants to follow you",
				SourceID:           LoggedInUserID,
				TargetID:           data.FollowedID,
				NotificationTypeID: 3,
				CreatedByID:        LoggedInUserID,
			}

			notificationID, err := dbConn.CreateNotification(notification)
			if err == nil {
				wsManager.SendNotification(int(notificationID), data.FollowedID, 3)
			}
		}

		w.WriteHeader(http.StatusOK)
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
		follower.FollowerAvatarNumber = user.Image_ID
		followers[i] = follower
	}
	if err := auth.JsonEncode(w, followers); err != nil {
		auth.ErrorPage(w, 500)
		return
	}

}
func AcceptFollowRequest(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		auth.ErrorPage(w, 401)
		return
	}
	LoggedInUserID = session.UserID

	data := struct {
		RequesterID int `json:"requesterId"`
	}{}

	if err := auth.JsonDecode(w, r, &data); err != nil {
		auth.ErrorPage(w, http.StatusBadRequest)
		return
	}

	err = dbConn.AcceptFollowRequest(data.RequesterID, LoggedInUserID)
	if err != nil {
		fmt.Println("Error accepting follow request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func RejectFollowRequest(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		auth.ErrorPage(w, 401)
		return
	}
	LoggedInUserID = session.UserID

	data := struct {
		RequesterID int `json:"requesterId"`
	}{}

	if err := auth.JsonDecode(w, r, &data); err != nil {
		auth.ErrorPage(w, http.StatusBadRequest)
		return
	}

	err = dbConn.RejectFollowRequest(data.RequesterID, LoggedInUserID)
	if err != nil {
		fmt.Println("Error rejecting follow request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
func CancelFollowRequest(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		auth.ErrorPage(w, 401)
		return
	}
	LoggedInUserID = session.UserID

	data := struct {
		ReceiverID int `json:"userID"`
	}{}

	if err := auth.JsonDecode(w, r, &data); err != nil {
		auth.ErrorPage(w, http.StatusBadRequest)
		return
	}

	err = dbConn.CancelFollowRequest(LoggedInUserID, data.ReceiverID)
	if err != nil {
		fmt.Println("Error canceling follow request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
