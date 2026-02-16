package auth

import (
	"encoding/json"
	"net/http"
	"social/backend/pkg/db/dbConn"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

type Login struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var data Login

	if err := JsonDecode(w, r, &data); err != nil {
		ErrorPage(w, 400)
		return
	}
	SigninHandler(w, r, data)

}

func SigninHandler(w http.ResponseWriter, r *http.Request, data Login) {
	if r.Method == http.MethodGet {
		UnauthorizedAccessHandler(w, r)
		return
	}

	if r.Method == http.MethodPost {

		username := data.Username
		password := data.Password

		username = strings.TrimSpace(username)

		if username == "" || password == "" {
			feedBack := "username or password cannot be empty"
			w.WriteHeader(http.StatusBadRequest)
			RenderSigninFeedback(w, feedBack)
			return
		}

		user, err := dbConn.VerifyUserPassword(username, password)
		if err != nil {

			feedBack := "wrong username or password"

			// ErrorPage(w, http.StatusUnauthorized)
			w.WriteHeader(http.StatusUnauthorized)
			RenderSigninFeedback(w, feedBack)
			return
		}

		SessionHandler(w, r, user)

	} else {
		ErrorPage(w, http.StatusMethodNotAllowed)
	}
}

func UnauthorizedAccessHandler(w http.ResponseWriter, r *http.Request) {
	errorMessage := r.URL.Query().Get("error")
	var errorText string

	switch errorMessage {
	case "postLike":
		errorText = "You need to sign in to like a post. Please log in and try again."

	case "postDislike":
		errorText = "You need to sign in to dislike a post. Please log in and try again."

	case "commentLike":
		errorText = "You need to sign in to like a comment. Please log in and try again."

	case "commentDislike":
		errorText = "You need to sign in to dislike a comment. Please log in and try again."

	case "createPost":
		errorText = "You need to sign in to create a post. Please log in and try again."

	case "createComment":
		errorText = "You need to sign in to add a comment. Please log in and try again."

	default:
		errorText = ""
	}

	RenderSigninFeedback(w, errorText)
}

func RenderSigninFeedback(w http.ResponseWriter, feedback string) {
	signUpFeedback := struct {
		Feedback string
	}{
		Feedback: feedback,
	}
	JsonEncode(w, signUpFeedback)
}

func ErrorPage(w http.ResponseWriter, status int) {
	http.Error(w, http.StatusText(status), status)
}

func JsonDecode(w http.ResponseWriter, r *http.Request, data interface{}) error {
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {

		return err
	}

	return nil
}

func JsonEncode(w http.ResponseWriter, data interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		return err
	}
	return nil
}
