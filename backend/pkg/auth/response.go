package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social/backend/pkg/logs"
)

type APIResponse struct {
	Success       bool   `json:"success"`
	Code          int    `json:"code"`
	Message       string `json:"message"`
	Data          any    `json:"data"`
	Authenticated bool   `json:"authenticated"`
}

func Respond(w http.ResponseWriter, r *http.Request, code int, data any, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	success := code >= 200 && code < 300

	response := APIResponse{
		Success: success,
		Code:    code,
		Message: message,
		Data:    data,
	}

	// Marshal data to JSON for logging
	dataBytes, err := json.Marshal(data)
	if err != nil {
		logs.LogError(fmt.Sprintf("Failed to marshal response data: %v", err))
		dataBytes = []byte(`"failed to marshal data"`)
	}

	// Logging the Response
	logs.LogResponse(r.Method, r.URL.Path, code, message, dataBytes)

	json.NewEncoder(w).Encode(response)
}

func RespondHTML(w http.ResponseWriter, r *http.Request, code int, title string, message string) {
	displayedTitle := fmt.Sprintf("%s %v", title, code)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(code)

	html := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>%s</title>
	<style>
		body {
			background-color: #1e1e1e;
			color: #ccc;
			font-family: sans-serif;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100vh;
			margin: 0;
		}
		.container {
			text-align: center;
			background: #2a2a2a;
			border: 2px solid #e55353;
			padding: 2rem;
			border-radius: 10px;
			box-shadow: 0 0 1rem rgba(229, 83, 83, 0.2);
			max-width: 600px;
		}
		h1 {
			color: #e55353;
			margin-bottom: 1rem;
		}
		p {
			font-size: 1.2rem;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>%s</h1>
		<p>%s</p>
	</div>
</body>
</html>
`, title, displayedTitle, message)

	_, err := w.Write([]byte(html))
	if err != nil {
		logs.LogError(fmt.Sprintf("Failed to write HTML response: %v", err))
	}

	// Optional: log this HTML response
	logs.LogResponse(r.Method, r.URL.Path, code, message, []byte("(HTML response)"))
}
