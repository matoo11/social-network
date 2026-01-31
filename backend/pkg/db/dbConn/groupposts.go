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

type GroupComment struct {
	CommentID    int
	GroupPostID  int
	CommentText  string
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
	res, err := dbHandler.DB.Exec(postStatement, title, text, authorID, 4, authorID, now, authorID, now)
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

func GetGroupIDForGroupPost(groupPostID int) (int, error) {
	var groupID int
	err := dbHandler.DB.QueryRow(`SELECT Group_ID FROM Group_Posts WHERE Group_Post_ID = ? AND Is_Active = 1`, groupPostID).Scan(&groupID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("group post not found")
		}
		return 0, fmt.Errorf("failed to fetch group post: %w", err)
	}
	return groupID, nil
}

func CreateGroupComment(groupPostID, authorID int, text string) (GroupComment, error) {
	statement := `INSERT INTO Group_Comments (
		Comment_Text,
		Group_Post_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, 1)`

	now := formattedNow()
	res, err := dbHandler.DB.Exec(statement, text, groupPostID, authorID, now, authorID, now)
	if err != nil {
		return GroupComment{}, fmt.Errorf("failed to create group comment: %w", err)
	}

	commentID64, err := res.LastInsertId()
	if err != nil {
		return GroupComment{}, fmt.Errorf("failed to fetch comment id: %w", err)
	}

	createdAt, _ := time.Parse("2006-01-02 15:04:05", now)

	return GroupComment{
		CommentID:    int(commentID64),
		GroupPostID:  groupPostID,
		CommentText:  text,
		AuthorID:     authorID,
		CreationTime: createdAt,
	}, nil
}

func GetGroupComments(groupPostID int) ([]GroupComment, error) {
	statement := `
		SELECT Group_Comment_ID,
		       Comment_Text,
		       Group_Post_ID,
		       Created_By_ID,
		       Creation_Time
		FROM Group_Comments
		WHERE Group_Post_ID = ? AND Is_Active = 1
		ORDER BY Creation_Time ASC`

	rows, err := dbHandler.DB.Query(statement, groupPostID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch group comments: %w", err)
	}
	defer rows.Close()

	var comments []GroupComment
	for rows.Next() {
		var comment GroupComment
		var creationTimeStr string
		err := rows.Scan(&comment.CommentID, &comment.CommentText, &comment.GroupPostID, &comment.AuthorID, &creationTimeStr)
		if err != nil {
			return nil, fmt.Errorf("failed to scan group comment: %w", err)
		}
		if parsed, parseErr := time.Parse("2006-01-02 15:04:05", creationTimeStr); parseErr == nil {
			comment.CreationTime = parsed
		}
		comments = append(comments, comment)
	}
	return comments, nil
}
