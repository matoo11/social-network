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
	GroupPostID  int                    `json:"groupPostId"`
	GroupID      int                    `json:"groupId"`
	PostID       int                    `json:"postId"`
	Title        string                 `json:"title"`
	Text         string                 `json:"text"`
	AuthorID     int                    `json:"authorId"`
	CreationTime string                 `json:"createdAt"`
	Comments     []groupCommentResponse `json:"comments"`
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

	_, err := dbConn.CreateGroupInvite(payload.GroupID, inviterID, payload.InviteeID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := auth.JsonEncode(w, map[string]string{"status": "invite sent"}); err != nil {
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

	_, err := dbConn.CreateGroupJoinRequest(payload.GroupID, requesterID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := auth.JsonEncode(w, map[string]string{"status": "request sent"}); err != nil {
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
		InviteID int  `json:"inviteId"`
		Accept   bool `json:"accept"`
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

	updatedInvite, err := dbConn.UpdateGroupInviteStatus(payload.InviteID, actingUserID, status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

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

	var payload struct {
		GroupID int    `json:"groupId"`
		Title   string `json:"title"`
		Text    string `json:"text"`
	}
	if !decodeJSON(w, r, &payload) {
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

	post, err := dbConn.CreateGroupPost(payload.GroupID, authorID, title, text)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := groupPostResponse{
		GroupPostID:  post.GroupPostID,
		GroupID:      post.GroupID,
		PostID:       post.PostID,
		Title:        post.Title,
		Text:         post.Text,
		AuthorID:     post.AuthorID,
		CreationTime: post.CreationTime.Format(time.RFC3339),
		Comments:     []groupCommentResponse{},
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

	posts, err := dbConn.GetGroupPosts(groupID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responses := make([]groupPostResponse, 0, len(posts))
	for _, post := range posts {
		postResp := groupPostResponse{
			GroupPostID:  post.GroupPostID,
			GroupID:      post.GroupID,
			PostID:       post.PostID,
			Title:        post.Title,
			Text:         post.Text,
			AuthorID:     post.AuthorID,
			CreationTime: post.CreationTime.Format(time.RFC3339),
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

	if err := auth.JsonEncode(w, map[string]string{"status": "response recorded"}); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}
