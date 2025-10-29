package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"strings"
)

type ProfileUserDetails struct {
	UserID        int
	UserName      string
	NickName      string
	Email         string
	FirstName     string
	LastName      string
	DateOfBirth   *string
	Gender        string
	ImageID       int
	AboutMe       *string
	ProfileTypeID int
}

var (
	ErrUserProfileNotFound = fmt.Errorf("user profile not found")
	ErrProfileTypeNotFound  = fmt.Errorf("profile type not found")
)

func GetUserProfileDetails(userID int) (ProfileUserDetails, error) {
	statement := `
		SELECT
			User_ID,
			User_Name,
			Nick_Name,
			Email,
			First_Name,
			Last_Name,
			Date_of_Birth,
			Gender,
			Image_ID,
			About_Me,
			Profile_Type_ID
		FROM Users
		WHERE User_ID = ? AND Is_Active = 1`

	var (
		hrer    ProfileUserDetails
		dob     sql.NullString
		aboutMe sql.NullString
	)

	err := dbHandler.DB.QueryRow(statement, userID).Scan(
		&hrer.UserID,
		&hrer.UserName,
		&hrer.NickName,
		&hrer.Email,
		&hrer.FirstName,
		&hrer.LastName,
		&dob,
		&hrer.Gender,
		&hrer.ImageID,
		&aboutMe,
		&hrer.ProfileTypeID,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return ProfileUserDetails{}, ErrUserProfileNotFound
		}
		return ProfileUserDetails{}, fmt.Errorf("failed to fetch user profile: %w", err)
	}

	if dob.Valid {
		value := dob.String
		hrer.DateOfBirth = &value
	}
	if aboutMe.Valid {
		value := aboutMe.String
		hrer.AboutMe = &value
	}

	return hrer, nil
}

func GetProfileTypeIDByName(name string) (int, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return 0, fmt.Errorf("profile type name cannot be empty")
	}

	var id int
	err := dbHandler.DB.QueryRow(
		`SELECT Profile_Type_ID
		 FROM Profile_Types
		 WHERE LOWER(Profile_Type_Name) = LOWER(?)
		   AND Is_Active = 1
		 LIMIT 1`,
		name,
	).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, ErrProfileTypeNotFound
		}
		return 0, fmt.Errorf("failed to fetch profile type %q: %w", name, err)
	}
	return id, nil
}
