package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	User_ID            int        `json:"userId"`
	User_Name          string     `json:"userName"`
	Nick_Name          string     `json:"nickName"`
	Password           string     `json:"password"`
	Email              string     `json:"email"`
	First_Name         string     `json:"firstName"`
	Last_Name          string     `json:"lastName"`
	Date_Of_Birth      *time.Time `json:"dateOfBirth"`
	Gender             string     `json:"gender"`
	Image_ID           int        `json:"imageId"`
	About_Me           string     `json:"aboutMe"`
	Profile_Type_ID    int        `json:"profileTypeId"`
	Created_By_ID      int        `json:"createdById"`
	Creation_Time      time.Time  `json:"creationTime"`
	Last_Updated_By_ID int        `json:"lastUpdatedById"`
	Last_Updated_Time  time.Time  `json:"lastUpdatedTime"`
	Is_Active          bool       `json:"isActive"`
}

type UserDisplay struct {
	User_ID                                                      int
	User_Name, Nick_Name, Password, Email, First_Name, Last_Name string
	Gender                                                       string
	Image_ID                                                     int
	About_Me                                                     string
	Profile_Type_ID                                              int
}

func CreateUser(user User) error {

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %v", err)
	}
	statement := `INSERT INTO Users 
        (
		User_Name,
		Nick_Name, 
		Password, 
		Email, 
		First_Name, 
		Last_Name, 
		Date_of_Birth,
		Gender,
		Image_ID,
		About_Me,
		Profile_Type_ID, 
		Created_By_ID, 
		Creation_Time, 
		Last_Updated_By_ID, 
		Last_Updated_Time)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

	currentTime := time.Now().UTC().Format("2006-01-02 15:04:05")

	_, err = dbHandler.DB.Exec(statement, user.User_Name, user.User_Name, hashedPassword, user.Email, user.First_Name, user.Last_Name, user.Date_Of_Birth, user.Gender, user.Image_ID, user.About_Me, 1, 1, currentTime, 1, currentTime)
	if err != nil {
		return fmt.Errorf("failed to create user: %v", err)
	}

	return nil
}

func GetUserByID(userID int) (User, error) {
	statement := `
		SELECT 
			User_ID, User_Name, Nick_Name, Password, Email, First_Name, Last_Name,
			Date_of_Birth, Gender, Image_ID, About_Me, Profile_Type_ID,
			Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active
		FROM Users
		WHERE User_ID = ? AND Is_Active = 1
	`

	var user User
	var aboutMe sql.NullString
	err := dbHandler.DB.QueryRow(statement, userID).Scan(
		&user.User_ID,
		&user.User_Name,
		&user.Nick_Name,
		&user.Password,
		&user.Email,
		&user.First_Name,
		&user.Last_Name,
		&user.Date_Of_Birth,
		&user.Gender,
		&user.Image_ID,
		&aboutMe,
		&user.Profile_Type_ID,
		&user.Created_By_ID,
		&user.Creation_Time,
		&user.Last_Updated_By_ID,
		&user.Last_Updated_Time,
		&user.Is_Active,
	)

	if aboutMe.Valid {
		user.About_Me = aboutMe.String
	}

	if err != nil {
		if err == sql.ErrNoRows {
			return User{}, fmt.Errorf("user does not exist: %v", err)
		}
		return User{}, fmt.Errorf("failed to query user: %v", err)
	}

	return user, nil
}

func GetAllUsers() ([]UserDisplay, error) {
	var users []UserDisplay
	statement := `SELECT User_ID, User_Name,
	First_Name, Last_Name FROM Users`
	data, err := dbHandler.DB.Query(statement)
	if err != nil {

		return nil, err
	}
	defer data.Close()
	for data.Next() {
		var user UserDisplay
		err := data.Scan(&user.User_ID,
			&user.User_Name,
			&user.First_Name,
			&user.Last_Name)
		if err != nil {

			return nil, err
		}
		users = append(users, user)
	}
	if err := data.Err(); err != nil {

		return nil, err
	}
	return users, nil
}
