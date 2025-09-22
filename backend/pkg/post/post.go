package post

// import (
// 	"fmt"
// 	"net/http"
// 	"social/backend/pkg/db/dbConn"
// 	"social/backend/pkg/auth"
// 	"strings"
// )

// func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
// 	var LoggedInUserID int

// 	session, err := dbConn.GetSessionFromCookie(r)
// 	if err != nil {
// 		LoggedInUserID = 0
// 		http.Redirect(w, r, "/", http.StatusFound)
// 		return
// 	} else {

// 		LoggedInUserID = session.UserID
// 	}

// 	fmt.Println("here1")
// 	data := struct {
// 		Message    string   `json:"message"`
// 		Catigories []string `json:"catigories"`
// 	}{}
// 	if err := auth.jsonDecode(w, r, &data); err != nil {
// 		ErrorPage(w, 400)
// 		return
// 	}

// 	message := data.Message
// 	categories := data.Catigories
// 	fmt.Println(message)
// 	fmt.Println(categories)
// 	validCategories := map[string]bool{
// 		"":        true,
// 		"General": true,
// 		"Sport":   true,
// 		"Gaming":  true,
// 	}
// 	if len(message) >= 600 {
// 		http.Error(w, "The post length exceeded 600 characters", http.StatusBadRequest)
// 		return
// 	}
// 	val := len(strings.TrimSpace(message)) == 0
// 	if val {
// 		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
// 		return
// 	}
// 	if message == "" {
// 		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
// 		return
// 	}
// 	fmt.Println(len(categories))
// 	if len(categories) == 1 {
// 		if categories[0] == "" {

// 			fmt.Println("'cats'")
// 			categories[0] = "General"
// 		}
// 	}
// 	for _, category := range categories {
// 		if !validCategories[category] {
// 			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
// 			return
// 		}
// 	}

// 	post := dbConn.Post{
// 		PostText: message,
// 		UserID:   LoggedInUserID,
// 	}
// 	dbConn.CreatePost(post, categories)
// }
