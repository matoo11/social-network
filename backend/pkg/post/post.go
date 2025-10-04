package post

import (
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	"strings"
)

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		LoggedInUserID = 0
		http.Redirect(w, r, "/", http.StatusFound)
		return
	} else {

		LoggedInUserID = session.UserID
	}

	fmt.Println("here1")
	data := struct {
		Message    string `json:"message"`
		Title      string `json:"title"`
		PostTypeID int    `json:"typeId"`
	}{}
	if err := auth.JsonDecode(w, r, &data); err != nil {
		auth.ErrorPage(w, 400)
		return
	}

	message := data.Message
	title := data.Title
	typeID := data.PostTypeID
	fmt.Println(message)

	if len(message) >= 600 {
		http.Error(w, "The post length exceeded 600 characters", http.StatusBadRequest)
		return
	}
	if len(title) >= 60 {
		http.Error(w, "The post title length exceeded 60 characters", http.StatusBadRequest)
		return
	}
	val := len(strings.TrimSpace(message)) == 0
	if val {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	if message == "" {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	post := dbConn.Post{
		PostText:   message,
		UserID:     LoggedInUserID,
		PostTitle:  title,
		PostTypeID: typeID,
	}
	dbConn.CreatePost(post)
}

func GetPublicPosts(w http.ResponseWriter, r *http.Request) {

	_, err := dbConn.GetSessionFromCookie(r)

	if err != nil {
		auth.ErrorPage(w, 401)
		return
	}
	posts, err := dbConn.GetPublicPosts()
	if err != nil {
		fmt.Println(err)
		return
	}

	err = auth.JsonEncode(w, posts)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func GetPrivatePosts(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)

	if err != nil {
		auth.ErrorPage(w, 401)
		return
	} else {
		LoggedInUserID = session.UserID
	}

	posts, err := dbConn.GetPrivateFollowedPosts(LoggedInUserID)
	if err != nil {
		auth.ErrorPage(w, 500)
	}

	pposts, err := dbConn.GetPrivateCustomPosts(LoggedInUserID)

	if err != nil {
		auth.ErrorPage(w, 500)
	}

	posts = append(posts, pposts...)

	err = auth.JsonEncode(w, posts)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func GrantAccessToPost(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)

	if err != nil {
		auth.ErrorPage(w, 401)
		return
	} else {
		LoggedInUserID = session.UserID
	}

	data := struct {
		Users  []int `json:"users"`
		PostID int   `json:"postID"`
	}{}
	if err := auth.JsonDecode(w, r, &data); err != nil {
		auth.ErrorPage(w, 400)
		return
	}

	check, err := dbConn.IsPostOwner(data.PostID,LoggedInUserID)

	if err != nil {
		auth.ErrorPage(w, 500)
		return
	}

	if !check {
		auth.ErrorPage(w, 400)
		fmt.Println("this is not the owner of the post")
	}
	err = dbConn.GrantPostAccessToUsers(data.PostID, data.Users, LoggedInUserID)

	if err != nil {
		auth.ErrorPage(w, 500)
		return
	}
	fmt.Println("access granted successfully")
}
