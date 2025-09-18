package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"

	"golang.org/x/crypto/bcrypt"
)

func VerifyUserPassword(username, password string) (*User, error) {
	var user User
	err := dbHandler.DB.QueryRow(`
		SELECT 
			User_ID,
			User_Name,
			Password,
			Email,
			IsActive
		FROM Users 
		WHERE User_Name = ?`, username).
		Scan(
			&user.User_ID,
			&user.User_Name,
			&user.Password,
			&user.Email,
			&user.IsActive,
		)
	if err != nil {
		if err == sql.ErrNoRows {
			errr := dbHandler.DB.QueryRow(`
				SELECT 
					User_ID,
					User_Name,
					Password,
					Email,
					IsActive
				FROM Users 
				WHERE Email = ?`, username).
				Scan(
					&user.User_ID,
					&user.User_Name,
					&user.Password,
					&user.Email,
					&user.IsActive,
				)
			if errr != nil {
				if err == sql.ErrNoRows {
					return nil, fmt.Errorf("invalid username or password")
				}
				return nil, fmt.Errorf("error querying database: %v", err)
			}
		} else {
			return nil, fmt.Errorf("error querying database: %v", err)
		}
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, fmt.Errorf("invalid username or password")
	}

	return &user, nil
}
