package dbConn

import (
	"fmt"
	"log"
	"social/backend/pkg/db/dbHandler"
	"time"
)

type Follow struct {
	FollowerID   int
	FollowedID   int
	UserID       int
	CreationTime time.Time
}

type FollowDisplay struct {
	FollowerID           int
	FollowerUsername     string
	FollowerAvatarURL    string
	FollowerAvatarNumber int
	FollowedID           int
}

func CreateFollow(follow Follow) error {

	check, _ := IsFollowing(follow.FollowerID, follow.FollowedID)
	if check {
		return fmt.Errorf("you already following this user")
	}

	statement := `INSERT INTO Followers
	(
    Follower_ID,
    Followed_ID,
    Created_By_ID,
    Creation_Time,
	Last_Updated_By_ID,
	Last_Updated_Time,
	Is_Active
	)
	VALUES
	(?, ?, ?, ?, ?, ?, ?)`

	formattedCurrentTime := time.Now().UTC().Format("2006-01-02 15:04:05")

	_, err := dbHandler.DB.Exec(
		statement,
		follow.FollowerID,
		follow.FollowedID,
		follow.UserID,
		formattedCurrentTime,
		follow.UserID,
		formattedCurrentTime,
		true,
	)
	if err != nil {
		fmt.Println(err)
		return err
	}

	return nil
}

func GetFollowersByUserID(userID int) ([]FollowDisplay, error) {
	statement := `SELECT Follower_ID, Followed_ID FROM Followers WHERE Followed_ID = ? ORDER BY Creation_Time DESC`

	rows, err := dbHandler.DB.Query(statement, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get followers: %v", err)
	}
	defer rows.Close()

	var follows []FollowDisplay
	for rows.Next() {
		var follow FollowDisplay

		err := rows.Scan(
			&follow.FollowerID,
			&follow.FollowedID,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan follower record: %v", err)
		}
		follows = append(follows, follow)
	}

	return follows, nil
}

func IsFollowing(followerID int, followedID int) (bool, error) {
	var exists bool
	err := dbHandler.DB.QueryRow(`
    SELECT EXISTS(
        SELECT 1 FROM Followers
        WHERE Follower_ID = ? AND Followed_ID = ? AND Is_Active = 1
    )`, followerID, followedID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check follow: %v", err)
	}
	return exists, nil

}

func RequestStatus(requesterID int, requestedID int) (int, error) {
	var status int
	err := dbHandler.DB.QueryRow(`
        SELECT Status_ID FROM Follow_Requests
        WHERE Requester_ID = ? AND Receiver_ID = ? AND Is_Active = 1`,
		requesterID, requestedID).Scan(&status)
	if err != nil {
		// fmt.Println(err)
		return 0, err
	}
	return status, nil
}

func DeleteFollow(followerID int, followedID int) error {

	statement := `DELETE FROM Followers WHERE Follower_ID = ? AND Followed_ID = ?`

	_, err := dbHandler.DB.Exec(statement, followerID, followedID)
	if err != nil {
		log.Println("Error deleting follower:", err)
		return fmt.Errorf("failed to delete follow")
	}

	return nil
}

func CreateFollowRequest(requesterID int, receiverID int) error {
	// Check if request already exists
	var exists bool
	err := dbHandler.DB.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM Follow_Requests
			WHERE Requester_ID = ? AND Receiver_ID = ? AND Is_Active = 1
		)`, requesterID, receiverID).Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check existing request: %v", err)
	}
	if exists {
		return fmt.Errorf("follow request already sent")
	}

	// Status_ID = 1 for pending request (you may need to adjust this based on your Statuses table)
	statement := `INSERT INTO Follow_Requests
	(
		Requester_ID,
		Receiver_ID,
		Status_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	)
	VALUES
	(?, ?, ?, ?, ?, ?, ?, ?)`

	formattedCurrentTime := time.Now().UTC().Format("2006-01-02 15:04:05")

	_, err = dbHandler.DB.Exec(
		statement,
		requesterID,
		receiverID,
		1, // Status_ID = 1 for pending
		requesterID,
		formattedCurrentTime,
		requesterID,
		formattedCurrentTime,
		true,
	)
	if err != nil {
		return fmt.Errorf("failed to create follow request: %v", err)
	}

	return nil
}
func AcceptFollowRequest(requesterID int, receiverID int) error {
	// First verify the request exists and is pending
	var statusID int
	err := dbHandler.DB.QueryRow(`
		SELECT Status_ID FROM Follow_Requests
		WHERE Requester_ID = ? AND Receiver_ID = ? AND Is_Active = 1`,
		requesterID, receiverID).Scan(&statusID)
	if err != nil {
		return fmt.Errorf("follow request not found")
	}
	if statusID != 1 {
		return fmt.Errorf("request is not pending")
	}

	// Create the follow relationship
	follow := Follow{
		FollowerID: requesterID,
		FollowedID: receiverID,
	}
	err = CreateFollow(follow)
	if err != nil {
		return fmt.Errorf("failed to create follow: %v", err)
	}

	// Update the request status to accepted (Status_ID = 2)
	formattedCurrentTime := time.Now().UTC().Format("2006-01-02 15:04:05")
	statement := `UPDATE Follow_Requests
		SET Status_ID = 2,
			Last_Updated_By_ID = ?,
			Last_Updated_Time = ?,
			Is_Active = 0
		WHERE Requester_ID = ? AND Receiver_ID = ? AND Is_Active = 1`

	_, err = dbHandler.DB.Exec(statement, receiverID, formattedCurrentTime, requesterID, receiverID)
	if err != nil {
		return fmt.Errorf("failed to update request status: %v", err)
	}

	return nil
}

func CancelFollowRequest(requesterID int, receiverID int) error {
	// Verify the request exists and is pending
	var statusID int
	err := dbHandler.DB.QueryRow(`
		SELECT Status_ID FROM Follow_Requests
		WHERE Requester_ID = ? AND Receiver_ID = ? AND Is_Active = 1`,
		requesterID, receiverID).Scan(&statusID)
	if err != nil {
		return fmt.Errorf("follow request not found")
	}
	if statusID != 1 {
		return fmt.Errorf("request is not pending")
	}

	// Deactivate the follow request
	formattedCurrentTime := time.Now().UTC().Format("2006-01-02 15:04:05")
	statement := `UPDATE Follow_Requests
		SET Last_Updated_By_ID = ?,
			Last_Updated_Time = ?,
			Is_Active = 0
		WHERE Requester_ID = ? AND Receiver_ID = ? AND Is_Active = 1`

	_, err = dbHandler.DB.Exec(statement, requesterID, formattedCurrentTime, requesterID, receiverID)
	if err != nil {
		return fmt.Errorf("failed to cancel request: %v", err)
	}

	return nil
}

func RejectFollowRequest(requesterID int, receiverID int) error {
	// Verify the request exists and is pending
	var statusID int
	err := dbHandler.DB.QueryRow(`
		SELECT Status_ID FROM Follow_Requests
		WHERE Requester_ID = ? AND Receiver_ID = ? AND Is_Active = 1`,
		requesterID, receiverID).Scan(&statusID)
	if err != nil {
		return fmt.Errorf("follow request not found")
	}
	if statusID != 1 {
		return fmt.Errorf("request is not pending")
	}

	// Update the request status to rejected (Status_ID = 3) and set Is_Active to 0
	formattedCurrentTime := time.Now().UTC().Format("2006-01-02 15:04:05")
	statement := `UPDATE Follow_Requests
		SET Status_ID = 3,
			Last_Updated_By_ID = ?,
			Last_Updated_Time = ?,
			Is_Active = 0
		WHERE Requester_ID = ? AND Receiver_ID = ? AND Is_Active = 1`

	_, err = dbHandler.DB.Exec(statement, receiverID, formattedCurrentTime, requesterID, receiverID)
	if err != nil {
		return fmt.Errorf("failed to update request status: %v", err)
	}

	return nil
}
