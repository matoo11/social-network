package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"
)

type Post struct {
	PostID          int
	PostText        string
	UserID, ImageID int
	CreatedByID     int
	CreationTime    time.Time
	LastUpdatedByID int
	LastUpdatedTime time.Time
	IsActive        bool
}

func CreatePost(post Post, categories []string) error {
	if len(categories) == 0 {
		categories = append(categories, "General")
	}
	statement := `INSERT INTO Posts
    (
        Post_Text,
        User_ID,
        Image_ID,
        Created_By_ID,
        Creation_Time,
        Last_Updated_By_ID,
        Last_Updated_Time
    )
	VALUES
    (?, ?, ?, ?, ?, ?, ?)`

	formattedCurrentTime := time.Now().Format("2006-01-02 15:04:05")

	_, err := dbHandler.DB.Exec(
		statement,
		post.PostText,
		post.UserID,
		post.ImageID,
		post.CreatedByID,
		formattedCurrentTime,
		post.LastUpdatedByID,
		formattedCurrentTime,
	)
	if err != nil {
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

	statement = `INSERT INTO Post_Categories
    (
        Post_ID,
        Category_ID,
        Created_By_ID,
        Creation_Time,
        Last_Updated_By_ID,
        Last_Updated_Time
    )
	VALUES
    (?, ?, ?, ?, ?, ?)`

	for _, category := range categories {
		categoryID, err := GetCategoryIDFromCategoryText(category)
		if err != nil {
			return err
		}

		_, err = dbHandler.DB.Exec(
			statement,
			postID,
			categoryID,
			post.CreatedByID,
			formattedCurrentTime,
			post.LastUpdatedByID,
			formattedCurrentTime,
		)
		if err != nil {
			return err
		}

	}
	return nil
}

func GetCategoryIDFromCategoryText(categoryText string) (int, error) {
	statement := `SELECT Category_ID FROM Categories WHERE Category_Text = ? AND Is_Active = 1`

	var CategoryID int
	err := dbHandler.DB.QueryRow(statement, categoryText).Scan(&CategoryID)

	if err == sql.ErrNoRows {
		return 0, fmt.Errorf("no category found with text: %s", categoryText)
	}
	if err != nil {
		return 0, err
	}
	return CategoryID, nil
}

func DeletePost(post Post) error {
	statement := "DELETE FROM Posts WHERE Post_ID = ?"

	_, err := dbHandler.DB.Exec(statement, post.PostID)
	if err != nil {
		return err
	}
	return nil
}
