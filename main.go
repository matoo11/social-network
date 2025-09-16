package main

import (
	"log"
	"social/backend"
	"social/backend/pkg/db/dbHandler"
	"social/backend/pkg/logs"
)

func init() {
	// Initializing Logger
	err := logs.InitializeLogger("backend/pkg/logs/social.log")
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}

	// Opening DB
	err = dbHandler.OpenDB()
	if err != nil {
		log.Fatalf("failed to open DB: %v\n", err)
	}
	logs.LogInfo("Database connection established successfully.")
}

func main() {
	defer logs.CloseLogger()
	defer dbHandler.DB.Close()
	backend.StartServer()
}
