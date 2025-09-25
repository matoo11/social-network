package router

import (
	"html/template"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/comment"
	"social/backend/pkg/post"
)

func Router(w http.ResponseWriter, r *http.Request) {
	// Define your main handler logic here
	switch r.URL.Path {
	case "/":
		RenderTemplate(w, "frontend/index.html", nil)
	case "/api/signin":
		auth.LoginHandler(w, r)
	case "/api/signout":
		auth.SignoutHandler(w, r)
	case "/api/createPost":
		post.CreatePostHandler(w, r)
	case "/api/getPublicPosts":
		post.GetPublicPosts(w, r)
	case "/api/getPrivatePosts":

	case "/api/createComment":
		comment.CreateCommentHandler(w, r)
	case "/api/signup":
		auth.SignupHandler(w, r)
	default:
		http.NotFound(w, r)
	}
}

func RenderTemplate(w http.ResponseWriter, path string, data interface{}) {
	tmpl, err := template.ParseFiles(path)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	if err := tmpl.Execute(w, data); err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}
