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
	UserID          int
	ImageID         *int
	CreatedByID     int
	CreationTime    time.Time
	LastUpdatedByID int
	LastUpdatedTime time.Time
	IsActive        bool
}

type PostDisplay struct {
	PostID          int
	PostTitle       string
	PostText        string
	PostTypeID      int
	UserID, ImageID int
	CreationTime    time.Time
	Comments        []CommentDisplay
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

func GetPublicPosts() ([]PostDisplay, error) {
	statement := `SELECT Post_ID, Post_Title, Post_Text, User_ID, Post_Type_ID, Image_ID, Creation_Time FROM Posts WHERE Is_Active = 1 AND Post_Type_ID = 1 ORDER BY Creation_Time DESC`

	rows, err := dbHandler.DB.Query(statement)
	if err != nil {
		return nil, fmt.Errorf("failed to get chat messages: %v", err)
	}
	defer rows.Close()

	var posts []PostDisplay
	for rows.Next() {
		var post PostDisplay

		err := rows.Scan(
			&post.PostID,
			&post.PostTitle,
			&post.PostText,
			&post.UserID,
			&post.PostTypeID,
			&post.ImageID,
			&post.CreationTime,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan chat message: %v", err)
		}

		post.Comments, err = GetCommentsByPostID(post.PostID)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}
