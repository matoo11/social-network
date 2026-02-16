package auth

import (
	"fmt"
	"net"
	re "regexp"
	"social/backend/pkg/db/dbHandler"
	"strconv"
	"strings"
	"time"
	"unicode"
)

const (
	// nickname constants
	nicknameRegex     = `^[a-zA-Z0-9_]+$`
	MinNicknameLength = 3
	MaxNicknameLength = 15

	// email constants
	emailRegex     = `^[a-zA-Z0-9.!#$%&'*+=?_-]{1,64}@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$`
	MaxEmailLength = 254

	// password constants
	passwordRegex     = `^[^\s]{8,128}$`
	MinPasswordLength = 8
	MaxPasswordLength = 128

	// name constants
	MinNameLength = 2
	MaxNameLength = 50

	// about me constants
	MaxAboutMeLength = 300

	// age constant
	MinAge = 13
	MaxAge = 120
)

// ============================================================
//                   Master Function
// ============================================================

// VerifyUserInfo - Verifies the provided user details, ensuring they meet validation criteria.
func VerifyUserInfo(userInfo SignupRequest) error {
	verifications := []func() error{
		func() error { return VerifyUsername(userInfo.Username) },
		func() error { return VerifyEmail(userInfo.Email) },
		func() error { return VerifyPassword(userInfo.Password) },
		func() error { return VerifyConfirmPassword(userInfo.ConfirmPassword, userInfo.Password) },
		func() error { return VerifyName(userInfo.FirstName) },
		func() error { return VerifyName(userInfo.LastName) },
		func() error { return VerifyDateOfBirth(userInfo.DateOfBirth) },
		func() error { return VerifyGender(userInfo.Gender) },
	}

	for _, verify := range verifications {
		if err := verify(); err != nil {
			return err
		}
	}

	// Validate nickname only if provided (optional field)

	if userInfo.Nickname != "" {
		if err := VerifyNickname(userInfo.Nickname); err != nil {
			return err
		}
	}

	// Validate about me only if provided (optional field)
	if userInfo.AboutMe != "" {
		if err := VerifyAboutMe(userInfo.AboutMe); err != nil {
			return err
		}
	}

	return nil
}

// ============================================================
//                   Main Functions
// ============================================================

func VerifyDateOfBirth(dob *time.Time) error {
	if dob == nil {
		return fmt.Errorf("date of birth cannot be empty")
	}
	age, err := CalculateAge(dob)
	if err != nil {
		return err
	}

	if age < MinAge {
		return fmt.Errorf("user must be at least %d years old", MinAge)
	}

	return nil
}

func VerifyUsername(username string) error {
	if len(username) < MinNicknameLength {
		return fmt.Errorf("username must be at least %d characters long", MinNicknameLength)
	}
	if len(username) >= MaxNicknameLength {
		return fmt.Errorf("username must not exceed max length of %d characters", MaxNicknameLength)
	}

	re1 := re.MustCompile(nicknameRegex)
	if !re1.MatchString(username) {
		return fmt.Errorf("username must only contain letters, numbers, and underscores")
	}

	exists, err := IsUsernameExists(username)
	if err != nil {
		return err
	}

	if exists {
		return fmt.Errorf("username already exists")
	}

	return nil
}

func VerifyNickname(nickname string) error {
	if len(nickname) < MinNicknameLength {
		return fmt.Errorf("nickname must be at least %d characters long", MinNicknameLength)
	}
	if len(nickname) >= MaxNicknameLength {
		return fmt.Errorf("nickname must not exceed max length of %d characters", MaxNicknameLength)
	}

	re1 := re.MustCompile(nicknameRegex)
	if !re1.MatchString(nickname) {
		return fmt.Errorf("nickname must only contain letters, numbers, and underscores")
	}

	return nil
}

func VerifyAboutMe(aboutMe string) error {
	if len(aboutMe) > MaxAboutMeLength {
		return fmt.Errorf("about me must not exceed max length of %d characters", MaxAboutMeLength)
	}

	return nil
}

func VerifyEmail(email string) error {
	if len(email) > MaxEmailLength {
		return fmt.Errorf("email must not exceed max length of %d characters", MaxEmailLength)
	}

	if err := VerifyEmailFormat(email); err != nil {
		return err
	}

	domain, err := GetEmailDomain(email)
	if err != nil {
		return fmt.Errorf("could not extract domain from email")
	}

	if err := VerifyDomainRecords(domain); err != nil {
		return fmt.Errorf("email domain validation failed")
	}

	exists, err := IsEmailExists(email)
	if err != nil {
		return err
	}

	if exists {
		return fmt.Errorf("email already exists")
	}

	return nil
}

func VerifyPassword(password string) error {
	re1 := re.MustCompile(`^[^\s]{8,128}$`)
	if !re1.MatchString(password) {
		return fmt.Errorf("password must be between %d-%d characters and contain no spaces", MinPasswordLength, MaxPasswordLength)
	}

	return nil
}

func VerifyConfirmPassword(confirmPassword, password string) error {
	if password != confirmPassword {
		return fmt.Errorf("passwords do not match")
	}

	if len(password) > MaxPasswordLength {
		return fmt.Errorf("password must not exceed max length of %d characters", MaxPasswordLength)
	}

	return nil
}

func VerifyName(name string) error {
	name = strings.TrimSpace(name)

	if name == "" {
		return fmt.Errorf("name cannot be empty or only spaces")
	}

	if len(name) < MinNameLength || len(name) > MaxNameLength {
		return fmt.Errorf("name must be between %d and %d characters long", MinNameLength, MaxNameLength)
	}

	for _, char := range name {
		if !(unicode.IsLetter(char) || unicode.IsDigit(char) || char == ' ' || char == '-' || char == '\'') {
			return fmt.Errorf("name contains invalid characters")
		}
	}

	return nil
}

func VerifyAge(ageStr string) error {
	age, err := strconv.Atoi(ageStr)
	if err != nil {
		return err
	}
	if age < MinAge || age > MaxAge {
		return fmt.Errorf("user age must be between %d and %d years old", MinAge, MaxAge)
	}

	return nil
}

func VerifyGender(gender string) error {
	if gender != "M" && gender != "F" {
		return fmt.Errorf("gender must be either male(M) or female(F)")
	}

	return nil
}

// ============================================================
//                   Helper Functions
// ============================================================

func VerifyEmailFormat(email string) error {
	re := re.MustCompile(emailRegex)

	if !re.MatchString(email) {
		return fmt.Errorf("invalid email format: %s", email)
	}
	return nil
}

func GetEmailDomain(email string) (string, error) {
	re := re.MustCompile(emailRegex)
	matches := re.FindStringSubmatch(email)
	if len(matches) < 2 {
		return "", fmt.Errorf("could not extract domain from email: %s", email)
	}
	return matches[1], nil
}

// VerifyDomainRecords checks both IP records and MX records for a given domain.
func VerifyDomainRecords(domain string) error {
	// Check IP records (IPv4 and IPv6)
	ips, err := net.LookupIP(domain)
	if err != nil {
		return fmt.Errorf("error looking up IP records for domain %s: %v", domain, err)
	}
	if len(ips) == 0 {
		return fmt.Errorf("no IP records found for domain: %s", domain)
	}

	// Check MX records
	mxRecords, err := net.LookupMX(domain)
	if err != nil {
		return fmt.Errorf("error looking up MX records for domain %s: %v", domain, err)
	}
	if len(mxRecords) == 0 {
		return fmt.Errorf("no MX records found for domain: %s", domain)
	}

	return nil
}

func CalculateAge(dob *time.Time) (int, error) {
	currentTime := time.Now()
	if dob.After(currentTime) {
		return 0, fmt.Errorf("date of birth cannot be in the future")
	}

	ageDuration := currentTime.Sub(*dob)
	age := int(ageDuration.Hours() / 24 / 365.25)

	return age, nil
}

func IsUsernameExists(username string) (bool, error) {
	var exists bool
	err := dbHandler.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE User_Name = ?)", username).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error checking username: %v", err)
	}
	return exists, nil
}

func IsNicknameExists(nickname string) (bool, error) {
	var exists bool
	err := dbHandler.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE Nick_Name = ?)", nickname).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error checking nickname: %v", err)
	}
	return exists, nil
}

func IsEmailExists(email string) (bool, error) {
	var exists bool
	err := dbHandler.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE Email = ?)", email).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error checking email: %v", err)
	}
	return exists, nil
}
