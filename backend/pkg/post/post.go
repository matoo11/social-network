package post

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	"social/backend/pkg/util"
	"strconv"
	"time"
)

type displayedCommentDTO struct {
	PostID                int       `json:"postId"`
	CommentID             int       `json:"commentId"`
	CommentText           string    `json:"commentText"`
	CommenterNickname     string    `json:"commenterNickname"`
	CommentProfileImageID int       `json:"commentProfileImageId"`
	CommentImageID        int       `json:"commentImageId"`
	CommentTime           time.Time `json:"commentTime"`
	NumberOfLikes         int       `json:"numberOfLikes"`
	NumberOfDislikes      int       `json:"numberOfDislikes"`
}

type displayedPostDTO struct {
	PostID             int                   `json:"postId"`
	PostTitle          string                `json:"postTitle"`
	PostText           string                `json:"postText"`
	PostType           string                `json:"postType"`
	PosterNickname     string                `json:"posterNickname"`
	PosterAvatarNumber int                   `json:"posterAvatarNumber"`
	PostImageID        int                   `json:"postImageId"`
	PostTime           time.Time             `json:"postTime"`
	NumberOfLikes      int                   `json:"numberOfLikes"`
	NumberOfDislikes   int                   `json:"numberOfDislikes"`
	NumberOfComments   int                   `json:"numberOfComments"`
	Comments           []displayedCommentDTO `json:"comments"`
}

type PostPayload struct {
	Message      *string `json:"message"`
	Title        *string `json:"title"`
	PostTypeID   *int    `json:"typeId"`
	PrivateUsers []int   `json:"privateUsers"`
}

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
	LoggedInUserID := session.UserID

	err = r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	// Decode the JSON string from "data" field
	jsonData := r.FormValue("data")
	var payload PostPayload

	if err := json.Unmarshal([]byte(jsonData), &payload); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	// validate required fields
	validationErrors := ValidatePostPayload(&payload)
	if len(validationErrors) > 0 {
		w.WriteHeader(http.StatusBadRequest)
		// json.NewEncoder(w).Encode(map[string]any{
		// 	"error":  "Validation failed",
		// 	"fields": validationErrors,
		// })
		auth.JsonEncode(w, validationErrors)
		return
	}

	// Handle optional image
	var imageID *int = nil
	file, handler, err := r.FormFile("image")
	if err == nil {
		defer file.Close()
		imgID, err := dbConn.SaveImage(file, handler.Filename, LoggedInUserID)
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Image upload failed", http.StatusInternalServerError)
			return
		}
		imageID = &imgID
	} else if err != http.ErrMissingFile {
		http.Error(w, "Failed to read image", http.StatusBadRequest)
		return
	}

	post := dbConn.PostData{
		PostText:        *payload.Message,
		UserID:          LoggedInUserID,
		PostTitle:       *payload.Title,
		PostTypeID:      *payload.PostTypeID,
		ImageID:         imageID,
		CreatedByID:     LoggedInUserID,
		LastUpdatedByID: LoggedInUserID,
		PrivateUsersIDs: payload.PrivateUsers,
	}

	fmt.Println("Post Data:", post)

	if err := dbConn.CreatePost(post); err != nil {
		http.Error(w, "Could not create post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "Post created successfully")
}

func GetPublicPosts(w http.ResponseWriter, r *http.Request) {

	_, err := dbConn.GetSessionFromCookie(r)

	if err != nil {
		auth.ErrorPage(w, 401)
		return
	}
	posts, err := dbConn.GetPublicPosts()
	if err != nil {
		fmt.Println(err)
		return
	}

	err = auth.JsonEncode(w, posts)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func GetPrivatePosts(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)

	if err != nil {
		auth.ErrorPage(w, 401)
		return
	} else {
		LoggedInUserID = session.UserID
	}

	posts, err := dbConn.GetPrivateFollowedPosts(LoggedInUserID)
	if err != nil {
		auth.ErrorPage(w, 500)
	}

	pposts, err := dbConn.GetPrivateCustomPosts(LoggedInUserID)

	if err != nil {
		auth.ErrorPage(w, 500)
	}

	posts = append(posts, pposts...)

	err = auth.JsonEncode(w, posts)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func GrantAccessToPost(w http.ResponseWriter, r *http.Request) {
	var LoggedInUserID int

	session, err := dbConn.GetSessionFromCookie(r)

	if err != nil {
		auth.ErrorPage(w, 401)
		return
	} else {
		LoggedInUserID = session.UserID
	}

	data := struct {
		Users  []int `json:"users"`
		PostID int   `json:"postID"`
	}{}
	if err := auth.JsonDecode(w, r, &data); err != nil {
		auth.ErrorPage(w, 400)
		return
	}

	check, err := dbConn.IsPostOwner(data.PostID, LoggedInUserID)

	if err != nil {
		auth.ErrorPage(w, 500)
		return
	}

	if !check {
		auth.ErrorPage(w, 400)
		fmt.Println("this is not the owner of the post")
	}
	err = dbConn.GrantPostAccessToUsers(data.PostID, data.Users, LoggedInUserID)

	if err != nil {
		auth.ErrorPage(w, 500)
		return
	}
	fmt.Println("access granted successfully")
}

func GetImageHandler(w http.ResponseWriter, r *http.Request) {
	ids := r.URL.Query().Get("id")
	if ids == "" {
		http.Error(w, "Missing image id", http.StatusBadRequest)
		return
	}
	id, err := strconv.Atoi(ids)
	if err != nil {
		http.Error(w, "Invalid image id", http.StatusBadRequest)
		return
	}

	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		auth.ErrorPage(w, http.StatusUnauthorized)
		return
	}
	loggedInUserID := session.UserID

	postID, err := dbConn.GetPostIDByImageID(id)
	if err == nil && postID > 0 {
		groupID, err := dbConn.GetGroupIDByPostID(postID)
		if err == nil && groupID > 0 {
			isMember, err := dbConn.IsGroupMember(groupID, loggedInUserID)
			if err != nil || !isMember {
				http.Error(w, "Forbidden: You don't have access to this image", http.StatusForbidden)
				return
			}
		} else {
			post, err := dbConn.GetPostByID(postID)
			if err == nil {
				if post.UserID != loggedInUserID {
					if post.PostTypeID == 2 {
						isFollower, err := dbConn.IsFollowing(loggedInUserID, post.UserID)
						if err != nil || !isFollower {
							http.Error(w, "Forbidden: You don't have access to this image", http.StatusForbidden)
							return
						}
					} else if post.PostTypeID == 3 {
						hasAccess, err := dbConn.HasPrivatePostAccess(postID, loggedInUserID)
						if err != nil || !hasAccess {
							http.Error(w, "Forbidden: You don't have access to this image", http.StatusForbidden)
							return
						}
					}
				}
			}
		}
	}

	var data []byte
	var mimeType string
	data, mimeType, err = dbConn.GetPostImage(id)
	if err != nil {
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", mimeType)
	w.Write(data)

}

type PostIDRequest struct {
	ID int `json:"id"`
}

func GetPostByIDHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST or PUT for body (GET typically has no body)
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		auth.ErrorPage(w, http.StatusUnauthorized)
		return
	}
	loggedInUserID := session.UserID

	var req PostIDRequest

	// Decode JSON body
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check ID
	if req.ID == 0 {
		http.Error(w, "Missing post id", http.StatusBadRequest)
		return
	}


	groupID, err := dbConn.GetGroupIDByPostID(req.ID)
	if err == nil && groupID > 0 {

		isMember, err := dbConn.IsGroupMember(groupID, loggedInUserID)
		if err != nil || !isMember {
			http.Error(w, "Forbidden: You are not a member of this group", http.StatusForbidden)
			return
		}
	}

	// Fetch post
	postData, err := dbConn.GetPostByID(req.ID)
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}


	if groupID == 0 {

		if postData.UserID != loggedInUserID {

			if postData.PostTypeID == 2 {

				isFollower, err := dbConn.IsFollowing(loggedInUserID, postData.UserID)
				if err != nil || !isFollower {
					http.Error(w, "Forbidden: This post is only visible to followers", http.StatusForbidden)
					return
				}
			} else if postData.PostTypeID == 3 {

				hasAccess, err := dbConn.HasPrivatePostAccess(req.ID, loggedInUserID)
				if err != nil || !hasAccess {
					http.Error(w, "Forbidden: You don't have access to this private post", http.StatusForbidden)
					return
				}
			}
		}
	}

	// Return JSON
	if err := auth.JsonEncode(w, postData); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// func FetchAllPostsHandler(w http.ResponseWriter, r *http.Request) {
// 	user, authenticated := auth.Authenticator(w, r)
// 	if !authenticated {
// 		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
// 		return
// 	}

// 	posts, err := fetchAllVisiblePostsForUser(user.User_ID)
// 	if err != nil {
// 		util.Respond(w, r, http.StatusInternalServerError, nil, err.Error())
// 		return
// 	}
// 	util.Respond(w, r, http.StatusOK, posts, "Fetch all posts successful")
// }

func FetchPostByIDHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		util.Respond(w, r, http.StatusMethodNotAllowed, nil, "Method not allowed")
		return
	}

	user, authenticated := auth.Authenticator(w, r)
	if !authenticated {
		util.Respond(w, r, http.StatusUnauthorized, nil, http.StatusText(http.StatusUnauthorized))
		return
	}

	loggedInUserID := user.User_ID

	var req PostIDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.Respond(w, r, http.StatusBadRequest, nil, "Invalid JSON")
		return
	}
	if req.ID == 0 {
		util.Respond(w, r, http.StatusBadRequest, nil, "Missing post id")
		return
	}

	groupID, err := dbConn.GetGroupIDByPostID(req.ID)
	if err == nil && groupID > 0 {
		isMember, err := dbConn.IsGroupMember(groupID, loggedInUserID)
		if err != nil || !isMember {
			http.Error(w, "Forbidden: You are not a member of this group", http.StatusForbidden)
			return
		}
	}

	postData, err := dbConn.GetPostByID(req.ID)
	if err != nil {
		util.Respond(w, r, http.StatusNotFound, nil, "Post not found")
		return
	}

	if groupID == 0 {

		if postData.UserID != loggedInUserID {

			if postData.PostTypeID == 2 {

				isFollower, err := dbConn.IsFollowing(loggedInUserID, postData.UserID)
				if err != nil || !isFollower {
					http.Error(w, "Forbidden: This post is only visible to followers", http.StatusForbidden)
					return
				}
			} else if postData.PostTypeID == 3 {

				hasAccess, err := dbConn.HasPrivatePostAccess(req.ID, loggedInUserID)
				if err != nil || !hasAccess {
					http.Error(w, "Forbidden: You don't have access to this private post", http.StatusForbidden)
					return
				}
			}
		}
	}

	dto, err := buildDisplayedPost(postData)
	if err != nil {
		util.Respond(w, r, http.StatusInternalServerError, nil, "Failed to build post")
		return
	}

	util.Respond(w, r, http.StatusOK, dto, "Fetch post successful")
}

func FetchPosts(w http.ResponseWriter, r *http.Request) {
	user, authenticated := auth.Authenticator(w, r)
	if !authenticated {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	posts, err := fetchAllVisiblePostsForUser(user.User_ID)
	if err != nil {
		util.Respond(w, r, http.StatusInternalServerError, nil, err.Error())
		return
	}

	util.Respond(w, r, http.StatusOK, posts, "Fetch posts by user ID successful")
}
