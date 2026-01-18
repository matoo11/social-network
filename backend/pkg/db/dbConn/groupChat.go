package dbConn

import (
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"
)

type GroupMessage struct {
	MessageID       int
	SenderID     int
	GroupID   int
	MessageText  string
	CreatedByID  int
	CreationTime time.Time
	IsActive     bool
}

func CreateGroupMessage(message GroupMessage) error {
	
	statement := `INSERT INTO Group_Messages
    (
        Message_Text,
        Sender_ID,
        Group_ID,
        Created_By_ID,
        Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
        Is_Active
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?)`
	formattedCurrentTime := time.Now().UTC().Format("2006-01-02 15:04:05")

	_, err := dbHandler.DB.Exec(
		statement,
		message.MessageText,
		message.SenderID,
		message.GroupID,
		message.CreatedByID,
		formattedCurrentTime,
		formattedCurrentTime,
		formattedCurrentTime,
		message.IsActive,
	)
	if err != nil {
		fmt.Println("create error")
		return fmt.Errorf("failed to create chat message: %v", err)
	}
	return nil
}

func GetGroupMessagesByID(GroupID int) ([]GroupMessage, error) {
	statement := `SELECT
        Group_Message_ID,
        Group_ID,
        Sender_ID,
        Message_Text,
        Created_By_ID,
        Creation_Time,
        Is_Active
    FROM Group_Messages
    WHERE Group_ID = ?
    ORDER BY Creation_Time ASC`

	rows, err := dbHandler.DB.Query(statement, GroupID)
	if err != nil {
		return nil, fmt.Errorf("failed to get group messages: %v", err)
	}
	defer rows.Close()

	var messages []GroupMessage
	for rows.Next() {
		var msg GroupMessage
		var creationTime time.Time
		
		err := rows.Scan(
			&msg.MessageID,
			&msg.GroupID,
			&msg.SenderID,
			&msg.MessageText,
			&msg.CreatedByID,
			&creationTime,
			&msg.IsActive,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan group message: %v", err)
		}

		msg.CreationTime = creationTime
		messages = append(messages, msg)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %v", err)
	}

	return messages, nil
}

