package backend

import (
	"fmt"
	"log"
	"net/http"
	"social/backend/pkg/middleware"
)

func StartServer() {
	http.HandleFunc("/", middleware.Middleware)
	// http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("web/static/css"))))
	// http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("web/static"))))
	fmt.Println("Starting server on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
