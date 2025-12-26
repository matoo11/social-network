package middleware

import (
	"net/http"
	"social/backend/pkg/router"
)

func Middleware(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	// Add WebSocket headers for upgrade requests
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Extensions")
	w.Header().Set("Access-Control-Allow-Credentials", "true")

	// Handle preflight OPTIONS request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	router.Router(w, r)
}
