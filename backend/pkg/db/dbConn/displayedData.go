package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"
)

type Data struct {
	Nickname       string
	DisplayedPosts []DisplayedPost
}

type DisplayedPost struct {
	PostID           int
	PosterNickname   string
	PostTime         time.Time
	PostTitle        string
	PostText         string
	NumberOfLikes    int
	NumberOfDislikes int
	NumberOfComments int
	Comments         []DisplayedComment
}

type DisplayedComment struct {
	CommentID         int
	PostID            int
	CommenterNickname string
	CommentTime       time.Time
	CommentText       string
	NumberOfLikes     int
	NumberOfDislikes  int
}

type DisplayedMessage struct {
	MessageID   int       `json:"messageID"`
	MessageText string    `json:"messageText"`
	From        string    `json:"from"`
	To          string    `json:"to"`
	MessageTime time.Time `json:"messageTime"`
	IsRead      bool      `json:"isRead"`
}

func RetrieveAllDataForDisplay() ([]DisplayedPost, error) {
	var displayedPosts []DisplayedPost
	data, err := dbHandler.DB.Query(`SELECT * FROM Posts WHERE Is_Active = 1 ORDER BY Creation_Time DESC`)
	if err != nil {
		return nil, err
	}
	defer data.Close()

	for data.Next() {
		var post Post
		err := data.Scan(
			&post.PostID,
			&post.PostTitle,
			&post.PostText,
			&post.PostTypeID,
			&post.UserID,
			&post.ImageID,
			&post.CreatedByID,
			&post.CreationTime,
			&post.LastUpdatedByID,
			&post.LastUpdatedTime,
			&post.IsActive)
		if err != nil {
			return nil, err
		}
		poster, err := GetUserByID(post.UserID)
		if err != nil {
			return nil, err
		}
		var newDisplayedPost DisplayedPost
		newDisplayedPost.PosterNickname = poster.Nick_Name
		newDisplayedPost.PostID = post.PostID
		newDisplayedPost.PostTime = post.CreationTime
		newDisplayedPost.PostTitle = post.PostTitle
		newDisplayedPost.PostText = post.PostText

		numberOfLikes, err := PostLikesCount(post.PostID)
		if err != nil {
			return nil, err
		}
		newDisplayedPost.NumberOfLikes = numberOfLikes

		numberOfDislikes, err := PostDislikesCount(post.PostID)
		if err != nil {
			return nil, err
		}
		newDisplayedPost.NumberOfDislikes = numberOfDislikes

		numberOfComments, err := PostCommentsCount(post.PostID)
		if err != nil {
			return nil, err
		}
		newDisplayedPost.NumberOfComments = numberOfComments

		comments, err := GetCommentsByPostID(post.PostID)
		if err != nil {
			return nil, err
		}
		var displayCommnets []DisplayedComment
		for _, comment := range comments {
			commenter, err := GetUserByID(comment.CreatedByID)
			if err != nil {
				return nil, err
			}
			var newDisplayedComment DisplayedComment
			newDisplayedComment.CommentID = comment.CommentID
			newDisplayedComment.PostID = comment.PostID
			newDisplayedComment.CommenterNickname = commenter.Nick_Name
			newDisplayedComment.CommentText = comment.CommentText
			newDisplayedComment.CommentTime = comment.CreationTime

			numberOfLikes, err := CommentLikesCount(post.PostID, comment.CommentID)
			if err != nil {
				return nil, err
			}
			newDisplayedComment.NumberOfLikes = numberOfLikes

			numberOfDislikes, err := CommentDislikesCount(post.PostID, comment.CommentID)
			if err != nil {
				return nil, err
			}
			newDisplayedComment.NumberOfDislikes = numberOfDislikes

			displayCommnets = append(displayCommnets, newDisplayedComment)
		}

		newDisplayedPost.Comments = displayCommnets
		displayedPosts = append(displayedPosts, newDisplayedPost)
	}
	if err := data.Err(); err != nil {
		return nil, err
	}

	return displayedPosts, nil
}

func RetrieveAllDataForDisplayByCategory(category string) ([]DisplayedPost, error) {
	var displayedPosts []DisplayedPost
	categoryID, err := GetCategoryIDFromCategoryText(category)
	if err != nil {
		return nil, err
	}
	statement := `SELECT Posts.*
					FROM Posts
					JOIN Post_Categories ON Post_Categories.Post_ID = Posts.Post_ID
					WHERE Post_Categories.Category_ID = ?
					AND Posts.Is_Active = 1
					AND Post_Categories.Is_Active = 1
					ORDER BY Posts.Creation_Time DESC;`
	data, err := dbHandler.DB.Query(statement, categoryID)
	if err != nil {
		return nil, err
	}
	defer data.Close()

	for data.Next() {
		var post Post
		err := data.Scan(
			&post.PostID,
			&post.PostText,
			&post.UserID,
			&post.CreatedByID,
			&post.CreationTime,
			&post.LastUpdatedByID,
			&post.LastUpdatedTime,
			&post.IsActive)
		if err != nil {
			return nil, err
		}
		poster, err := GetUserByID(post.UserID)
		if err != nil {
			return nil, err
		}
		var newDisplayedPost DisplayedPost
		newDisplayedPost.PosterNickname = poster.Nick_Name
		newDisplayedPost.PostID = post.PostID
		newDisplayedPost.PostTime = post.CreationTime
		newDisplayedPost.PostText = post.PostText

		numberOfLikes, err := PostLikesCount(post.PostID)
		if err != nil {
			return nil, err
		}
		newDisplayedPost.NumberOfLikes = numberOfLikes

		numberOfDislikes, err := PostDislikesCount(post.PostID)
		if err != nil {
			return nil, err
		}
		newDisplayedPost.NumberOfDislikes = numberOfDislikes
		comments, err := GetCommentsByPostID(post.PostID)
		if err != nil {
			return nil, err
		}
		var displayCommnets []DisplayedComment
		for _, comment := range comments {
			commenter, err := GetUserByID(comment.CreatedByID)
			if err != nil {
				return nil, err
			}
			var newDisplayedComment DisplayedComment
			newDisplayedComment.CommentID = comment.CommentID
			newDisplayedComment.PostID = comment.PostID
			newDisplayedComment.CommenterNickname = commenter.Nick_Name
			newDisplayedComment.CommentText = comment.CommentText
			newDisplayedComment.CommentTime = comment.CreationTime

			numberOfLikes, err := CommentLikesCount(post.PostID, comment.CommentID)
			if err != nil {
				return nil, err
			}
			newDisplayedComment.NumberOfLikes = numberOfLikes

			numberOfDislikes, err := CommentDislikesCount(post.PostID, comment.CommentID)
			if err != nil {
				return nil, err
			}
			newDisplayedComment.NumberOfDislikes = numberOfDislikes

			displayCommnets = append(displayCommnets, newDisplayedComment)
		}

		newDisplayedPost.Comments = displayCommnets
		displayedPosts = append(displayedPosts, newDisplayedPost)
	}
	if err := data.Err(); err != nil {
		return nil, err
	}

	return displayedPosts, nil
}

func RetrieveAllDataForDisplayByUserID(userID int) ([]DisplayedPost, error) {
	var displayedPosts []DisplayedPost
	statement := `SELECT *
					FROM Posts
					WHERE Is_Active = 1
					AND User_ID = ?
					ORDER BY Posts.Creation_Time DESC;`
	data, err := dbHandler.DB.Query(statement, userID)
	if err != nil {
		return nil, err
	}
	defer data.Close()

	for data.Next() {
		var post Post
		err := data.Scan(
			&post.PostID,
			&post.PostText,
			&post.UserID,
			&post.CreatedByID,
			&post.CreationTime,
			&post.LastUpdatedByID,
			&post.LastUpdatedTime,
			&post.IsActive)
		if err != nil {
			return nil, err
		}
		poster, err := GetUserByID(post.UserID)
		if err != nil {
			return nil, err
		}
		var newDisplayedPost DisplayedPost
		newDisplayedPost.PosterNickname = poster.Nick_Name
		newDisplayedPost.PostID = post.PostID
		newDisplayedPost.PostTime = post.CreationTime
		newDisplayedPost.PostText = post.PostText

		numberOfLikes, err := PostLikesCount(post.PostID)
		if err != nil {
			return nil, err
		}
		newDisplayedPost.NumberOfLikes = numberOfLikes

		numberOfDislikes, err := PostDislikesCount(post.PostID)
		if err != nil {
			return nil, err
		}
		newDisplayedPost.NumberOfDislikes = numberOfDislikes
		comments, err := GetCommentsByPostID(post.PostID)
		if err != nil {
			return nil, err
		}
		var displayCommnets []DisplayedComment
		for _, comment := range comments {
			commenter, err := GetUserByID(comment.CreatedByID)
			if err != nil {
				return nil, err
			}
			var newDisplayedComment DisplayedComment
			newDisplayedComment.CommentID = comment.CommentID
			newDisplayedComment.PostID = comment.PostID
			newDisplayedComment.CommenterNickname = commenter.Nick_Name
			newDisplayedComment.CommentText = comment.CommentText
			newDisplayedComment.CommentTime = comment.CreationTime

			numberOfLikes, err := CommentLikesCount(post.PostID, comment.CommentID)
			if err != nil {
				return nil, err
			}
			newDisplayedComment.NumberOfLikes = numberOfLikes

			numberOfDislikes, err := CommentDislikesCount(post.PostID, comment.CommentID)
			if err != nil {
				return nil, err
			}
			newDisplayedComment.NumberOfDislikes = numberOfDislikes

			displayCommnets = append(displayCommnets, newDisplayedComment)
		}

		newDisplayedPost.Comments = displayCommnets
		displayedPosts = append(displayedPosts, newDisplayedPost)
	}
	if err := data.Err(); err != nil {
		return nil, err
	}

	return displayedPosts, nil
}

func RetrieveAllDataForDisplayByLikedPost(userID int) ([]DisplayedPost, error) {
	var displayedPosts []DisplayedPost
	statement := `SELECT Posts.*
					FROM Posts
					JOIN Post_Likes ON Post_Likes.Post_ID = Posts.Post_ID
					WHERE Post_Likes.User_ID = ?
					AND Posts.Is_Active = 1
					AND Post_Likes.Post_Like = 1
					ORDER BY Posts.Creation_Time DESC;`
	data, err := dbHandler.DB.Query(statement, userID)
	if err != nil {
		return nil, err
	}
	defer data.Close()

	for data.Next() {
		var post Post
		err := data.Scan(
			&post.PostID,
			&post.PostText,
			&post.UserID,
			&post.CreatedByID,
			&post.CreationTime,
			&post.LastUpdatedByID,
			&post.LastUpdatedTime,
			&post.IsActive)
		if err != nil {
			return nil, err
		}
		poster, err := GetUserByID(post.UserID)
		if err != nil {
			return nil, err
		}
		var newDisplayedPost DisplayedPost
		newDisplayedPost.PosterNickname = poster.Nick_Name
		newDisplayedPost.PostID = post.PostID
		newDisplayedPost.PostTime = post.CreationTime
		newDisplayedPost.PostText = post.PostText

		numberOfLikes, err := PostLikesCount(post.PostID)
		if err != nil {
			return nil, err
		}
		newDisplayedPost.NumberOfLikes = numberOfLikes

		numberOfDislikes, err := PostDislikesCount(post.PostID)
		if err != nil {
			return nil, err
		}
		newDisplayedPost.NumberOfDislikes = numberOfDislikes
		comments, err := GetCommentsByPostID(post.PostID)
		if err != nil {
			return nil, err
		}
		var displayCommnets []DisplayedComment
		for _, comment := range comments {
			commenter, err := GetUserByID(comment.CreatedByID)
			if err != nil {
				return nil, err
			}
			var newDisplayedComment DisplayedComment
			newDisplayedComment.CommentID = comment.CommentID
			newDisplayedComment.PostID = comment.PostID
			newDisplayedComment.CommenterNickname = commenter.Nick_Name
			newDisplayedComment.CommentText = comment.CommentText
			newDisplayedComment.CommentTime = comment.CreationTime

			numberOfLikes, err := CommentLikesCount(post.PostID, comment.CommentID)
			if err != nil {
				return nil, err
			}
			newDisplayedComment.NumberOfLikes = numberOfLikes

			numberOfDislikes, err := CommentDislikesCount(post.PostID, comment.CommentID)
			if err != nil {
				return nil, err
			}
			newDisplayedComment.NumberOfDislikes = numberOfDislikes

			displayCommnets = append(displayCommnets, newDisplayedComment)
		}

		newDisplayedPost.Comments = displayCommnets
		displayedPosts = append(displayedPosts, newDisplayedPost)
	}
	if err := data.Err(); err != nil {
		return nil, err
	}

	return displayedPosts, nil
}

func GetCategoriesByPostID(postID int) ([]string, error) {
	var categories []string
	statement := `SELECT Category_ID FROM Post_Categories WHERE Is_Active = 1 AND Post_ID = ?`
	data, err := dbHandler.DB.Query(statement, postID)
	if err != nil {
		return nil, err
	}
	defer data.Close()
	for data.Next() {
		var categoryID int
		err := data.Scan(
			&categoryID)
		if err != nil {
			return nil, err
		}
		categoryText, err := GetCategoryTextFromCategoryID(categoryID)
		if err != nil {
			return nil, err
		}
		categories = append(categories, categoryText)
	}
	return categories, nil
}

func GetCategoryTextFromCategoryID(categoryID int) (string, error) {
	statement := `SELECT Category_Text FROM Categories WHERE Category_ID = ?`

	var categoryText string
	err := dbHandler.DB.QueryRow(statement, categoryID).Scan(&categoryText)

	if err == sql.ErrNoRows {
		return "", fmt.Errorf("no category found with id: %v", categoryID)
	}
	if err != nil {
		return "0", err
	}
	return categoryText, nil
}

func PostLikesCount(postID int) (int, error) {
	var postLikesCount int
	statement := `SELECT COUNT(*) FROM Post_Likes WHERE Post_ID = ? AND Post_Like = 1 AND Is_Active = 1`
	err := dbHandler.DB.QueryRow(statement, postID).Scan(&postLikesCount)
	if err != nil {
		return 0, err
	}
	return postLikesCount, nil
}

func PostDislikesCount(postID int) (int, error) {
	var postDislikesCount int
	statement := `SELECT COUNT(*) FROM Post_Likes WHERE Post_ID = ? AND Post_Like = 0 AND Is_Active = 1`
	err := dbHandler.DB.QueryRow(statement, postID).Scan(&postDislikesCount)
	if err != nil {
		return 0, err
	}
	return postDislikesCount, nil
}

func CommentLikesCount(postID, commentID int) (int, error) {
	var commentLikesCount int
	statement := `SELECT COUNT(*) FROM Comment_Likes WHERE Post_ID = ? AND Comment_ID = ? AND Comment_Like = 1 AND Is_Active = 1`
	err := dbHandler.DB.QueryRow(statement, postID, commentID).Scan(&commentLikesCount)
	if err != nil {
		return 0, err
	}
	return commentLikesCount, nil
}

func CommentDislikesCount(postID, commentID int) (int, error) {
	var commentDislikesCount int
	statement := `SELECT COUNT(*) FROM Comment_Likes WHERE Post_ID = ? AND Comment_ID = ? AND Comment_Like = 0 AND Is_Active = 1`
	err := dbHandler.DB.QueryRow(statement, postID, commentID).Scan(&commentDislikesCount)
	if err != nil {
		return 0, err
	}
	return commentDislikesCount, nil
}

func PostCommentsCount(postID int) (int, error) {
	var postCommentsCount int
	statement := `SELECT COUNT(*) FROM Comments WHERE Post_ID = ? AND Is_Active = 1`
	err := dbHandler.DB.QueryRow(statement, postID).Scan(&postCommentsCount)
	if err != nil {
		return 0, err
	}
	return postCommentsCount, nil
}

func RetrieveSinglePostByIDForDisplay(postID int) (DisplayedPost, error) {
	var post Post

	// Fetch the raw post data
	err := dbHandler.DB.QueryRow(
		`SELECT * FROM Posts WHERE Post_ID = ? AND Is_Active = 1`,
		postID,
	).Scan(
		&post.PostID,
		&post.PostTitle,
		&post.PostText,
		&post.UserID,
		&post.CreatedByID,
		&post.CreationTime,
		&post.LastUpdatedByID,
		&post.LastUpdatedTime,
		&post.IsActive,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return DisplayedPost{}, fmt.Errorf("post not found")
		}
		return DisplayedPost{}, err
	}

	// Get poster's nickname
	poster, err := GetUserByID(post.UserID)
	if err != nil {
		return DisplayedPost{}, err
	}

	// Get like/dislike/comment counts
	numberOfLikes, err := PostLikesCount(post.PostID)
	if err != nil {
		return DisplayedPost{}, err
	}

	numberOfDislikes, err := PostDislikesCount(post.PostID)
	if err != nil {
		return DisplayedPost{}, err
	}

	numberOfComments, err := PostCommentsCount(post.PostID)
	if err != nil {
		return DisplayedPost{}, err
	}

	// Fetch comments
	comments, err := GetCommentsByPostID(post.PostID)
	if err != nil {
		return DisplayedPost{}, err
	}

	var displayedComments []DisplayedComment
	for _, comment := range comments {
		commenter, err := GetUserByID(comment.CreatedByID)
		if err != nil {
			return DisplayedPost{}, err
		}

		numberOfLikes, err := CommentLikesCount(post.PostID, comment.CommentID)
		if err != nil {
			return DisplayedPost{}, err
		}

		numberOfDislikes, err := CommentDislikesCount(post.PostID, comment.CommentID)
		if err != nil {
			return DisplayedPost{}, err
		}

		displayedComments = append(displayedComments, DisplayedComment{
			CommentID:         comment.CommentID,
			PostID:            comment.PostID,
			CommenterNickname: commenter.Nick_Name,
			CommentText:       comment.CommentText,
			CommentTime:       comment.CreationTime,
			NumberOfLikes:     numberOfLikes,
			NumberOfDislikes:  numberOfDislikes,
		})
	}

	// Construct the final DisplayedPost
	displayedPost := DisplayedPost{
		PostID:           post.PostID,
		PosterNickname:   poster.Nick_Name,
		PostTime:         post.CreationTime,
		PostTitle:        post.PostTitle,
		PostText:         post.PostText,
		NumberOfLikes:    numberOfLikes,
		NumberOfDislikes: numberOfDislikes,
		NumberOfComments: numberOfComments,
		Comments:         displayedComments,
	}

	return displayedPost, nil
}

func RetrieveChatListForDisplay(currentUser string) ([]string, error) {
	var chatList []string

	rows, err := dbHandler.DB.Query(`SELECT Nick_Name FROM Users WHERE Is_Active = 1 ORDER BY Creation_Time DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var username string
		if err := rows.Scan(&username); err != nil {
			return nil, err
		}
		if username != currentUser {
			chatList = append(chatList, username)
		}
	}

	return chatList, nil
}

func RetrieveMessageForDisplayByID(messageID int) (DisplayedMessage, error) {
	message, err := GetMessageByID(messageID)
	if err != nil {
		return DisplayedMessage{}, err
	}

	sender, err := GetUserByID(message.SenderID)
	if err != nil {
		return DisplayedMessage{}, err
	}

	receiver, err := GetUserByID(message.ReceiverID)
	if err != nil {
		return DisplayedMessage{}, err
	}

	displayedMessage := DisplayedMessage{
		MessageID:   message.MessageID,
		MessageText: message.MessageText,
		From:        sender.Nick_Name,
		To:          receiver.Nick_Name,
		MessageTime: message.CreationTime,
		IsRead:      message.IsRead,
	}

	return displayedMessage, nil
}

func RetieveMessagesMapForDisplayByUserID(userID int) (map[string][]DisplayedMessage, error) {
	messagesMap, err := GetChatMessagesByUser(userID)
	if err != nil {
		// log.Errorf("Error writing JSON for the payLoad in ChatHandler")
	}
	displayedMessagesMap := make(map[string][]DisplayedMessage)

	for key, messageList := range messagesMap {
		for _, message := range messageList {
			displayedMessage, err := RetrieveMessageForDisplayByID(message.MessageID)
			if err != nil {
				return map[string][]DisplayedMessage{}, err
			}
			displayedMessagesMap[key] = append(displayedMessagesMap[key], displayedMessage)
		}
	}

	return displayedMessagesMap, nil
}



// helper functions

func GetChatMessagesByUser(userID int) (map[string][]Message, error) {
	statement := "SELECT * FROM Messages WHERE Sender_ID = ? OR Receiver_ID = ? AND Is_Active = 1 ORDER BY Message_ID ASC"
	data, err := dbHandler.DB.Query(statement, userID, userID)
	if err != nil {
		return nil, err
	}
	defer data.Close()
	messagesMap := make(map[string][]Message)
	for data.Next() {
		var message Message
		err := data.Scan(
			&message.MessageID,
			&message.MessageText,
			&message.SenderID,
			&message.ReceiverID,
			&message.IsRead,
			&message.CreatedByID,
			&message.CreationTime,
			&message.IsActive,
		)
		if err != nil {
			return nil, err
		}
		var mapKeyInt int
		if message.ReceiverID == userID {
			mapKeyInt = message.SenderID
		} else {
			mapKeyInt = message.ReceiverID
		}
		user, err := GetUserByID(mapKeyInt)
		if err != nil {
			return nil, err
		}
		mapKey := user.Nick_Name

		messagesMap[mapKey] = append(messagesMap[mapKey], message)
	}
	return messagesMap, nil
}

func GetMessageByID(messageID int) (Message, error) {
	statement := "SELECT * FROM Messages WHERE Message_ID = ? AND Is_Active = 1"
	var message Message
	err := dbHandler.DB.QueryRow(statement, messageID).Scan(
		&message.MessageID,
		&message.MessageText,
		&message.SenderID,
		&message.ReceiverID,
		&message.IsRead,
		&message.CreatedByID,
		&message.CreationTime,
		&message.IsActive,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return Message{}, fmt.Errorf("message does not exist: %v", err)
		}
		return Message{}, fmt.Errorf("failed to query message: %v", err)
	}

	return message, nil
}

func GetCategoryIDFromCategoryText(categoryText string) (int, error) {
	var CategoryID int
	err := dbHandler.DB.QueryRow(`SELECT Category_ID FROM Categories WHERE Category_Text = ? AND Is_Active = 1`, categoryText).Scan(&CategoryID)

	if err == sql.ErrNoRows {
		return 0, fmt.Errorf("no category found with text: %s", categoryText)
	}
	if err != nil {
		return 0, err
	}
	return CategoryID, nil
}