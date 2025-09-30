package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"
)

type GroupPost struct {
	GroupPostID  int
	GroupID      int
	PostID       int
	Title        string
	Text         string
	AuthorID     int
	CreationTime time.Time
}

func CreateGroupPost(groupID, authorID int, title, text string) (GroupPost, error) {
	postStatement := `INSERT INTO Posts (
		Post_Title,
		Post_Text,
		User_ID,
		Post_Type_ID,
		Image_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, 1)`

	now := formattedNow()
	res, err := dbHandler.DB.Exec(postStatement, title, text, authorID, 3, authorID, now, authorID, now)
	if err != nil {
		return GroupPost{}, fmt.Errorf("failed to create post: %w", err)
	}

	postID64, err := res.LastInsertId()
	if err != nil {
		return GroupPost{}, fmt.Errorf("failed to fetch post id: %w", err)
	}
	postID := int(postID64)

	groupPostStatement := `INSERT INTO Group_Posts (
		Post_ID,
		Group_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, 1)`

	res, err = dbHandler.DB.Exec(groupPostStatement, postID, groupID, authorID, now, authorID, now)
	if err != nil {
		return GroupPost{}, fmt.Errorf("failed to link post to group: %w", err)
	}

	groupPostID64, err := res.LastInsertId()
	if err != nil {
		return GroupPost{}, fmt.Errorf("failed to fetch group post id: %w", err)
	}

	createdAt, _ := time.Parse("2006-01-02 15:04:05", now)

	return GroupPost{
		GroupPostID:  int(groupPostID64),
		GroupID:      groupID,
		PostID:       postID,
		Title:        title,
		Text:         text,
		AuthorID:     authorID,
		CreationTime: createdAt,
	}, nil
}
