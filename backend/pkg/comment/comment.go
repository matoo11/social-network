package comment

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	"strings"
)

func CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		auth.ErrorPage(w, 401)
		return
	} else {
		LoggedInUserID = session.UserID
	}

	err = r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	// Decode the JSON string from "data" field
	jsonData := r.FormValue("data")
	var payload struct {
		CommentText string `json:"commentText"`
		PostID      int    `json:"postID"`
	}
	if err := json.Unmarshal([]byte(jsonData), &payload); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	commentText := payload.CommentText
	postID := payload.PostID
	if len(commentText) >= 300 {
		http.Error(w, "The comment length exceeded 300 characters", http.StatusBadRequest)
		return
	}
	val := len(strings.TrimSpace(commentText)) == 0
	if val {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	if commentText == "" {
		auth.ErrorPage(w, http.StatusBadRequest)
		return
	}
	fmt.Println(commentText)

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

	newComment := dbConn.Comment{
		CommentText:     commentText,
		PostID:          postID,
		CreatedByID:     LoggedInUserID,
		LastUpdatedByID: LoggedInUserID,
		CommentImageID: imageID,
	}

	err = dbConn.CreateComment(newComment)
	if err != nil {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}
}
