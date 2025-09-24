package dbConn

import (
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"
)

type Post struct {
	PostID          int
	PostTitle       string
	PostText        string
	PostTypeID      int
	UserID, ImageID int
	CreatedByID     int
	CreationTime    time.Time
	LastUpdatedByID int
	LastUpdatedTime time.Time
	IsActive        bool
}

func CreatePost(post Post) error {
	fmt.Println("here19")
	statement := `INSERT INTO Posts
    (
		Post_Title,
        Post_Text,
		Post_Type_ID,
        User_ID,
        Image_ID,
        Created_By_ID,
        Creation_Time,
        Last_Updated_By_ID,
        Last_Updated_Time
    )
	VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	formattedCurrentTime := time.Now().Format("2006-01-02 15:04:05")

	_, err := dbHandler.DB.Exec(
		statement,
		post.PostTitle,
		post.PostText,
		post.PostTypeID,
		post.UserID,
		post.ImageID,
		post.CreatedByID,
		formattedCurrentTime,
		post.LastUpdatedByID,
		formattedCurrentTime,
	)
	if err != nil {
		fmt.Println(err)
		return err
	}
	statement = `SELECT Post_ID FROM Posts
				WHERE Is_Active = 1
				ORDER BY Post_ID DESC
				LIMIT 1;`

	var postID int
	err = dbHandler.DB.QueryRow(statement).Scan(&postID)
	if err != nil {
		return err
	}

	fmt.Println("here9")
	return nil
}

func DeletePost(post Post) error {
	statement := "DELETE FROM Posts WHERE Post_ID = ?"

	_, err := dbHandler.DB.Exec(statement, post.PostID)
	if err != nil {
		return err
	}
	return nil
}
