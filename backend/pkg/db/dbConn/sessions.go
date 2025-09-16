package dbConn

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"social/backend/pkg/db/dbHandler"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	SessionID       string
	ExpiryTime      time.Time
	UserID          int
	CreatedByID     int
	CreationTime    time.Time
	LastUpdatedByID int
	LastUpdatedTime time.Time
	IsActive        bool
}

func GenerateSessionID() string {
	return uuid.New().String()
}

func CreateSession(userID int) (string, error) {
	statement := `INSERT INTO Sessions 
	(
		Session_ID, 
		Expiry_Time, 
		User_ID,  
		Created_By_ID,
		Creation_Time, 
		Last_Updated_By_ID, 
		Last_Updated_Time
	)
	VALUES (?,?,?,?,?,?,?)`
	currentTime := time.Now()
	expiryTime := currentTime.Add(1 * time.Hour)

	formattedCurrentTime := currentTime.Format("2006-01-02 15:04:05")
	formattedExpiryTime := expiryTime.Format("2006-01-02 15:04:05")
	sessionID := GenerateSessionID()

	_, err := dbHandler.DB.Exec(statement, sessionID, formattedExpiryTime, userID, userID, formattedCurrentTime, userID, formattedCurrentTime)
	if err != nil {
		log.Fatal(err)
	}
	return sessionID, nil
}

func GetSessionFromDB(sessionID string) (*Session, error) {
	var session Session
	statement := `SELECT Session_ID, Expiry_Time, User_ID, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active
                  FROM Sessions WHERE Session_ID = ? AND Is_Active = 1`
	row := dbHandler.DB.QueryRow(statement, sessionID)
	err := row.Scan(&session.SessionID, &session.ExpiryTime, &session.UserID, &session.CreatedByID, &session.CreationTime, &session.LastUpdatedByID, &session.LastUpdatedTime, &session.IsActive)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("session not found")
		}
		return nil, fmt.Errorf("error retrieving session: %v", err)
	}
	return &session, nil
}

func GetSessionFromCookie(r *http.Request) (*Session, error) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		if err == http.ErrNoCookie {
			return nil, fmt.Errorf("cookie session id not found")
		}
		return nil, fmt.Errorf("error reading cookie: %v", err)
	}

	session, err := GetSessionFromDB(cookie.Value)
	if err != nil {
		return nil, fmt.Errorf("db session id not found: %v", err)
	}

	if time.Now().After(session.ExpiryTime) {
		DeleteSession(session.SessionID)
		return nil, fmt.Errorf("db session id expired")
	}

	return session, nil
}

func DeleteSession(sessionID string) error {
	statement := `DELETE FROM Sessions WHERE Session_ID = ?`

	_, err := dbHandler.DB.Exec(statement, sessionID)
	if err != nil {
		log.Println("Error deleting session:", err)
		return fmt.Errorf("failed to delete session")
	}

	return nil
}

func GetActiveSessionForUser(userID int) (*Session, error) {
	var session Session
	statement := `SELECT Session_ID, Expiry_Time, User_ID, Created_By_ID, Creation_Time, 
		Last_Updated_By_ID, Last_Updated_Time, Is_Active 
		FROM Sessions 
		WHERE User_ID = ? AND Is_Active = 1 AND Expiry_Time > ?`
	err := dbHandler.DB.QueryRow(statement, userID, time.Now()).Scan(
		&session.SessionID, &session.ExpiryTime, &session.UserID,
		&session.CreatedByID, &session.CreationTime, &session.LastUpdatedByID,
		&session.LastUpdatedTime, &session.IsActive,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &session, nil
}

func DeleteInactiveSessionsForUser(userID int) error {
	statement := `DELETE FROM Sessions WHERE User_ID = ? AND (Is_Active = 0 OR Expiry_Time < ?)`
	_, err := dbHandler.DB.Exec(statement, userID, time.Now())
	return err
}
