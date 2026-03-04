package dbConn

import (
	"database/sql"
	"fmt"
	"time"

	"social/backend/pkg/db/dbHandler"
)

type Notification struct {
	NotificationID     int
	NotificationText   string
	SourceID           int
	TargetID           int
	NotificationTypeID int
	IsRead             bool
	CreatedByID        int
	CreationTime       time.Time
	LastUpdatedByID    int
	LastUpdatedTime    time.Time
	IsActive           bool
}

type NotificationDisplay struct {
	NotificationID     int
	NotificationText   string
	SourceID           int
	NotificationTypeID int
	IsRead             bool
	CreationTime       time.Time
}

func CreateNotification(n Notification) (int64, error) {
	statement := `
	INSERT INTO Notifications (
		Notification_Text,
		Source_ID,
		Target_ID,
		Notification_Type_ID,
		Is_Read,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	now := time.Now().UTC().Format("2006-01-02 15:04:05")

	result, err := dbHandler.DB.Exec(
		statement,
		n.NotificationText,
		n.SourceID,
		n.TargetID,
		n.NotificationTypeID,
		false,
		n.CreatedByID,
		now,
		n.CreatedByID,
		now,
		true,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to create notification: %v", err)
	}

	notificationID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get notification id: %v", err)
	}

	return notificationID, nil
}

func GetNotificationsByTargetID(targetID int) ([]NotificationDisplay, error) {
	statement := `
	SELECT
		Notification_ID,
		Notification_Text,
		Source_ID,
		Notification_Type_ID,
		Is_Read,
		Creation_Time
	FROM Notifications
	WHERE Target_ID = ? AND Is_Active = 1
	ORDER BY Creation_Time DESC`

	rows, err := dbHandler.DB.Query(statement, targetID)
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %v", err)
	}
	defer rows.Close()

	var notifications []NotificationDisplay

	for rows.Next() {
		var n NotificationDisplay
		err := rows.Scan(
			&n.NotificationID,
			&n.NotificationText,
			&n.SourceID,
			&n.NotificationTypeID,
			&n.IsRead,
			&n.CreationTime,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan notification: %v", err)
		}
		notifications = append(notifications, n)
	}

	return notifications, nil
}

func DeleteNotification(notificationID int, userID int) error {
	statement := `
	UPDATE Notifications
	SET Is_Active = 0,
		Last_Updated_By_ID = ?,
		Last_Updated_Time = ?
	WHERE Notification_ID = ?
	AND Target_ID = ?`

	now := time.Now().UTC().Format("2006-01-02 15:04:05")

	res, err := dbHandler.DB.Exec(statement, userID, now, notificationID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete notification: %v", err)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("no notification updated (wrong id or not owned by user)")
	}
	fmt.Println("Notification deleted successfully")
	return nil
}

func GetNotificationByID(notificationID int) (Notification, error) {
	statement := `
	SELECT
		Notification_ID,
		Notification_Text,
		Source_ID,
		Target_ID,
		Notification_Type_ID,
		Is_Read,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	FROM Notifications
	WHERE Notification_ID = ? AND Is_Active = 1
	LIMIT 1`

	var n Notification

	err := dbHandler.DB.QueryRow(statement, notificationID).Scan(
		&n.NotificationID,
		&n.NotificationText,
		&n.SourceID,
		&n.TargetID,
		&n.NotificationTypeID,
		&n.IsRead,
		&n.CreatedByID,
		&n.CreationTime,
		&n.LastUpdatedByID,
		&n.LastUpdatedTime,
		&n.IsActive,
	)

	if err != nil {
		return Notification{}, fmt.Errorf("notification not found: %v", err)
	}

	return n, nil
}

func DeactivateNotification(notificationID int) error {
	statement := `
	UPDATE Notifications
	SET Is_Active = 0, Last_Updated_Time = ?
	WHERE Notification_ID = ?`

	now := time.Now().UTC().Format("2006-01-02 15:04:05")
	_, err := dbHandler.DB.Exec(statement, now, notificationID)
	if err != nil {
		return fmt.Errorf("failed to deactivate notification: %v", err)
	}

	return nil
}

// DeleteNotificationBySourceAndType deletes a notification based on source, target, and type
func DeleteNotificationBySourceAndType(sourceID, targetID, notificationTypeID int) error {
	statement := `
	UPDATE Notifications
	SET Is_Active = 0, Last_Updated_Time = ?
	WHERE Source_ID = ? 
	AND Target_ID = ? 
	AND Notification_Type_ID = ?
	AND Is_Active = 1`

	now := time.Now().UTC().Format("2006-01-02 15:04:05")
	_, err := dbHandler.DB.Exec(statement, now, sourceID, targetID, notificationTypeID)
	if err != nil {
		return fmt.Errorf("failed to delete notification: %v", err)
	}

	return nil
}

// GetNotificationIDBySourceAndType gets the notification ID by source, target, and type
func GetNotificationIDBySourceAndType(sourceID, targetID, notificationTypeID int) (int, error) {
	statement := `
	SELECT Notification_ID 
	FROM Notifications
	WHERE Source_ID = ? 
	AND Target_ID = ? 
	AND Notification_Type_ID = ?
	AND Is_Active = 1`

	var notificationID int
	err := dbHandler.DB.QueryRow(statement, sourceID, targetID, notificationTypeID).Scan(&notificationID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("notification not found")
		}
		return 0, fmt.Errorf("failed to get notification ID: %v", err)
	}

	return notificationID, nil
}
