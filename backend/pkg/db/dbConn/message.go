package dbConn

import (
	"database/sql"
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
	CreationTime time.Time
	IsSender     bool
}

type ChatUser struct {
	UserID          int
	Username        string
	LastMessageTime string
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

