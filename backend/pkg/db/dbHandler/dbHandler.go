package dbHandler

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"social/backend/pkg/logs"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

func OpenDB() error {
	dbFile := "social.db"
	dbFilePath := "backend/pkg/db/social.db"
	sqlCommandsFilePath := "backend/pkg/db/migrations/db.sql"
	var err error
	var recreatedFlag bool

	// Check if the database file exists and recreate it if it doesn't
	if FileExists(dbFilePath) {
		logs.LogInfo("Database file %s already exists. Skipping recreation.", dbFile)
	} else {
		err := ReCreateDB(sqlCommandsFilePath, dbFilePath)
		if err != nil {
			return err
		}
		recreatedFlag = true
	}

	DB, err = sql.Open("sqlite3", dbFilePath)
	if err != nil {
		return fmt.Errorf("failed to open DB: %v", err)
	}

	// ✅ Enable foreign key constraints
	_, err = DB.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return fmt.Errorf("failed to enable foreign key constraints: %v", err)
	}

	if recreatedFlag {
		err = CreateAdminUser()
		if err != nil {
			log.Print(err)

		}
		err = CreateTestUsers()
		if err != nil {
			log.Print(err)
		}
	}

	return nil
}

func ReCreateDB(sqlCommandsFilePath, dbFilePath string) error {
	sqlCommands, err := os.ReadFile(sqlCommandsFilePath)
	if err != nil {
		return fmt.Errorf("failed to read SQL file: %v", err)
	}

	DB, err := sql.Open("sqlite3", dbFilePath)
	if err != nil {
		return fmt.Errorf("failed to open DB: %v", err)
	}

	// ✅ Enable foreign key constraints
	_, err = DB.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return fmt.Errorf("failed to enable foreign key constraints: %v", err)
	}

	defer DB.Close()

	// Split SQL commands and Convert it to string
	commands := strings.Split(string(sqlCommands), ";")

	// Execute each SQL command
	for _, command := range commands {
		trimmedCommand := strings.TrimSpace(command)
		if trimmedCommand == "" {
			continue
		}
		if _, err := DB.Exec(trimmedCommand); err != nil {
			return fmt.Errorf("failed to execute SQL command: %s, error: %v", trimmedCommand, err)
		}
	}

	logs.LogInfo("Database has been successfully re-created")
	return nil
}

// FileExists - Checks wether a file exits or not and makes sure that it is not a directory which has the same name
func FileExists(filename string) bool {
	info, err := os.Stat(filename)
	return err == nil && !info.IsDir()
}

func CreateAdminUser() error {
	user := struct {
		UserName, Nickname, Password, Email string
		FirstName, LastName                 string
		DateOfBirth                         time.Time
		Gender                              string
		ImageID, ProfileTypeID              int
		IsActive                            bool
	}{
		UserName:      "admin_user",
		Nickname:      "admin",
		Password:      "q1w2e3r4",
		Email:         "Admin@Reboot01.com",
		FirstName:     "John",
		LastName:      "Doe",
		DateOfBirth:   time.Date(2000, time.January, 1, 0, 0, 0, 0, time.UTC),
		Gender:        "M",
		ImageID:       1,
		ProfileTypeID: 1,
		IsActive:      true,
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %v", err)
	}

	statement := `INSERT INTO Users (
		User_Name,
		Nick_Name,
		Password,
		Email,
		First_Name,
		Last_Name,
		Date_of_Birth,
		Gender,
		Image_ID,
		Profile_Type_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	currentTime := time.Now().Format("2006-01-02 15:04:05")

	_, err = DB.Exec(statement,
		user.UserName,
		user.Nickname,
		hashedPassword,
		user.Email,
		user.FirstName,
		user.LastName,
		user.DateOfBirth.Format("2006-01-02"),
		user.Gender,
		user.ImageID,
		user.ProfileTypeID,
		1, // Created_By_ID
		currentTime,
		1, // Last_Updated_By_ID
		currentTime,
		user.IsActive,
	)

	if err != nil {
		return fmt.Errorf("failed to create user: %v", err)
	}

	return nil
}

func CreateTestUsers() error {
	users := []struct {
		UserName  string
		NickName  string
		Email     string
		FirstName string
		LastName  string
		Age       int // will convert to DateOfBirth
		Gender    string
	}{
		{"testuser1", "test", "test@example.com", "John", "Doe", 25, "M"},
		{"testuser2", "test2", "test2@example.com", "Jane", "Smith", 30, "F"},
		{"alphauser1", "alpha1", "alpha1@example.com", "Liam", "Brown", 18, "M"},
		{"betauser2", "beta2", "beta2@example.com", "Olivia", "Jones", 22, "F"},
		{"gammauser3", "gamma3", "gamma3@example.com", "Noah", "Taylor", 28, "M"},
		{"deltauser4", "delta4", "delta4@example.com", "Emma", "Davis", 26, "F"},
		{"echouser5", "echo5", "echo5@example.com", "Lucas", "Miller", 19, "M"},
		{"foxtrotuser6", "foxtrot6", "foxtrot6@example.com", "Ava", "Wilson", 32, "F"},
		{"golfuser7", "golf7", "golf7@example.com", "Ethan", "Lee", 35, "M"},
		{"hoteluser8", "hotel8", "hotel8@example.com", "Mia", "White", 24, "F"},
		{"indiauser9", "india9", "india9@example.com", "Zack", "Hall", 27, "M"},
		{"julietuser10", "juliet10", "juliet10@example.com", "Ella", "Lopez", 21, "F"},
		{"kilouser11", "kilo11", "kilo11@example.com", "Mark", "Young", 29, "M"},
	}

	// Pre-hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("q1w2e3r4"), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("error hashing password: %v", err)
	}

	insertStmt := `
	INSERT INTO Users (
		User_Name,
		Nick_Name,
		Password,
		Email,
		First_Name,
		Last_Name,
		Date_of_Birth,
		Gender,
		Image_ID,
		Profile_Type_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	now := time.Now()
	currentTime := now.Format("2006-01-02 15:04:05")

	for _, user := range users {
		// Convert Age to Date_of_Birth (naive approximation)
		dateOfBirth := now.AddDate(-user.Age, 0, 0).Format("2006-01-02")

		_, err := DB.Exec(insertStmt,
			user.UserName,
			user.NickName,
			hashedPassword,
			user.Email,
			user.FirstName,
			user.LastName,
			dateOfBirth,
			user.Gender,
			1, // Image_ID
			1, // Profile_Type_ID
			1, // Created_By_ID
			currentTime,
			1, // Last_Updated_By_ID
			currentTime,
			true, // Is_Active
		)

		if err != nil {
			return fmt.Errorf("failed to insert user %s: %v", user.NickName, err)
		}
	}

	return nil
}
