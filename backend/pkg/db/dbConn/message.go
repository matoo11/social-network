package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"
)

type Message struct {
	MessageID       int
	MessageText     string
	SenderID        int
	ReceiverID      int
	IsRead          bool
	CreatedByID     int
	CreationTime    time.Time
	LastUpdatedByID int
	LastUpdatedTime time.Time
	IsActive        bool
}

type MessageDisplay struct {
	MessageID    int
	SenderID     int
	RecieverID   int
	Content      string
	CreationTime time.Time
	IsSender     bool
}

type ChatUser struct {
	UserID          int
	Username        string
	LastMessageTime string
}

func CreateNewMessage(message Message) (int, error) {

	if len(message.MessageText) <= 0 || len(message.MessageText) > 2000 {
		return 0, fmt.Errorf("message length should be between 1 and 2000")
	}

	statement := `INSERT INTO Messages 
    (message_text, 
     sender_id, 
     receiver_id, 
     created_by_id, 
     creation_time, 
     last_updated_by_id, 
     last_updated_time)
	VALUES (?, ?, ?, ?, ?, ?, ?)`

	currentTime := time.Now().Format("2006-01-02 15:04:05")

	result, err := dbHandler.DB.Exec(statement,
		message.MessageText,
		message.SenderID,
		message.ReceiverID,
		message.CreatedByID,
		currentTime,
		message.LastUpdatedByID,
		currentTime,
	)

	if err != nil {
		return 0, fmt.Errorf("failed to insert message: %v", err)
	}

	messageID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve inserted message ID: %v", err)
	}

	return int(messageID), nil
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
    WHERE ((Sender_ID = ? AND Receiver_ID = ?) OR
           (Sender_ID = ? AND Receiver_ID = ?))
    ORDER BY Creation_Time ASC`

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

func GetChatUsers(userID int) ([]ChatUser, error) {
    statement := `
        SELECT
            otherUser.User_ID,
            MAX(m.Creation_Time) AS LastMessageTime
        FROM (
            -- users I follow
            SELECT Followed_ID AS User_ID 
            FROM Followers 
            WHERE Follower_ID = ?
            
            UNION
            
            -- users who follow me
            SELECT Follower_ID AS User_ID 
            FROM Followers 
            WHERE Followed_ID = ?
        ) AS otherUser

        LEFT JOIN Messages m
            ON (
                (m.Sender_ID = ? AND m.Receiver_ID = otherUser.User_ID)
                OR
                (m.Sender_ID = otherUser.User_ID AND m.Receiver_ID = ?)
            )

        GROUP BY otherUser.User_ID
        ORDER BY LastMessageTime DESC;
    `

    rows, err := dbHandler.DB.Query(statement, userID, userID, userID, userID)
    if err != nil {
        return nil, fmt.Errorf("failed to get chat users: %v", err)
    }
    defer rows.Close()

    var users []ChatUser

    for rows.Next() {
        var user ChatUser
        var lastMsg sql.NullString

        err := rows.Scan(&user.UserID, &lastMsg)
        if err != nil {
            return nil, fmt.Errorf("failed to scan chat users: %v", err)
        }

        if lastMsg.Valid {
            user.LastMessageTime = lastMsg.String
        }
		user1, err := GetUserByID(user.UserID)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		user.Username = user1.User_Name
        users = append(users, user)
    }

    return users, nil
}

