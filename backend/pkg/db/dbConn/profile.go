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
type ProfileType struct {
	ID   int
	Name string
}

type FollowUserDetails struct {
	UserID    int
	UserName  string
	NickName  string
	FirstName string
	LastName  string
	ImageID   int
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

func GetProfileTypeNameByID(id int) (string, error) {
	var name string
	err := dbHandler.DB.QueryRow(
		`SELECT Profile_Type_Name
		 FROM Profile_Types
		 WHERE Profile_Type_ID = ?
		   AND Is_Active = 1
		 LIMIT 1`,
		id,
	).Scan(&name)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", ErrProfileTypeNotFound
		}
		return "", fmt.Errorf("failed to fetch profile type id %d: %w", id, err)
	}
	return name, nil
}

func UpdateUserProfileType(userID, profileTypeID, updatedBy int) error {
	statement := `
		UPDATE Users
		SET Profile_Type_ID = ?,
		    Last_Updated_By_ID = ?,
		    Last_Updated_Time = ?
		WHERE User_ID = ?`

	now := formattedNow()
	result, err := dbHandler.DB.Exec(statement, profileTypeID, updatedBy, now, userID)
	if err != nil {
		return fmt.Errorf("failed to update profile type: %w", err)
	}

	affected, err := result.RowsAffected()
	if err == nil && affected == 0 {
		return fmt.Errorf("user not found")
	}
	return nil
}

func GetFollowingDetailed(userID int) ([]FollowUserDetails, error) {
	statement := `
		SELECT
			u.User_ID,
			u.User_Name,
			u.Nick_Name,
			u.First_Name,
			u.Last_Name,
			u.Image_ID
		FROM Followers f
		JOIN Users u ON f.Followed_ID = u.User_ID
		WHERE f.Follower_ID = ?
		  AND f.Is_Active = 1
		  AND u.Is_Active = 1
		ORDER BY f.Creation_Time DESC`

	rows, err := dbHandler.DB.Query(statement, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch following users: %w", err)
	}
	defer rows.Close()

	var following []FollowUserDetails
	for rows.Next() {
		var fol FollowUserDetails
		if err := rows.Scan(
			&fol.UserID,
			&fol.UserName,
			&fol.NickName,
			&fol.FirstName,
			&fol.LastName,
			&fol.ImageID,
		); err != nil {
			return nil, fmt.Errorf("failed to scan following user: %w", err)
		}
		following = append(following, fol)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate following users: %w", err)
	}

	return following, nil
}