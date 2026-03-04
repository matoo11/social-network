package dbHandler

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"social/backend/pkg/logs"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

func OpenDB() error {
	dbFilePath := "backend/pkg/db/social.db"
	migrationsPath := "file://backend/pkg/db/migrations/sqlite"
	var err error

	DB, err = sql.Open("sqlite3", dbFilePath)
	if err != nil {
		return fmt.Errorf("failed to open DB: %v", err)
	}

	_, err = DB.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return fmt.Errorf("failed to enable foreign key constraints: %v", err)
	}

	if err := runMigrations(DB, migrationsPath); err != nil {
		return fmt.Errorf("migration failed: %v", err)
	}

	logs.LogInfo("Database migrations completed successfully")

	if err := ensureTestData(); err != nil {
		log.Printf("Warning: failed to create test data: %v", err)
	}

	return nil
}

func runMigrations(db *sql.DB, migrationsPath string) error {
	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		return fmt.Errorf("could not create database driver: %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		migrationsPath,
		"sqlite3",
		driver,
	)
	if err != nil {
		return fmt.Errorf("could not create migrate instance: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("could not run migrations: %v", err)
	}

	logs.LogInfo("Migrations applied successfully")
	return nil
}

func ensureTestData() error {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM Users WHERE User_ID = 1").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		logs.LogInfo("Test data already exists")
		return nil
	}

	logs.LogInfo("Creating test users...")
	if err := CreateAdminUser(); err != nil {
		return err
	}
	if err := CreateTestUsers(); err != nil {
		return err
	}

	logs.LogInfo("Test data created successfully")
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

	currentTime := time.Now().UTC().Format("2006-01-02 15:04:05")

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
