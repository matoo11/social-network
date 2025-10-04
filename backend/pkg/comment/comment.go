package comment

import (
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	"strings"
)

func CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
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
		CommentText string `json:"commentText"`
		PostID      int    `json:"postID"`
	}{}

	if err := auth.JsonDecode(w, r, &data); err != nil {
		auth.ErrorPage(w, http.StatusBadRequest)
		return
	}

	commentText := data.CommentText
	postID := data.PostID
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

	newComment := dbConn.Comment{
		CommentText:     commentText,
		PostID:          postID,
		CreatedByID:     LoggedInUserID,
		LastUpdatedByID: LoggedInUserID,
	}

	err = dbConn.CreateComment(newComment)
	if err != nil {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}
}
