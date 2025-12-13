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

type PostPayload struct {
	Message      *string `json:"message"`
	Title        *string `json:"title"`
	PostTypeID   *int    `json:"typeId"`
	PrivateUsers []int   `json:"privateUsers"`
}

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
	var payload PostPayload

	if err := json.Unmarshal([]byte(jsonData), &payload); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	// validate required fields
	validationErrors := ValidatePostPayload(&payload)
	if len(validationErrors) > 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"error":  "Validation failed",
			"fields": validationErrors,
		})
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

	post := dbConn.PostData{
		PostText:        *payload.Message,
		UserID:          LoggedInUserID,
		PostTitle:       *payload.Title,
		PostTypeID:      *payload.PostTypeID,
		ImageID:         imageID,
		CreatedByID:     LoggedInUserID,
		LastUpdatedByID: LoggedInUserID,
		PrivateUsersIDs: payload.PrivateUsers,
	}

	fmt.Println("Post Data:", post)

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

func FetchPostsByUserIDHandler(w http.ResponseWriter, r *http.Request) {
	user, authenticated := auth.Authenticator(w, r)
	if !authenticated {
		// If not authenticated, return public posts
		publicPosts, err := dbConn.RetrievePublicPostsForDisplay()
		if err != nil {
			fmt.Println(err)
			return
		}
		util.Respond(w, r, http.StatusOK, publicPosts, "Fetch public posts successful")
		return
	}

	// If authenticated, return visible posts by user ID
	postsData, err := dbConn.RetrievePostsByUserIDForDisplay(user.User_ID)
	if err != nil {
		util.Respond(w, r, http.StatusInternalServerError, nil, err.Error())
		return
	}
	util.Respond(w, r, http.StatusOK, postsData, "Fetch posts by user ID successful")
}

// helper functions
func ValidatePostPayload(p *PostPayload) map[string]string {
	errors := make(map[string]string)

	// Validate title
	if p.Title == nil || len(strings.TrimSpace(*p.Title)) == 0 {
		errors["title"] = "Title is required"
	} else if len(*p.Title) > 60 {
		errors["title"] = "The post title length exceeded 60 characters"
	}

	// Validate message
	if p.Message == nil || len(strings.TrimSpace(*p.Message)) == 0 {
		errors["message"] = "Message is required"
	} else if len(*p.Message) > 600 {
		errors["message"] = "The post length exceeded 600 characters"
	}

	// Validate type ID
	if p.PostTypeID == nil {
		errors["typeId"] = "TypeID is required"
	}

	// Conditional validation: PrivateUsers required if PostTypeID == 3
	if p.PostTypeID != nil && *p.PostTypeID == 3 {
		if len(p.PrivateUsers) == 0 {
			errors["privateUsers"] = "PrivateUsers cannot be empty when PostTypeID is 3"
		}
	}

	return errors
}
