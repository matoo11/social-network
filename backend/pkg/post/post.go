package post

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	"social/backend/pkg/util"
	"strconv"
	"strings"
)

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
	LoggedInUserID := session.UserID

	err = r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	// Decode the JSON string from "data" field
	jsonData := r.FormValue("data")
	var payload struct {
		Message    string `json:"message"`
		Title      string `json:"title"`
		PostTypeID int    `json:"typeId"`
	}
	if err := json.Unmarshal([]byte(jsonData), &payload); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	message := payload.Message
	title := payload.Title
	typeID := payload.PostTypeID

	if len(strings.TrimSpace(message)) == 0 {
		http.Error(w, "Message is required", http.StatusBadRequest)
		return
	}
	if len(message) >= 600 {
		http.Error(w, "The post length exceeded 600 characters", http.StatusBadRequest)
		return
	}
	if len(title) >= 60 {
		http.Error(w, "The post title length exceeded 60 characters", http.StatusBadRequest)
		return
	}

	// Handle optional image
	var imageID *int = nil
	file, handler, err := r.FormFile("image")
	if err == nil {
		defer file.Close()
		imgID, err := dbConn.SaveImage(file, handler.Filename, LoggedInUserID)
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Image upload failed", http.StatusInternalServerError)
			return
		}
		imageID = &imgID
	} else if err != http.ErrMissingFile {
		http.Error(w, "Failed to read image", http.StatusBadRequest)
		return
	}

	post := dbConn.Post{
		PostText:        message,
		UserID:          LoggedInUserID,
		PostTitle:       title,
		PostTypeID:      typeID,
		ImageID:         imageID,
		CreatedByID:     LoggedInUserID,
		LastUpdatedByID: LoggedInUserID,
	}

	if err := dbConn.CreatePost(post); err != nil {
		http.Error(w, "Could not create post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "Post created successfully")
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

	check, err := dbConn.IsPostOwner(data.PostID, LoggedInUserID)

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

func GetImageHandler(w http.ResponseWriter, r *http.Request) {
	ids := r.URL.Query().Get("id")
	if ids == "" {
		http.Error(w, "Missing image id", http.StatusBadRequest)
		return
	}
	id, err := strconv.Atoi(ids)
	if err != nil {
		fmt.Println("error 1")
		return
	}

	var data []byte
	var mimeType string
	data, mimeType, err = dbConn.GetPostImage(id)
	if err != nil {
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", mimeType)
	w.Write(data)

}

type PostIDRequest struct {
	ID int `json:"id"`
}

func GetPostByIDHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST or PUT for body (GET typically has no body)
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PostIDRequest

	// Decode JSON body
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check ID
	if req.ID == 0 {
		http.Error(w, "Missing post id", http.StatusBadRequest)
		return
	}

	// Fetch post
	postData, err := dbConn.GetPostByID(req.ID)
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	// Return JSON
	if err := auth.JsonEncode(w, postData); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func FetchAllPostsHandler(w http.ResponseWriter, r *http.Request) {
	data, err := dbConn.RetrieveAllDataForDisplay()
	if err != nil {
		util.Respond(w, r, http.StatusInternalServerError, nil, err.Error())
		return
	}
	util.Respond(w, r, http.StatusOK, data, "Fetch all posts successful")
}

func FetchPostByIDHandler(w http.ResponseWriter, r *http.Request) {

	var req PostIDRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.Respond(w, r, http.StatusBadRequest, nil, "Invalid JSON")
		return
	}
	fmt.Println("FetchPostByIDHandler called with ID:", req.ID)
	data, err := dbConn.RetrieveAllDataForDisplayByPostID(req.ID)
	if err != nil {
		util.Respond(w, r, http.StatusInternalServerError, nil, err.Error())
		return
	}
	fmt.Println("Fetched Post Data:", data)
	util.Respond(w, r, http.StatusOK, data, "Fetch post successful")
}
