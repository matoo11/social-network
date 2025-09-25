package dbConn

import (
	"fmt"
	"log"
	"social/backend/pkg/db/dbHandler"
	"time"
)

type Comment struct {
	CommentID       int
	CommentText     string
	PostID          int
	CreatedByID     int
	CreationTime    time.Time
	LastUpdatedByID int
	LastUpdatedTime time.Time
	IsActive        bool
}

func CreateComment(comment Comment) error {
	statement := `INSERT INTO Comments 
		( 
            Comment_Text, 
            Post_ID, 
            Created_By_ID, 
            Creation_Time, 
            Last_Updated_By_ID, 
            Last_Updated_Time
        ) 
        VALUES (?, ?, ?, ?, ?, ?)`
	formattedCurrentTime := time.Now().Format("2006-01-02 15:04:05")

	_, err := dbHandler.DB.Exec(
		statement,
		comment.CommentText,
		comment.PostID,
		comment.CreatedByID,
		formattedCurrentTime,
		comment.LastUpdatedByID,
		comment.LastUpdatedTime,
		formattedCurrentTime,
	)
	if err != nil {
		fmt.Print(err)
		return err
	}
	return nil
}

func DeleteComment(comment Comment, loggedInUserID int) error {
	var createdByID int
	statement := `SELECT Created_By_ID FROM Comments WHERE Comment_ID = ? AND Is_Active = 1`
	err := dbHandler.DB.QueryRow(statement, comment.CommentID).Scan(&createdByID)
	if err != nil {
		return err
	}
	if createdByID != loggedInUserID {
		return fmt.Errorf("you are not authorized to delete this comment")
	}
	statement = `DELETE FROM Comments WHERE Comment_ID = ?`
	_, err = dbHandler.DB.Exec(statement, comment.CommentID)
	if err != nil {
		log.Fatal(err)
		return err
	}
	return nil
}

// ===================================================================================
func GetCommentsByPostID(postID int) ([]Comment, error) {
	var comments []Comment
	statement := `SELECT Comment_ID, Comment_Text, Post_ID, Created_By_ID, 
		Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active 
		FROM Comments WHERE Post_ID = ? AND Is_Active = 1`
	data, err := dbHandler.DB.Query(statement, postID)
	if err != nil {
		return nil, err
	}
	defer data.Close()
	for data.Next() {
		var comment Comment
		err := data.Scan(&comment.CommentID, &comment.CommentText, &comment.PostID,
			&comment.CreatedByID, &comment.CreationTime, &comment.LastUpdatedByID,
			&comment.LastUpdatedTime, &comment.IsActive)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}
	if err := data.Err(); err != nil {
		return nil, err
	}
	return comments, nil
}
