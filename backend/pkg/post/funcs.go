package post

import (
	"social/backend/pkg/db/dbConn"
	"sort"
	"strings"
)

func buildDisplayedComments(postID int) ([]displayedCommentDTO, error) {
	comments, err := dbConn.GetCommentsByPostID(postID)
	if err != nil {
		return nil, err
	}

	out := make([]displayedCommentDTO, 0, len(comments))
	for _, c := range comments {
		commenter, err := dbConn.GetUserByID(c.CreatedByID)
		if err != nil {
			return nil, err
		}

		commentImageID := 0
		if c.CommentImageID != nil {
			commentImageID = *c.CommentImageID
		}

		out = append(out, displayedCommentDTO{
			PostID:                c.PostID,
			CommentID:             c.CommentID,
			CommentText:           c.CommentText,
			CommenterNickname:     commenter.Nick_Name,
			CommentProfileImageID: commenter.Image_ID,
			CommentImageID:        commentImageID,
			CommentTime:           c.CreationTime,
			NumberOfLikes:         0,
			NumberOfDislikes:      0,
		})
	}

	return out, nil
}

func buildDisplayedPost(p dbConn.PostDisplay) (displayedPostDTO, error) {
	postTypeName, err := dbConn.GetPostTypeNameByID(p.PostTypeID)
	if err != nil {
		postTypeName = ""
	}

	poster, err := dbConn.GetUserByID(p.UserID)
	if err != nil {
		return displayedPostDTO{}, err
	}

	postImageID := 0
	if p.ImageID != nil {
		postImageID = *p.ImageID
	}

	comments, err := buildDisplayedComments(p.PostID)
	if err != nil {
		return displayedPostDTO{}, err
	}

	return displayedPostDTO{
		PostID:             p.PostID,
		PostTitle:          p.PostTitle,
		PostText:           p.PostText,
		PostType:           postTypeName,
		PosterNickname:     poster.Nick_Name,
		PosterAvatarNumber: poster.Image_ID,
		PostImageID:        postImageID,
		PostTime:           p.CreationTime,
		NumberOfLikes:      0,
		NumberOfDislikes:   0,
		NumberOfComments:   len(comments),
		Comments:           comments,
	}, nil
}

func fetchAllVisiblePostsForUser(userID int) ([]displayedPostDTO, error) {
	byID := make(map[int]displayedPostDTO)

	publicPosts, err := dbConn.GetPublicPosts()
	if err != nil {
		return nil, err
	}
	for _, p := range publicPosts {
		dto, err := buildDisplayedPost(p)
		if err != nil {
			return nil, err
		}
		byID[dto.PostID] = dto
	}

	followedOnly, err := dbConn.GetPrivateFollowedPosts(userID)
	if err != nil {
		return nil, err
	}
	for _, p := range followedOnly {
		pd, err := dbConn.GetPostByID(p.PostID)
		if err != nil {
			return nil, err
		}
		dto, err := buildDisplayedPost(pd)
		if err != nil {
			return nil, err
		}
		byID[dto.PostID] = dto
	}

	customPrivate, err := dbConn.GetPrivateCustomPosts(userID)
	if err != nil {
		return nil, err
	}
	for _, p := range customPrivate {
		pd, err := dbConn.GetPostByID(p.PostID)
		if err != nil {
			return nil, err
		}
		dto, err := buildDisplayedPost(pd)
		if err != nil {
			return nil, err
		}
		byID[dto.PostID] = dto
	}

	ownPosts, err := dbConn.GetPostsByUserForViewer(userID, userID)
	if err != nil {
		return nil, err
	}
	for _, p := range ownPosts {
		dto, err := buildDisplayedPost(p)
		if err != nil {
			return nil, err
		}
		byID[dto.PostID] = dto
	}

	out := make([]displayedPostDTO, 0, len(byID))
	for _, p := range byID {
		out = append(out, p)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].PostTime.After(out[j].PostTime) })
	return out, nil
}

// helper functions
func ValidatePostPayload(p *PostPayload) map[string]string {
	errors := make(map[string]string)

	// Validate title
	if p.Title == nil || len(strings.TrimSpace(*p.Title)) == 0 {
		errors["title"] = "Title is required"
	} else if len(*p.Title) > 60 {
		errors["title"] = "The post title length exceeded 60 characters"
	}

	// Validate message
	if p.Message == nil || len(strings.TrimSpace(*p.Message)) == 0 {
		errors["message"] = "Message is required"
	} else if len(*p.Message) > 600 {
		errors["message"] = "The post length exceeded 600 characters"
	}

	// Validate type ID
	if p.PostTypeID == nil {
		errors["typeId"] = "TypeID is required"
	}

	// Conditional validation: PrivateUsers required if PostTypeID == 3
	if p.PostTypeID != nil && *p.PostTypeID == 3 {
		if len(p.PrivateUsers) == 0 {
			errors["privateUsers"] = "PrivateUsers cannot be empty when PostTypeID is 3"
		}
	}

	return errors
}
