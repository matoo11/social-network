package dbConn

import (
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"
)

type Message struct {
	MessageID    int
	SenderID     int
	ReceiverID   int
	MessageText  string
	IsRead       bool
	CreatedByID  int
	CreationTime time.Time
	IsActive     bool
}

type MessageDisplay struct {
	MessageID    int
	SenderID     int
	RecieverID   int
	Content      string
	CreationTime time.Timer
}

func CreateChatMessage(message Message) error {

	statement := `INSERT INTO Messages
    (
        Sender_ID,
        Receiver_ID,
        Message_Text,
        Is_Read,
        Created_By_ID,
        Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
        Is_Active
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	formattedCurrentTime := time.Now().UTC().Format("2006-01-02 15:04:05")

	_, err := dbHandler.DB.Exec(
		statement,
		message.SenderID,
		message.ReceiverID,
		message.MessageText,
		message.IsRead,
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

func GetChatMessagesBetweenUsers(user1ID, user2ID int) ([]Message, error) {
	statement := `SELECT
        Message_ID,
        Sender_ID,
        Receiver_ID,
        Message_Text,
        Is_Read,
        Created_By_ID,
        Creation_Time,
        Is_Active
    FROM Messages
    WHERE ((SenderID = ? AND ReceiverID = ?) OR
           (SenderID = ? AND ReceiverID = ?))
    ORDER BY Sent_Time ASC`

	rows, err := dbHandler.DB.Query(statement, user1ID, user2ID, user2ID, user1ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get chat messages: %v", err)
	}
	defer rows.Close()

	var chats []Message
	for rows.Next() {
		var message Message
		var creationTimeStr time.Time

		err := rows.Scan(
			&message.MessageID,
			&message.SenderID,
			&message.ReceiverID,
			&message.MessageText,
			&message.IsRead,
			&message.CreatedByID,
			&creationTimeStr,
			&message.IsActive,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan chat message: %v", err)
		}

		message.CreationTime = creationTimeStr

		chats = append(chats, message)
	}

	return chats, nil
}
