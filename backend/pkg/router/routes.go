package router

import (
	"html/template"
	"net/http"
	"social/backend/pkg/auth"
	"social/backend/pkg/comment"
	"social/backend/pkg/follow"
	"social/backend/pkg/group"
	"social/backend/pkg/message"
	"social/backend/pkg/notification"
	"social/backend/pkg/post"
	"social/backend/pkg/profile"
	"social/backend/pkg/websocket"
)

func Router(w http.ResponseWriter, r *http.Request) {
	// Define your main handler logic here
	switch r.URL.Path {
	case "/":
		RenderTemplate(w, "frontend/index.html", nil)
	// websocket route
	case "/api/ws":
		websocket.WebsocketHandler(w, r)
	// auth routes
	case "/api/signin":
		auth.LoginHandler(w, r)
	case "/api/signout":
		auth.SignoutHandler(w, r)
	case "/api/signup":
		auth.SignupHandler(w, r)
	case "/api/getUserData":
		auth.GetUserDataHandler(w, r)
	// post routes
	case "/api/createPost":
		post.CreatePostHandler(w, r)
	case "/api/getPost":
		post.GetPostByIDHandler(w, r)
	case "/api/getPostByID":
		post.FetchPostByIDHandler(w, r)
	case "/api/fetchPostsByUserID":
		post.FetchPosts(w, r)
	case "/api/getPublicPosts":
		post.GetPublicPosts(w, r)
	case "/api/getPrivatePosts":
		post.GetPrivatePosts(w, r)
	case "/api/grantAccessToPost":
		post.GrantAccessToPost(w, r)
	case "/api/image":
		post.GetImageHandler(w, r)
	case "/api/createComment":
		comment.CreateCommentHandler(w, r)
	// follow routes
	case "/api/addFollow":
		follow.AddFollow(w, r)
	case "/api/unFollow":
		follow.UnFollow(w, r)
	case "/api/checkFollowStatus":
		follow.FollowStatus(w, r)
	case "/api/getFollowers":
		follow.GetFollowers(w, r)
	case "/api/follow/acceptRequest":
		follow.AcceptFollowRequest(w, r)
	case "/api/follow/rejectRequest":
		follow.RejectFollowRequest(w, r)
	case "/api/follow/cancelRequest":
		follow.CancelFollowRequest(w, r)
	// profile routes
	case "/api/profile/get":
		profile.GetProfileHandler(w, r)
	case "/api/profile/toggle":
		profile.ToggleProfileVisibilityHandler(w, r)
	// group routes
	case "/api/groups/create":
		group.CreateGroupHandler(w, r)
	case "/api/groups/all":
		group.GetAllGroupsHandler(w, r)
	case "/api/groups/mine":
		group.GetMyGroupsHandler(w, r)
	case "/api/groups/invite":
		group.InviteToGroupHandler(w, r)
	case "/api/groups/invite/pending":
		group.GetPendingInvitesHandler(w, r)
	case "/api/groups/invite/respond":
		group.RespondToInviteHandler(w, r)
	case "/api/groups/request":
		group.RequestToJoinGroupHandler(w, r)
	case "/api/groups/request/status":
		group.CheckGroupRequestStatusHandler(w, r)
	case "/api/groups/request/pending":
		group.GetPendingRequestsHandler(w, r)
	// group posts routes
	case "/api/groups/posts/create":
		group.CreateGroupPostHandler(w, r)
	case "/api/groups/posts":
		group.GetGroupPostsHandler(w, r)
	case "/api/groups/comments/create":
		group.CreateGroupCommentHandler(w, r)
	case "/api/groups/comments":
		group.GetGroupCommentsHandler(w, r)
	case "/api/groups/events/create":
		group.CreateGroupEventHandler(w, r)
	case "/api/groups/events":
		group.GetGroupEventsHandler(w, r)
	case "/api/groups/events/respond":
		group.RespondToEventHandler(w, r)
	case "/api/groups/members":
		group.GetGroupMembersHandler(w, r)
	case "/api/groups/pendingInvites":
		group.GetGroupPendingInvitesHandler(w, r)
	case "/api/message/getPrivateMessages":
		message.GetPrivateMessages(w, r)
	case "/api/message/getGroupMessages":
		message.GetGroupMessages(w, r)
	case "/api/chat/getChatList":
		message.GetChatList(w, r)
	case "/api/notifications/get":
		notification.GetNotifications(w, r)
	case "/api/notifications/dismiss":
		notification.DismissNotification(w, r)
	default:
		http.NotFound(w, r)
	}
}

func RenderTemplate(w http.ResponseWriter, path string, data interface{}) {
	tmpl, err := template.ParseFiles(path)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	if err := tmpl.Execute(w, data); err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}
