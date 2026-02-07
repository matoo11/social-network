package group

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"social/backend/pkg/auth"
	"social/backend/pkg/db/dbConn"
	"social/backend/pkg/websocket"
)

type groupSummaryResponse struct {
	GroupID      int    `json:"groupId"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	OwnerID      int    `json:"ownerId"`
	MemberCount  int    `json:"memberCount"`
	CreationTime string `json:"createdAt"`
}

type groupInviteResponse struct {
	InviteID     int    `json:"inviteId"`
	GroupID      int    `json:"groupId"`
	GroupTitle   string `json:"groupTitle"`
	InviterID    int    `json:"inviterId"`
	InviteeID    int    `json:"inviteeId"`
	StatusID     int    `json:"statusId"`
	CreationTime string `json:"createdAt"`
}

type groupPostResponse struct {
	GroupPostID        int                    `json:"groupPostId"`
	GroupID            int                    `json:"groupId"`
	PostID             int                    `json:"postId"`
	Title              string                 `json:"title"`
	Text               string                 `json:"text"`
	AuthorID           int                    `json:"authorId"`
	AuthorUsername     string                 `json:"authorUsername"`
	AuthorAvatarNumber int                    `json:"authorAvatarNumber"`
	ImageID            *int                   `json:"imageId"`
	CreationTime       string                 `json:"createdAt"`
	Comments           []groupCommentResponse `json:"comments"`
}

type groupCommentResponse struct {
	CommentID    int    `json:"commentId"`
	GroupPostID  int    `json:"groupPostId"`
	CommentText  string `json:"commentText"`
	AuthorID     int    `json:"authorId"`
	CreationTime string `json:"createdAt"`
}

type eventOptionResponse struct {
	OptionID   int    `json:"optionId"`
	OptionName string `json:"optionName"`
	Count      int    `json:"count"`
}

type groupEventResponse struct {
	EventID      int                   `json:"eventId"`
	GroupID      int                   `json:"groupId"`
	Title        string                `json:"title"`
	Description  string                `json:"description"`
	EventTime    string                `json:"eventTime"`
	CreatorID    int                   `json:"creatorId"`
	Responses    []eventOptionResponse `json:"responses"`
	UserChoiceID *int                  `json:"userChoiceId,omitempty"`
}

func decodeJSON(w http.ResponseWriter, r *http.Request, dst interface{}) bool {
	defer r.Body.Close()
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		http.Error(w, fmt.Sprintf("invalid JSON payload: %v", err), http.StatusBadRequest)
		return false
	}
	return true
}

func getLoggedInUserID(w http.ResponseWriter, r *http.Request) (int, bool) {
	session, err := dbConn.GetSessionFromCookie(r)
	if err != nil {
		auth.ErrorPage(w, http.StatusUnauthorized)
		return 0, false
	}
	return session.UserID, true
}

func CreateGroupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	userID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	var payload struct {
		Title       string `json:"title"`
		Description string `json:"description"`
	}
	if !decodeJSON(w, r, &payload) {
		return
	}

	title := strings.TrimSpace(payload.Title)
	description := strings.TrimSpace(payload.Description)

	if title == "" {
		http.Error(w, "title is required", http.StatusBadRequest)
		return
	}
	if len(title) > 100 {
		http.Error(w, "title must be 100 characters or fewer", http.StatusBadRequest)
		return
	}
	if len(description) > 500 {
		http.Error(w, "description must be 500 characters or fewer", http.StatusBadRequest)
		return
	}

	groupID, err := dbConn.CreateGroup(title, description, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	group, err := dbConn.GetGroupByID(groupID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	members, err := dbConn.GetGroupMembers(groupID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := groupSummaryResponse{
		GroupID:      group.GroupID,
		Title:        group.Title,
		Description:  group.Description,
		OwnerID:      group.OwnerID,
		MemberCount:  len(members),
		CreationTime: group.CreationTime.Format(time.RFC3339),
	}

	if err := auth.JsonEncode(w, response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func GetAllGroupsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	if _, ok := getLoggedInUserID(w, r); !ok {
		return
	}

	groups, err := dbConn.GetAllGroups()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responses := make([]groupSummaryResponse, 0, len(groups))
	for _, g := range groups {
		responses = append(responses, groupSummaryResponse{
			GroupID:      g.GroupID,
			Title:        g.Title,
			Description:  g.Description,
			OwnerID:      g.OwnerID,
			MemberCount:  g.MemberCount,
			CreationTime: g.CreationTime.Format(time.RFC3339),
		})
	}

	if err := auth.JsonEncode(w, responses); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func GetMyGroupsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	userID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	groups, err := dbConn.GetGroupsForUser(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responses := make([]groupSummaryResponse, 0, len(groups))
	for _, g := range groups {
		responses = append(responses, groupSummaryResponse{
			GroupID:      g.GroupID,
			Title:        g.Title,
			Description:  g.Description,
			OwnerID:      g.OwnerID,
			MemberCount:  g.MemberCount,
			CreationTime: g.CreationTime.Format(time.RFC3339),
		})
	}

	if err := auth.JsonEncode(w, responses); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func InviteToGroupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	inviterID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	var payload struct {
		GroupID   int `json:"groupId"`
		InviteeID int `json:"inviteeId"`
	}
	if !decodeJSON(w, r, &payload) {
		return
	}

	if payload.GroupID <= 0 || payload.InviteeID <= 0 {
		http.Error(w, "groupId and inviteeId must be positive integers", http.StatusBadRequest)
		return
	}

	if payload.InviteeID == inviterID {
		http.Error(w, "cannot invite yourself", http.StatusBadRequest)
		return
	}

	inviteID, err := dbConn.CreateGroupInvite(payload.GroupID, inviterID, payload.InviteeID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	notification := dbConn.Notification{
		NotificationText:   "You have been invited to a group!",
		NotificationTypeID: 6,
		SourceID:           inviteID,
		TargetID:           payload.InviteeID,
		CreatedByID:        inviterID,
	}

	nId, err := dbConn.CreateNotification(notification)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println("error creating invite here")
		return
	}

	websocket.SendNotification(int(nId), payload.InviteeID, 6)

	if err := auth.JsonEncode(w, map[string]string{"status": "invite sent"}); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func GetGroupMembersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	userID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	var payload struct {
		GroupID int `json:"groupId"`
	}
	if !decodeJSON(w, r, &payload) {
		return
	}

	if payload.GroupID <= 0 {
		http.Error(w, "groupId must be a positive integer", http.StatusBadRequest)
		return
	}

	isMember, err := dbConn.IsGroupMember(payload.GroupID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !isMember {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	members, err := dbConn.GetGroupMembers(payload.GroupID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	type memberResponse struct {
		UserID   int    `json:"userId"`
		Username string `json:"username"`
	}

	resp := make([]memberResponse, 0, len(members))
	for _, m := range members {
		user, err := dbConn.GetUserByID(m.UserID)
		if err != nil {
			continue
		}
		resp = append(resp, memberResponse{UserID: m.UserID, Username: user.User_Name})
	}

	if err := auth.JsonEncode(w, resp); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func RequestToJoinGroupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	requesterID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	var payload struct {
		GroupID int `json:"groupId"`
	}
	if !decodeJSON(w, r, &payload) {
		return
	}

	if payload.GroupID <= 0 {
		http.Error(w, "groupId must be a positive integer", http.StatusBadRequest)
		return
	}

	requestID, err := dbConn.CreateGroupJoinRequest(payload.GroupID, requesterID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ownerID, err := dbConn.GetGroupOwnerID(payload.GroupID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	notification := dbConn.Notification{
		NotificationText:   "New group join request",
		NotificationTypeID: 10,
		SourceID:           requestID,
		TargetID:           ownerID,
		CreatedByID:        requesterID,
	}

	nId, err := dbConn.CreateNotification(notification)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	websocket.SendNotification(int(nId), ownerID, 10)

	if err := auth.JsonEncode(w, map[string]string{"status": "request sent"}); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

// CheckGroupRequestStatusHandler checks if the logged-in user has requested to join a group
func CheckGroupRequestStatusHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	userID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	var payload struct {
		GroupID int `json:"groupId"`
	}
	if !decodeJSON(w, r, &payload) {
		return
	}

	if payload.GroupID <= 0 {
		http.Error(w, "groupId must be a positive integer", http.StatusBadRequest)
		return
	}

	// Check if user is already a member
	isMember, err := dbConn.IsGroupMember(payload.GroupID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if isMember {
		// Status 2 = joined
		if err := auth.JsonEncode(w, 2); err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
		}
		return
	}

	// Check if user has a pending request
	ownerID, err := dbConn.GetGroupOwnerID(payload.GroupID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	hasPending, err := dbConn.HasPendingGroupInvite(payload.GroupID, userID, ownerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if hasPending {
		// Status 1 = requested
		if err := auth.JsonEncode(w, 1); err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
		}
		return
	}

	// Status 0 = not requested
	if err := auth.JsonEncode(w, 0); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func GetPendingInvitesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	userID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	invites, err := dbConn.GetPendingInvitesForUser(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responses := make([]groupInviteResponse, 0, len(invites))
	for _, invite := range invites {
		responses = append(responses, groupInviteResponse{
			InviteID:     invite.InviteID,
			GroupID:      invite.GroupID,
			GroupTitle:   invite.GroupTitle,
			InviterID:    invite.InviterID,
			InviteeID:    invite.InviteeID,
			StatusID:     invite.StatusID,
			CreationTime: invite.CreationTime.Format(time.RFC3339),
		})
	}

	if err := auth.JsonEncode(w, responses); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func GetPendingRequestsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	ownerID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	requests, err := dbConn.GetPendingRequestsForOwner(ownerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responses := make([]groupInviteResponse, 0, len(requests))
	for _, request := range requests {
		responses = append(responses, groupInviteResponse{
			InviteID:     request.InviteID,
			GroupID:      request.GroupID,
			GroupTitle:   request.GroupTitle,
			InviterID:    request.InviterID,
			InviteeID:    request.InviteeID,
			StatusID:     request.StatusID,
			CreationTime: request.CreationTime.Format(time.RFC3339),
		})
	}

	if err := auth.JsonEncode(w, responses); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func RespondToInviteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	actingUserID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	var payload struct {
		InviteID       int  `json:"inviteId"`
		Accept         bool `json:"accept"`
		NotificationId int  `json:"notificationId"`
	}
	if !decodeJSON(w, r, &payload) {
		return
	}

	if payload.InviteID <= 0 {
		http.Error(w, "inviteId must be a positive integer", http.StatusBadRequest)
		return
	}

	invite, err := dbConn.GetGroupInviteByID(payload.InviteID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if invite.InviteeID != actingUserID {
		http.Error(w, "not authorized to respond to this invite", http.StatusForbidden)
		return
	}

	status := dbConn.StatusRejected
	if payload.Accept {
		status = dbConn.StatusAccepted
	}

	err = dbConn.DeleteNotification(payload.NotificationId, actingUserID)
	fmt.Println(payload.NotificationId)
	if err != nil {
		fmt.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)

		return
	}
	updatedInvite, err := dbConn.UpdateGroupInviteStatus(payload.InviteID, actingUserID, status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	//

	if status == dbConn.StatusAccepted {
		ownerID, err := dbConn.GetGroupOwnerID(invite.GroupID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		memberID := invite.InviteeID
		if actingUserID == ownerID {
			memberID = invite.InviterID
		}
		if err := dbConn.AddUserToGroup(invite.GroupID, memberID, actingUserID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		updatedInvite.StatusID = dbConn.StatusAccepted
	}

	groupInfo, err := dbConn.GetGroupByID(updatedInvite.GroupID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := groupInviteResponse{
		InviteID:     updatedInvite.InviteID,
		GroupID:      updatedInvite.GroupID,
		GroupTitle:   groupInfo.Title,
		InviterID:    updatedInvite.InviterID,
		InviteeID:    updatedInvite.InviteeID,
		StatusID:     updatedInvite.StatusID,
		CreationTime: updatedInvite.CreationTime.Format(time.RFC3339),
	}

	if err := auth.JsonEncode(w, response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func CreateGroupPostHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	authorID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	// Parse multipart form to handle image upload
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	// Decode the JSON string from "data" field
	jsonData := r.FormValue("data")
	if jsonData == "" {
		http.Error(w, "Missing data field", http.StatusBadRequest)
		return
	}

	var payload struct {
		GroupID int    `json:"groupId"`
		Title   string `json:"title"`
		Text    string `json:"text"`
	}
	if err := json.Unmarshal([]byte(jsonData), &payload); err != nil {
		http.Error(w, fmt.Sprintf("invalid JSON data: %v", err), http.StatusBadRequest)
		return
	}

	if payload.GroupID <= 0 {
		http.Error(w, "groupId must be a positive integer", http.StatusBadRequest)
		return
	}

	if isMember, err := dbConn.IsGroupMember(payload.GroupID, authorID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else if !isMember {
		http.Error(w, "membership required", http.StatusForbidden)
		return
	}

	title := strings.TrimSpace(payload.Title)
	text := strings.TrimSpace(payload.Text)

	if title == "" {
		http.Error(w, "title is required", http.StatusBadRequest)
		return
	}
	if len(title) > 30 {
		http.Error(w, "title must be 30 characters or fewer", http.StatusBadRequest)
		return
	}
	if text == "" {
		http.Error(w, "text is required", http.StatusBadRequest)
		return
	}
	if len(text) > 2000 {
		http.Error(w, "text must be 2000 characters or fewer", http.StatusBadRequest)
		return
	}

	// Handle optional image
	var imageID *int = nil
	file, handler, err := r.FormFile("image")
	if err == nil {
		defer file.Close()
		imgID, err := dbConn.SaveImage(file, handler.Filename, authorID)
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

	post, err := dbConn.CreateGroupPost(payload.GroupID, authorID, title, text, imageID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	author, err := dbConn.GetUserByID(authorID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := groupPostResponse{
		GroupPostID:        post.GroupPostID,
		GroupID:            post.GroupID,
		PostID:             post.PostID,
		Title:              post.Title,
		Text:               post.Text,
		AuthorID:           post.AuthorID,
		AuthorAvatarNumber: author.Image_ID,
		ImageID:            post.ImageID,
		CreationTime:       post.CreationTime.Format(time.RFC3339),
		Comments:           []groupCommentResponse{},
	}

	if err := auth.JsonEncode(w, response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func GetGroupPostsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	userID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	groupIDStr := r.URL.Query().Get("groupId")
	if groupIDStr == "" {
		http.Error(w, "groupId query parameter is required", http.StatusBadRequest)
		return
	}
	groupID, err := strconv.Atoi(groupIDStr)
	if err != nil || groupID <= 0 {
		http.Error(w, "groupId 999 must be a positive integer", http.StatusBadRequest)
		return
	}

	if isMember, err := dbConn.IsGroupMember(groupID, userID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else if !isMember {
		http.Error(w, "membership required", http.StatusForbidden)
		return
	}

	posts, err := dbConn.GetGroupPosts(groupID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responses := make([]groupPostResponse, 0, len(posts))
	for _, post := range posts {
		user, err := dbConn.GetUserByID(post.AuthorID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		postResp := groupPostResponse{
			GroupPostID:        post.GroupPostID,
			GroupID:            post.GroupID,
			PostID:             post.PostID,
			Title:              post.Title,
			Text:               post.Text,
			AuthorID:           post.AuthorID,
			AuthorUsername:     user.User_Name,
			AuthorAvatarNumber: user.Image_ID,
			ImageID:            post.ImageID,
			CreationTime:       post.CreationTime.Format(time.RFC3339),
		}
		for _, comment := range post.Comments {
			postResp.Comments = append(postResp.Comments, groupCommentResponse{
				CommentID:    comment.CommentID,
				GroupPostID:  comment.GroupPostID,
				CommentText:  comment.CommentText,
				AuthorID:     comment.AuthorID,
				CreationTime: comment.CreationTime.Format(time.RFC3339),
			})
		}
		responses = append(responses, postResp)
	}

	if err := auth.JsonEncode(w, responses); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func CreateGroupCommentHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	authorID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	var payload struct {
		GroupPostID int    `json:"groupPostId"`
		Text        string `json:"text"`
	}
	if !decodeJSON(w, r, &payload) {
		return
	}

	if payload.GroupPostID <= 0 {
		http.Error(w, "groupPostId must be a positive integer", http.StatusBadRequest)
		return
	}

	groupID, err := dbConn.GetGroupIDForGroupPost(payload.GroupPostID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if isMember, err := dbConn.IsGroupMember(groupID, authorID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else if !isMember {
		http.Error(w, "membership required", http.StatusForbidden)
		return
	}

	text := strings.TrimSpace(payload.Text)
	if text == "" {
		http.Error(w, "text is required", http.StatusBadRequest)
		return
	}
	if len(text) > 1000 {
		http.Error(w, "text must be 1000 characters or fewer", http.StatusBadRequest)
		return
	}

	comment, err := dbConn.CreateGroupComment(payload.GroupPostID, authorID, text)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := groupCommentResponse{
		CommentID:    comment.CommentID,
		GroupPostID:  comment.GroupPostID,
		CommentText:  comment.CommentText,
		AuthorID:     comment.AuthorID,
		CreationTime: comment.CreationTime.Format(time.RFC3339),
	}

	if err := auth.JsonEncode(w, response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func GetGroupCommentsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	userID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	groupPostIDStr := r.URL.Query().Get("groupPostId")
	if groupPostIDStr == "" {
		http.Error(w, "groupPostId query parameter is required", http.StatusBadRequest)
		return
	}
	groupPostID, err := strconv.Atoi(groupPostIDStr)
	if err != nil || groupPostID <= 0 {
		http.Error(w, "groupPostId must be a positive integer", http.StatusBadRequest)
		return
	}

	groupID, err := dbConn.GetGroupIDForGroupPost(groupPostID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if isMember, err := dbConn.IsGroupMember(groupID, userID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else if !isMember {
		http.Error(w, "membership required", http.StatusForbidden)
		return
	}

	comments, err := dbConn.GetGroupComments(groupPostID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responses := make([]groupCommentResponse, 0, len(comments))
	for _, comment := range comments {
		responses = append(responses, groupCommentResponse{
			CommentID:    comment.CommentID,
			GroupPostID:  comment.GroupPostID,
			CommentText:  comment.CommentText,
			AuthorID:     comment.AuthorID,
			CreationTime: comment.CreationTime.Format(time.RFC3339),
		})
	}

	if err := auth.JsonEncode(w, responses); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func CreateGroupEventHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	creatorID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	var payload struct {
		GroupID     int    `json:"groupId"`
		Title       string `json:"title"`
		Description string `json:"description"`
		EventTime   string `json:"eventTime"`
	}
	if !decodeJSON(w, r, &payload) {
		return
	}

	if payload.GroupID <= 0 {
		http.Error(w, "groupId must be a positive integer", http.StatusBadRequest)
		return
	}

	if isMember, err := dbConn.IsGroupMember(payload.GroupID, creatorID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else if !isMember {
		http.Error(w, "membership required", http.StatusForbidden)
		return
	}

	title := strings.TrimSpace(payload.Title)
	description := strings.TrimSpace(payload.Description)

	if title == "" {
		http.Error(w, "title is required", http.StatusBadRequest)
		return
	}
	if len(title) > 100 {
		http.Error(w, "title must be 100 characters or fewer", http.StatusBadRequest)
		return
	}
	if len(description) > 500 {
		http.Error(w, "description must be 500 characters or fewer", http.StatusBadRequest)
		return
	}

	eventTime, err := time.Parse(time.RFC3339, payload.EventTime)
	if err != nil {
		http.Error(w, "eventTime must follow RFC3339 format", http.StatusBadRequest)
		return
	}

	event, err := dbConn.CreateGroupEvent(payload.GroupID, creatorID, title, description, eventTime)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	groupMembers, err := dbConn.GetGroupMembers(payload.GroupID)
	if err == nil {
		for _, member := range groupMembers {
			if member.UserID != creatorID {
				notification := dbConn.Notification{
					NotificationText:   "New event created in " + title,
					SourceID:           event.EventID,
					TargetID:           member.UserID,
					NotificationTypeID: 11,
					CreatedByID:        creatorID,
				}
				notifID, err := dbConn.CreateNotification(notification)
				if err == nil {
					websocket.SendNotification(int(notifID), member.UserID, 11)
				}
			}
		}
	}

	counts, err := dbConn.GetEventResponseCounts(event.EventID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responses := make([]eventOptionResponse, 0, len(counts))
	for _, count := range counts {
		responses = append(responses, eventOptionResponse{
			OptionID:   count.OptionID,
			OptionName: count.OptionName,
			Count:      count.Count,
		})
	}

	resp := groupEventResponse{
		EventID:      event.EventID,
		GroupID:      event.GroupID,
		Title:        event.Title,
		Description:  event.Description,
		EventTime:    event.EventTime.Format(time.RFC3339),
		CreatorID:    event.CreatorID,
		Responses:    responses,
		UserChoiceID: nil,
	}

	if err := auth.JsonEncode(w, resp); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func GetGroupEventsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	userID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	groupIDStr := r.URL.Query().Get("groupId")
	if groupIDStr == "" {
		http.Error(w, "groupId query parameter is required", http.StatusBadRequest)
		return
	}
	groupID, err := strconv.Atoi(groupIDStr)
	if err != nil || groupID <= 0 {
		http.Error(w, "groupId must be a positive integer", http.StatusBadRequest)
		return
	}

	if isMember, err := dbConn.IsGroupMember(groupID, userID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else if !isMember {
		http.Error(w, "membership required", http.StatusForbidden)
		return
	}

	events, err := dbConn.GetGroupEvents(groupID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responses := make([]groupEventResponse, 0, len(events))
	for _, event := range events {
		counts := make([]eventOptionResponse, 0, len(event.Responses))
		for _, count := range event.Responses {
			counts = append(counts, eventOptionResponse{
				OptionID:   count.OptionID,
				OptionName: count.OptionName,
				Count:      count.Count,
			})
		}
		userChoice, err := dbConn.GetUserEventResponse(event.EventID, userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		resp := groupEventResponse{
			EventID:      event.EventID,
			GroupID:      event.GroupID,
			Title:        event.Title,
			Description:  event.Description,
			EventTime:    event.EventTime.Format(time.RFC3339),
			CreatorID:    event.CreatorID,
			Responses:    counts,
			UserChoiceID: userChoice,
		}
		responses = append(responses, resp)
	}

	if err := auth.JsonEncode(w, responses); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func RespondToEventHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.ErrorPage(w, http.StatusMethodNotAllowed)
		return
	}

	userID, ok := getLoggedInUserID(w, r)
	if !ok {
		return
	}

	var payload struct {
		EventID  int `json:"eventId"`
		OptionID int `json:"optionId"`
	}
	if !decodeJSON(w, r, &payload) {
		return
	}

	if payload.EventID <= 0 || payload.OptionID <= 0 {
		http.Error(w, "eventId and optionId must be positive integers", http.StatusBadRequest)
		return
	}

	groupID, err := dbConn.GetGroupIDForEvent(payload.EventID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if isMember, err := dbConn.IsGroupMember(groupID, userID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else if !isMember {
		http.Error(w, "membership required", http.StatusForbidden)
		return
	}

	optionName, err := dbConn.GetEventOptionByID(payload.OptionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if optionName != "Going" && optionName != "Not Going" {
		http.Error(w, "unsupported event option", http.StatusBadRequest)
		return
	}

	if err := dbConn.SetEventResponse(payload.EventID, userID, payload.OptionID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get user info for WebSocket notification
	user, err := dbConn.GetUserByID(userID)
	if err == nil {
		// Send real-time update to all group members via WebSocket
		websocket.SendEventResponse(payload.EventID, groupID, userID, payload.OptionID, user.User_Name, optionName)
	}

	if err := auth.JsonEncode(w, map[string]string{"status": "response recorded"}); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}
