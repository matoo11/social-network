package router

import (
	"html/template"
	"net/http"
	"social/backend/pkg/auth"
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
