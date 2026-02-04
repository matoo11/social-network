package auth

import (
	"fmt"
	"net/http"
	"social/backend/pkg/db/dbConn"
	"time"
)

type SignupRequest struct {
	Username        string     `json:"username"`
	Nickname        string     `json:"nickname"`
	Email           string     `json:"email"`
	Password        string     `json:"password"`
	ConfirmPassword string     `json:"confirmPassword"`
	FirstName       string     `json:"firstName"`
	LastName        string     `json:"lastName"`
	DateOfBirth     *time.Time `json:"dateOfBirth"`
	Gender          string     `json:"gender"`
	AvatarNumber    int        `json:"avatarNumber"`
	AboutMe         string     `json:"aboutMe"`
}

// ============================================================
//                   Main Functions
// ============================================================

func SignupHandler(w http.ResponseWriter, r *http.Request) {
	var data SignupRequest
	if err := JsonDecode(w, r, &data); err != nil {
		ErrorPage(w, 400)
		return
	}

	if r.Method == http.MethodGet {
		return
	}

	if r.Method == http.MethodPost {

		requestBody := data
		err := VerifyUserInfo(requestBody)
		if err != nil {
			feedback := err.Error()
			w.WriteHeader(http.StatusBadRequest)
			RenderSignupFeedback(w, feedback, "error")
			return
		}

		userInfo := GenerateNewValidUser(requestBody)

		if err = dbConn.CreateUser(userInfo); err != nil {
			fmt.Println("here?")
			fmt.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		fmt.Println("fuck sign up")
		feedback := "Registration successful!"
		RenderSignupFeedback(w, feedback, "success")
		// updateOnlineUsers()
	} else {
		fmt.Println("here2")
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}
}

// ============================================================
//                   Helper Functions
// ============================================================

func GenerateNewValidUser(requestInfo SignupRequest) dbConn.User {
	// Default to avatar 1 if avatarNumber is 0 or invalid
	avatarNumber := requestInfo.AvatarNumber
	if avatarNumber < 1 || avatarNumber > 4 {
		avatarNumber = 1
	}

	// If nickname is empty, use username
	nickname := requestInfo.Nickname
	if nickname == "" {
		nickname = requestInfo.Username
	}

	user := dbConn.User{
		User_Name:     requestInfo.Username,
		Nick_Name:     nickname,
		Password:      requestInfo.Password,
		Email:         requestInfo.Email,
		First_Name:    requestInfo.FirstName,
		Last_Name:     requestInfo.LastName,
		Date_Of_Birth: requestInfo.DateOfBirth,
		Gender:        requestInfo.Gender,
		Image_ID:      avatarNumber,
		About_Me:      requestInfo.AboutMe,
	}
	return user
}

func ConvertStringToDate(dateStr string) (*time.Time, error) {
	if dateStr != "" {
		parsedDate, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			return &time.Time{}, fmt.Errorf("invalid date format, expected YYYY-MM-DD: %s", dateStr)
		}
		return &parsedDate, nil
	}
	return nil, nil
}

func RenderSignupFeedback(w http.ResponseWriter, feedback string, feedbackType string) {
	signUpFeedback := struct {
		Feedback     string `json:"Feedback"`
		FeedbackType string `json:"FeedbackType"`
	}{
		Feedback:     feedback,
		FeedbackType: feedbackType,
	}

	JsonEncode(w, signUpFeedback)
	fmt.Println(feedback, feedbackType)
}
