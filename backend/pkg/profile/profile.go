package profile

import "social/backend/pkg/db/dbConn"

type profileRequest struct {
	UserID *int `json:"userID"`
}

type toggleVisibilityRequest struct {
	Visibility    string `json:"visibility"`
	ProfileTypeID *int   `json:"profileTypeId"`
	IsPublic      *bool  `json:"isPublic"`
}

type profileUserDTO struct {
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

func toProfileUserDTO(details dbConn.ProfileUserDetails, profileTypeName string) profileUserDTO {
	return profileUserDTO{
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

