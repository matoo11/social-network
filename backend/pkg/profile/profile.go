package profile

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
)

type profileRequest struct {
	UserID *int `json:"userID"`
}

type toggleVisibilityRequest struct {
	Visibility    string `json:"visibility"`
	ProfileTypeID *int   `json:"profileTypeId"`
	IsPublic      *bool  `json:"isPublic"`
}

type profileUser struct {
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

type profilePost struct {
	PostID        int                 `json:"postID"`
	Title         string              `json:"title"`
	Content       string              `json:"content"`
	PostTypeID    int                 `json:"postTypeId"`
	ImageID       *int                `json:"imageID,omitempty"`
	CreatedAt     string              `json:"createdAt"`
	Comments      []profileComment `json:"comments"`
	CommentsCount int                 `json:"commentsCount"`
}

type profileComment struct {
	CommentID    int    `json:"commentID"`
	CommentText  string `json:"commentText"`
	PostID       int    `json:"postID"`
	CreatedByID  int    `json:"createdByID"`
	CreationTime string `json:"creationTime"`
}

type profileFollow struct {
	UserID    int    `json:"userID"`
	UserName  string `json:"userName"`
	NickName  string `json:"nickName"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	ImageID   int    `json:"imageID"`
}

type profileResponse struct {
	User            profileUser     `json:"user"`
	Posts           []profilePost   `json:"posts"`
	Followers       []profileFollow `json:"followers"`
	Following       []profileFollow `json:"following"`
	FollowersCount  int                `json:"followersCount"`
	FollowingCount  int                `json:"followingCount"`
	IsOwner         bool               `json:"isOwner"`
	IsFollower      bool               `json:"isFollower"`
	ProfileTypeName string             `json:"profileTypeName"`
}

func GetProfileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		auth.ErrorPage(w, http.StatusUnauthorized)
		return
	}
	viewerID := session.UserID

	request, err := parseProfileRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	targetUserID := viewerID
	if request.UserID != nil {
		targetUserID = *request.UserID
	}

	profileDetails, err := dbConn.GetUserProfileDetails(targetUserID)
	if err != nil {
		if errors.Is(err, dbConn.ErrUserProfileNotFound) {
			auth.ErrorPage(w, http.StatusNotFound)
			return
		}
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	privateTypeID, err := dbConn.GetProfileTypeIDByName("Private")
	if err != nil && !errors.Is(err, dbConn.ErrProfileTypeNotFound) {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	profileTypeName, err := dbConn.GetProfileTypeNameByID(profileDetails.ProfileTypeID)
	if err != nil && !errors.Is(err, dbConn.ErrProfileTypeNotFound) {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	isOwner := viewerID == targetUserID
	isFollower := false

	if !isOwner {
		isFollower, err = dbConn.IsFollowing(viewerID, targetUserID)
		if err != nil {
			auth.ErrorPage(w, http.StatusInternalServerError)
			return
		}
	}

	if privateTypeID != 0 && profileDetails.ProfileTypeID == privateTypeID && !isOwner && !isFollower {
		auth.ErrorPage(w, http.StatusForbidden)
		return
	}

	posts, err := dbConn.GetPostsByUserForViewer(targetUserID, viewerID)
	if err != nil {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	followers, err := dbConn.GetFollowersDetailed(targetUserID)
	if err != nil {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	following, err := dbConn.GetFollowingDetailed(targetUserID)
	if err != nil {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	response := profileResponse{
		User:            toProfileUser(profileDetails, profileTypeName),
		Posts:           toProfilePosts(posts),
		Followers:       toProfileFollow(followers),
		Following:       toProfileFollow(following),
		FollowersCount:  len(followers),
		FollowingCount:  len(following),
		IsOwner:         isOwner,
		IsFollower:      isFollower,
		ProfileTypeName: profileTypeName,
	}

	auth.Respond(w, r, http.StatusOK, response, "profile retrieved successfully")
}

func ToggleProfileVisibilityHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		auth.ErrorPage(w, http.StatusUnauthorized)
		return
	}
	userID := session.UserID

	var payload toggleVisibilityRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		if err == io.EOF {
			http.Error(w, "request body cannot be empty", http.StatusBadRequest)
			return
		}
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	targetTypeID, err := resolveVisibilityTarget(payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	publicTypeID, err := dbConn.GetProfileTypeIDByName("Public")
	if err != nil && !errors.Is(err, dbConn.ErrProfileTypeNotFound) {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}
	privateTypeID, err := dbConn.GetProfileTypeIDByName("Private")
	if err != nil && !errors.Is(err, dbConn.ErrProfileTypeNotFound) {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	if targetTypeID != publicTypeID && targetTypeID != privateTypeID {
		http.Error(w, "unsupported profile type", http.StatusBadRequest)
		return
	}

	currentDetails, err := dbConn.GetUserProfileDetails(userID)
	if err != nil {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	if currentDetails.ProfileTypeID == targetTypeID {
		auth.Respond(w, r, http.StatusOK, map[string]any{
			"profileTypeId":   currentDetails.ProfileTypeID,
			"profileTypeName": visibilityName(currentDetails.ProfileTypeID, publicTypeID, privateTypeID),
		}, "profile visibility already set")
		return
	}

	if err := dbConn.UpdateUserProfileType(userID, targetTypeID, userID); err != nil {
		auth.ErrorPage(w, http.StatusInternalServerError)
		return
	}

	newTypeName := visibilityName(targetTypeID, publicTypeID, privateTypeID)
	auth.Respond(w, r, http.StatusOK, map[string]any{
		"profileTypeId":   targetTypeID,
		"profileTypeName": newTypeName,
	}, "profile visibility updated")
}

func parseProfileRequest(r *http.Request) (profileRequest, error) {
	var req profileRequest

	if r.Method == http.MethodGet {
		if idStr := strings.TrimSpace(r.URL.Query().Get("userID")); idStr != "" {
			userID, err := strconv.Atoi(idStr)
			if err != nil || userID <= 0 {
				return profileRequest{}, errors.New("invalid userID parameter")
			}
			req.UserID = &userID
		}
		return req, nil
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return profileRequest{}, errors.New("failed to read request body")
	}
	if len(body) == 0 {
		return req, nil
	}
	if err := json.Unmarshal(body, &req); err != nil {
		return profileRequest{}, errors.New("invalid request body")
	}
	if req.UserID != nil && *req.UserID <= 0 {
		return profileRequest{}, errors.New("invalid userID value")
	}
	return req, nil
}

func toProfileUser(details dbConn.ProfileUserDetails, profileTypeName string) profileUser {
	return profileUser{
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

func toProfilePosts(posts []dbConn.PostDisplay) []profilePost {
	result := make([]profilePost, 0, len(posts))
	for _, post := range posts {
		result = append(result, profilePost{
			PostID:        post.PostID,
			Title:         post.PostTitle,
			Content:       post.PostText,
			PostTypeID:    post.PostTypeID,
			ImageID:       post.ImageID,
			CreatedAt:     post.CreationTime.Format(time.RFC3339),
			Comments:      toProfileComments(post.Comments),
			CommentsCount: len(post.Comments),
		})
	}
	return result
}

func toProfileComments(comments []dbConn.CommentDisplay) []profileComment {
	result := make([]profileComment, 0, len(comments))
	for _, comment := range comments {
		result = append(result, profileComment{
			CommentID:    comment.CommentID,
			CommentText:  comment.CommentText,
			PostID:       comment.PostID,
			CreatedByID:  comment.CreatedByID,
			CreationTime: comment.CreationTime.Format(time.RFC3339),
		})
	}
	return result
}

func toProfileFollow(users []dbConn.FollowUserDetails) []profileFollow {
	result := make([]profileFollow, 0, len(users))
	for _, user := range users {
		result = append(result, profileFollow{
			UserID:    user.UserID,
			UserName:  user.UserName,
			NickName:  user.NickName,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			ImageID:   user.ImageID,
		})
	}
	return result
}

func resolveVisibilityTarget(payload toggleVisibilityRequest) (int, error) {
	if payload.ProfileTypeID != nil {
		if *payload.ProfileTypeID <= 0 {
			return 0, errors.New("profileTypeId must be positive")
		}
		return *payload.ProfileTypeID, nil
	}

	if payload.IsPublic != nil {
		if *payload.IsPublic {
			return dbConn.GetProfileTypeIDByName("Public")
		}
		return dbConn.GetProfileTypeIDByName("Private")
	}

	if visibility := strings.TrimSpace(strings.ToLower(payload.Visibility)); visibility != "" {
		switch visibility {
		case "public":
			return dbConn.GetProfileTypeIDByName("Public")
		case "private":
			return dbConn.GetProfileTypeIDByName("Private")
		default:
			return 0, errors.New("visibility must be either 'public' or 'private'")
		}
	}

	return 0, errors.New("no visibility option provided")
}

func visibilityName(profileTypeID, publicTypeID, privateTypeID int) string {
	switch profileTypeID {
	case publicTypeID:
		return "Public"
	case privateTypeID:
		return "Private"
	default:
		return ""
	}
}
