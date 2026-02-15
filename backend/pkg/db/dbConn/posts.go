package dbConn

import (
	"bytes"
	"database/sql"
	"fmt"
	"image"
	"io"
	"mime/multipart"
	"net/http"
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

type PostData struct {
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
	PrivateUsersIDs []int
}

type PostDisplay struct {
	PostID             int
	PostTitle          string
	PostText           string
	PostTypeID         int
	UserID             int
	UserName           string
	ImageID            *int
	PosterAvatarNumber int
	CreationTime       time.Time
	Comments           []CommentDisplay
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func CreatePost(post PostData) error {
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

	formattedCurrentTime := time.Now().UTC().Format("2006-01-02 15:04:05")

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

	// If post is private (PostTypeID == 3), grant access to specified users
	if post.PostTypeID == 3 && len(post.PrivateUsersIDs) > 0 {
		var postID int
		err = dbHandler.DB.QueryRow("SELECT last_insert_rowid()").Scan(&postID)
		if err != nil {
			return err
		}

		err = GrantPostAccessToUsers(postID, post.PrivateUsersIDs, post.CreatedByID)
		if err != nil {
			return err
		}
	}

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
	statement := `SELECT 
    p.Post_ID,
    p.Post_Title,
    p.Post_Text,
    p.User_ID,
    u.User_Name,
    p.Post_Type_ID,
    p.Image_ID,
    p.Creation_Time
	FROM Posts p
	JOIN Users u ON p.User_ID = u.User_ID
	WHERE p.Is_Active = 1
  	AND p.Post_Type_ID = 1
	ORDER BY p.Creation_Time DESC;`

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
			&post.UserName,
			&post.PostTypeID,
			&post.ImageID,
			&post.CreationTime,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan chat message: %v", err)
		}

		var comments []CommentDisplay

		commments, err := GetCommentsByPostID(post.PostID)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch comments for post %d: %w", post.PostID, err)
		}

		for _, c := range commments {
			comments = append(comments, CommentDisplay{
				CommentID:    c.CommentID,
				PostID:       c.PostID,
				CommentText:  c.CommentText,
				CreationTime: c.CreationTime,
				CreatedByID:  c.CreatedByID,
			})
		}

		post.Comments = comments
		posts = append(posts, post)
	}

	return posts, nil
}

func GetPrivateFollowedPosts(userID int) ([]Post, error) {
	query := `
	SELECT Post_ID, User_ID, Post_Text, Post_Type_ID
	FROM Posts
	WHERE Post_Type_ID = 2
	  AND User_ID != ?
	  AND User_ID IN (
	      SELECT Followed_ID FROM Followers WHERE Follower_ID = ?
	  )
	ORDER BY Post_ID DESC
	`

	rows, err := dbHandler.DB.Query(query, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []Post
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.PostID, &post.UserID, &post.PostText, &post.PostTypeID)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}

func GetPrivateCustomPosts(userID int) ([]Post, error) {
	query := `
	SELECT Post_ID, User_ID, Post_Text, Post_Type_ID
	FROM Posts
	WHERE Post_Type_ID = 3
	  AND User_ID != ?
	  AND Post_ID IN (
	      SELECT Post_ID FROM Private_Posts_Users WHERE User_ID = ?
	  )
	ORDER BY Post_ID DESC
	`

	rows, err := dbHandler.DB.Query(query, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []Post
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.PostID, &post.UserID, &post.PostText, &post.PostTypeID)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}

func GrantPostAccessToUsers(postID int, userIDs []int, createdBy int) error {
	statement := `INSERT OR IGNORE INTO Private_Posts_Users
	(
		Post_ID,
		User_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	)
	VALUES (?, ?, ?, ?, ?, ?, ?)`

	formattedCurrentTime := time.Now().Format("2006-01-02 15:04:05")

	tx, err := dbHandler.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(statement)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, uid := range userIDs {
		_, err = stmt.Exec(
			postID,
			uid,
			createdBy,
			formattedCurrentTime,
			createdBy,
			formattedCurrentTime,
			true,
		)
		if err != nil {
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func IsPostOwner(postID int, userID int) (bool, error) {
	var ownerID int
	err := dbHandler.DB.QueryRow("SELECT User_ID FROM Posts WHERE Post_ID = ?", postID).Scan(&ownerID)
	if err != nil {
		return false, err
	}
	return ownerID == userID, nil
}

func GetPostsByUserForViewer(ownerID, viewerID int) ([]PostDisplay, error) {
	isOwner := viewerID != 0 && viewerID == ownerID
	isFollower := false

	if !isOwner && viewerID > 0 {
		var err error
		isFollower, err = IsFollowing(viewerID, ownerID)
		if err != nil {
			return nil, fmt.Errorf("failed to check follow relationship: %w", err)
		}
	}

	query := `
		SELECT
			p.Post_ID,
			p.Post_Title,
			p.Post_Text,
			p.Post_Type_ID,
			p.User_ID,
			p.Image_ID,
			p.Creation_Time
		FROM Posts p
		WHERE p.User_ID = ?
		  AND p.Is_Active = 1
		  AND (
		        ? = 1
		     OR p.Post_Type_ID = 1
		     OR (? = 1 AND p.Post_Type_ID = 2)
		     OR (
		        p.Post_Type_ID = 3 AND EXISTS (
		            SELECT 1 FROM Private_Posts_Users pru
		            WHERE pru.Post_ID = p.Post_ID AND pru.User_ID = ?
		        )
		     )
		  )
			 AND p.Post_Type_ID != 4
		ORDER BY p.Creation_Time DESC`

	rows, err := dbHandler.DB.Query(query, ownerID, boolToInt(isOwner), boolToInt(isFollower), viewerID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user posts: %w", err)
	}
	defer rows.Close()

	var posts []PostDisplay
	for rows.Next() {
		var post PostDisplay
		if err := rows.Scan(
			&post.PostID,
			&post.PostTitle,
			&post.PostText,
			&post.PostTypeID,
			&post.UserID,
			&post.ImageID,
			&post.CreationTime,
		); err != nil {
			return nil, fmt.Errorf("failed to scan user post: %w", err)
		}

		var comments []CommentDisplay

		commments, err := GetCommentsByPostID(post.PostID)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch comments for post %d: %w", post.PostID, err)
		}

		for _, c := range commments {
			comments = append(comments, CommentDisplay{
				CommentID:    c.CommentID,
				PostID:       c.PostID,
				CommentText:  c.CommentText,
				CreationTime: c.CreationTime,
				CreatedByID:  c.CreatedByID,
			})
		}

		post.Comments = comments

		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate user posts: %w", err)
	}

	return posts, nil
}

func SaveImage(file multipart.File, filename string, userID int) (int, error) {
	// Read file bytes
	data, err := io.ReadAll(file)
	if err != nil {
		return 0, err
	}

	// Detect image type and size
	contentType := http.DetectContentType(data)
	img, _, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		// fallback if image.DecodeConfig fails
		img.Width = 0
		img.Height = 0
	}

	// Validate aspect ratio to prevent extremely stretched images
	if img.Width > 0 && img.Height > 0 {
		aspectRatio := float64(img.Width) / float64(img.Height)
		// Reject images with aspect ratio greater than 5:1 or less than 1:5
		if aspectRatio > 5.0 || aspectRatio < 0.2 {
			return 0, fmt.Errorf("image aspect ratio is too extreme (width:height must be between 1:5 and 5:1)")
		}
	}

	query := `
	INSERT INTO Images (
		Image_Reference,
		Image_Data,
		Image_Filename,
		Image_Mimetype,
		Image_Width,
		Image_Height,
		Image_Size,
		Image_Usage_Type_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	formattedTime := time.Now().UTC().Format("2006-01-02 15:04:05")

	result, err := dbHandler.DB.Exec(
		query,
		"nil", // optional reference string (if you use external path)
		data,
		filename,
		contentType,
		img.Width,
		img.Height,
		len(data),
		2, // Image_Usage_Type_ID — define 2 for “post image”
		userID,
		formattedTime,
		userID,
		formattedTime,
		1,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to save image: %v", err)
	}

	lastID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get last image id: %v", err)
	}

	return int(lastID), nil
}

func GetPostImage(id int) ([]byte, string, error) {
	var data []byte
	var mimeType string
	err := dbHandler.DB.QueryRow("SELECT Image_Data, Image_Mimetype FROM Images WHERE Image_ID = ?", id).
		Scan(&data, &mimeType)
	if err != nil {
		// http.Error(w, "Image not found", http.StatusNotFound)
		return nil, "", err
	}
	return data, mimeType, nil
}

func GetPostByID(postID int) (PostDisplay, error) {
	var post PostDisplay
	query := `
	SELECT 
		p.Post_ID,
		p.Post_Title,
		p.Post_Text,
		p.User_ID,
		u.User_Name,
		p.Post_Type_ID,
		p.Image_ID,
		u.Image_ID,
		p.Creation_Time
	FROM Posts p
	JOIN Users u ON p.User_ID = u.User_ID
	WHERE p.Post_ID = ?`

	err := dbHandler.DB.QueryRow(query, postID).Scan(
		&post.PostID,
		&post.PostTitle,
		&post.PostText,
		&post.UserID,
		&post.UserName,
		&post.PostTypeID,
		&post.ImageID,
		&post.PosterAvatarNumber,
		&post.CreationTime,
	)
	if err != nil {
		return post, fmt.Errorf("failed to get post by ID: %v", err)
	}

	var comments []CommentDisplay

	commments, err := GetCommentsByPostID(post.PostID)
	if err != nil {
		return PostDisplay{}, fmt.Errorf("failed to fetch comments for post %d: %w", post.PostID, err)
	}

	for _, c := range commments {
		commenter, err := GetUserByID(c.CreatedByID)
		if err != nil {
			return PostDisplay{}, fmt.Errorf("failed to get commenter for comment %d: %w", c.CommentID, err)
		}
		comments = append(comments, CommentDisplay{
			CommentID:             c.CommentID,
			PostID:                c.PostID,
			CommentText:           c.CommentText,
			CreationTime:          c.CreationTime,
			CreatedByID:           c.CreatedByID,
			CommenterAvatarNumber: commenter.Image_ID,
		})
	}

	post.Comments = comments

	return post, nil
}

func GetPostTypeNameByID(postTypeID int) (string, error) {
	var postTypeName string
	err := dbHandler.DB.QueryRow("SELECT Post_Type_Name FROM Post_Types WHERE Post_Type_ID = ?", postTypeID).
		Scan(&postTypeName)
	if err != nil {
		return "", err
	}
	return postTypeName, nil
}

func GetGroupIDByPostID(postID int) (int, error) {
	var groupID int
	err := dbHandler.DB.QueryRow(`
		SELECT Group_ID 
		FROM Group_Posts 
		WHERE Post_ID = ? AND Is_Active = 1
	`, postID).Scan(&groupID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil // Post is not in a group
		}
		return 0, err
	}
	return groupID, nil
}

func HasPrivatePostAccess(postID int, userID int) (bool, error) {
	var count int
	err := dbHandler.DB.QueryRow(`
		SELECT COUNT(*) 
		FROM Private_Posts_Users 
		WHERE Post_ID = ? AND User_ID = ? AND Is_Active = 1
	`, postID, userID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func GetPostIDByImageID(imageID int) (int, error) {
	var postID int
	err := dbHandler.DB.QueryRow(`
		SELECT Post_ID 
		FROM Posts 
		WHERE Image_ID = ? AND Is_Active = 1
	`, imageID).Scan(&postID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil // Image doesn't belong to a post
		}
		return 0, err
	}
	return postID, nil
}
