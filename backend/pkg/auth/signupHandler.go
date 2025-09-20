package auth

import (
	"fmt"
	"net/http"
	"social/backend/pkg/db/dbConn"
	"time"
)

type SignupRequest struct {
	Username        string `json:"username"`
	Nickname        string `json:"nickname"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
	FirstName       string `json:"firstName"`
	LastName        string `json:"lastName"`
	DateOfBirth     string `json:"dateOfBirth"`
	Gender          string `json:"gender"`
}

// ============================================================
//                   Main Functions
// ============================================================

// SignupHandler - Handles user sign-up by verifying the user's details,
// creating a new user, and storing the user's information.
func SignupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		RespondHTML(w, r, http.StatusMethodNotAllowed, "ERROR", "Method not allowed")
		return
	}

	requestBody, err := ParseSignupRequest(r) // TODO: Need to received Json from the request
	if err != nil {
		Respond(w, r, http.StatusBadRequest, nil, "Unable to parse form")
		return
	}

	// fmt.Println(requestBody.Nickname)
	err = VerifyUserInfo(requestBody)
	if err != nil {
		Respond(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	userInfo := GenerateNewValidUser(requestBody)
	if err = dbConn.CreateUser(userInfo); err != nil {
		Respond(w, r, http.StatusInternalServerError, nil, "Unable to create new user")
		return
	}

	Respond(w, r, http.StatusOK, nil, "Signup successful")

}

// ============================================================
//                   Helper Functions
// ============================================================

// GenerateNewValidUser - Returns a User Struct from the SignupRequest
func GenerateNewValidUser(requestInfo SignupRequest) dbConn.User {
	// age, err := strconv.Atoi(requestInfo.DateOfBirth) //TODO: change to DateOfBirth
	// if err != nil {
	// 	return dbConn.User{} //TODO: the function should return an error
	// }
	user := dbConn.User{
		User_Name:  requestInfo.Username,
		Nick_Name:  requestInfo.Nickname,
		Password:   requestInfo.Password,
		Email:      requestInfo.Email,
		First_Name: requestInfo.FirstName,
		Last_Name:  requestInfo.LastName,
		// Date_of_Birth: requestInfo.DateOfBirth,
		Gender: requestInfo.Gender,
	}
	return user
}

// ParseSignupRequest - Extracts the sign-up request data from the "Front End"
func ParseSignupRequest(r *http.Request) (SignupRequest, error) {
	var requestBody SignupRequest

	err := r.ParseMultipartForm(1 << 20)
	if err != nil {
		return requestBody, err
	}

	requestBody.Nickname = r.FormValue("userIdentifier")
	requestBody.Email = r.FormValue("email")
	requestBody.Password = r.FormValue("password")
	requestBody.ConfirmPassword = r.FormValue("confirmPassword")
	requestBody.FirstName = r.FormValue("firstName")
	requestBody.LastName = r.FormValue("lastName")

	// requestBody.Age = r.FormValue("age") //TODO: change to DateOfBirth
	requestBody.Gender = r.FormValue("gender")

	return requestBody, nil
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

// RenderSignupFeedback - Renders the Feedback to the signup template
// func RenderSignupFeedback(w http.ResponseWriter, feedback string, feedbackType string) {
// 	signUpFeedback := struct {
// 		Feedback     string
// 		FeedbackType string
// 	}{
// 		Feedback:     feedback,
// 		FeedbackType: feedbackType,
// 	}
// 	RenderTemplate(w, templates["signup"], signUpFeedback)
// }
