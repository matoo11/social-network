package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	User_ID                                                      int
	User_Name, Nick_Name, Password, Email, First_Name, Last_Name string
	Date_Of_Birth                                                *time.Time
	Gender                                                       string
	Image_ID                                                     int
	About_Me                                                     string
	Profile_Type_ID                                              int
	Created_By_ID                                                int
	Creation_Time                                                time.Time
	Last_Updated_By_ID                                           int
	Last_Updated_Time                                            time.Time
	Is_Active                                                    bool
}

func CreateUser(user User) error {
	fmt.Println(user.Gender)
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

	currentTime := time.Now().Format("2006-01-02 15:04:05")

	_, err = dbHandler.DB.Exec(statement, user.User_Name, user.User_Name, hashedPassword, user.Email, user.First_Name, user.Last_Name, user.Date_Of_Birth,user.Gender, user.Image_ID, user.About_Me, user.Profile_Type_ID, 1, currentTime, 1, currentTime)
	if err != nil {
		return fmt.Errorf("failed to create user: %v", err)
	}

	return nil
}

func GetUserByID(userID int) (User, error) {
	statement := `
		SELECT 
			User_ID, User_Name, Nick_Name, Password, Email, FirstName, LastName,
			Date_of_Birth, Gender, Image_ID, About_Me, Profile_Type_ID,
			Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, IsActive
		FROM Users
		WHERE User_ID = ? AND IsActive = 1
	`

	var user User
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
		&user.About_Me,
		&user.Profile_Type_ID,
		&user.Created_By_ID,
		&user.Creation_Time,
		&user.Last_Updated_By_ID,
		&user.Last_Updated_Time,
		&user.Is_Active,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return User{}, fmt.Errorf("user does not exist: %v", err)
		}
		return User{}, fmt.Errorf("failed to query user: %v", err)
	}

	return user, nil
}
