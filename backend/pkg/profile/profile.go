package profile

import (
	"social/backend/pkg/db/dbConn"
	"time"
)

type profileRequest struct {
	UserID *int `json:"userID"`
}

type toggleVisibilityRequest struct {
	Visibility    string `json:"visibility"`
	ProfileTypeID *int   `json:"profileTypeId"`
	IsPublic      *bool  `json:"isPublic"`
}

type profileUserDTO struct {
	UserID          int     `json:"userID"`
	UserName        string  `json:"userName"`
	NickName        string  `json:"nickName"`
	Email           string  `json:"email"`
	FirstName       string  `json:"firstName"`
	LastName        string  `json:"lastName"`
	DateOfBirth     *string `json:"dateOfBirth,omitempty"`
	Gender          string  `json:"gender"`
	ImageID         int     `json:"imageID"`
	AboutMe         *string `json:"aboutMe,omitempty"`
	ProfileTypeID   int     `json:"profileTypeId"`
	ProfileTypeName string  `json:"profileTypeName"`
}



type profileCommentDTO struct {
	CommentID    int    `json:"commentID"`
	CommentText  string `json:"commentText"`
	PostID       int    `json:"postID"`
	CreatedByID  int    `json:"createdByID"`
	CreationTime string `json:"creationTime"`
}

type profilePostDTO struct {
	PostID        int                 `json:"postID"`
	Title         string              `json:"title"`
	Content       string              `json:"content"`
	PostTypeID    int                 `json:"postTypeId"`
	ImageID       *int                `json:"imageID,omitempty"`
	CreatedAt     string              `json:"createdAt"`
	Comments      []profileCommentDTO `json:"comments"`
	CommentsCount int                 `json:"commentsCount"`
}

func toProfilePostsDTO(posts []dbConn.PostDisplay) []profilePostDTO {
	result := make([]profilePostDTO, 0, len(posts))
	for _, post := range posts {
		result = append(result, profilePostDTO{
			PostID:        post.PostID,
			Title:         post.PostTitle,
			Content:       post.PostText,
			PostTypeID:    post.PostTypeID,
			ImageID:       post.ImageID,
			CreatedAt:     post.CreationTime.Format(time.RFC3339),
			Comments:      toProfileCommentsDTO(post.Comments),
			CommentsCount: len(post.Comments),
		})
	}
	return result
}
func toProfileUserDTO(details dbConn.ProfileUserDetails, profileTypeName string) profileUserDTO {
	return profileUserDTO{
		UserID:          details.UserID,
		UserName:        details.UserName,
		NickName:        details.NickName,
		Email:           details.Email,
		FirstName:       details.FirstName,
		LastName:        details.LastName,
		DateOfBirth:     details.DateOfBirth,
		Gender:          details.Gender,
		ImageID:         details.ImageID,
		AboutMe:         details.AboutMe,
		ProfileTypeID:   details.ProfileTypeID,
		ProfileTypeName: profileTypeName,
	}
}
func toProfileCommentsDTO(comments []dbConn.CommentDisplay) []profileCommentDTO {
	result := make([]profileCommentDTO, 0, len(comments))
	for _, comment := range comments {
		result = append(result, profileCommentDTO{
			CommentID:    comment.CommentID,
			CommentText:  comment.CommentText,
			PostID:       comment.PostID,
			CreatedByID:  comment.CreatedByID,
			CreationTime: comment.CreationTime.Format(time.RFC3339),
		})
	}
	return result
}

