package profile

type profileRequest struct {
	UserID *int `json:"userID"`
}

type toggleVisibilityRequest struct {
	Visibility    string `json:"visibility"`
	ProfileTypeID *int   `json:"profileTypeId"`
	IsPublic      *bool  `json:"isPublic"`
}