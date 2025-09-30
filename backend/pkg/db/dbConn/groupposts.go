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

type GroupPostDisplay struct {
	GroupPost
	Comments []GroupComment
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

func GetGroupPosts(groupID int) ([]GroupPostDisplay, error) {
	statement := `
		SELECT gp.Group_Post_ID,
		       gp.Group_ID,
		       gp.Post_ID,
		       p.Post_Title,
		       p.Post_Text,
		       p.User_ID,
		       p.Creation_Time
		FROM Group_Posts gp
		JOIN Posts p ON gp.Post_ID = p.Post_ID
		WHERE gp.Group_ID = ? AND gp.Is_Active = 1 AND p.Is_Active = 1
		ORDER BY p.Creation_Time DESC`

	rows, err := dbHandler.DB.Query(statement, groupID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch group posts: %w", err)
	}
	defer rows.Close()

	var posts []GroupPostDisplay
	for rows.Next() {
		var gp GroupPost
		var creationTimeStr string
		err := rows.Scan(&gp.GroupPostID, &gp.GroupID, &gp.PostID, &gp.Title, &gp.Text, &gp.AuthorID, &creationTimeStr)
		if err != nil {
			return nil, fmt.Errorf("failed to scan group post: %w", err)
		}
		if parsed, parseErr := time.Parse("2006-01-02 15:04:05", creationTimeStr); parseErr == nil {
			gp.CreationTime = parsed
		}
		comments, err := GetGroupComments(gp.GroupPostID)
		if err != nil {
			return nil, err
		}
		posts = append(posts, GroupPostDisplay{GroupPost: gp, Comments: comments})
	}

	return posts, nil
}