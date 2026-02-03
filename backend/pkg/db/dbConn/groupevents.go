package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"
)

type GroupEvent struct {
	EventID      int
	GroupID      int
	Title        string
	Description  string
	EventTime    time.Time
	CreatorID    int
	Responses    []EventResponseCount
	UserChoiceID *int
}

type EventResponseCount struct {
	OptionID   int
	OptionName string
	Count      int
}

func CreateGroupEvent(groupID, creatorID int, title, description string, eventTime time.Time) (GroupEvent, error) {
	eventStatement := `INSERT INTO Events (
		Event_Title,
		Event_Description,
		Event_Time,
		User_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`

	now := formattedNow()
	res, err := dbHandler.DB.Exec(eventStatement, title, description, eventTime.Format("2006-01-02 15:04:05"), creatorID, creatorID, now, creatorID, now)
	if err != nil {
		return GroupEvent{}, fmt.Errorf("failed to create event: %w", err)
	}

	eventID64, err := res.LastInsertId()
	if err != nil {
		return GroupEvent{}, fmt.Errorf("failed to fetch event id: %w", err)
	}

	linkStatement := `INSERT INTO Group_Events (
		Group_ID,
		Event_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, 1)`

	_, err = dbHandler.DB.Exec(linkStatement, groupID, int(eventID64), creatorID, now, creatorID, now)
	if err != nil {
		return GroupEvent{}, fmt.Errorf("failed to link event to group: %w", err)
	}

	return GroupEvent{
		EventID:     int(eventID64),
		GroupID:     groupID,
		Title:       title,
		Description: description,
		EventTime:   eventTime,
		CreatorID:   creatorID,
	}, nil
}

func GetGroupEvents(groupID int) ([]GroupEvent, error) {
	statement := `
		SELECT e.Event_ID,
		       ge.Group_ID,
		       e.Event_Title,
		       e.Event_Description,
		       e.Event_Time,
		       e.User_ID
		FROM Group_Events ge
		JOIN Events e ON ge.Event_ID = e.Event_ID
		WHERE ge.Group_ID = ? AND ge.Is_Active = 1 AND e.Is_Active = 1
		ORDER BY e.Event_Time DESC`

	rows, err := dbHandler.DB.Query(statement, groupID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch group events: %w", err)
	}
	defer rows.Close()

	var events []GroupEvent
	for rows.Next() {
		var evt GroupEvent
		var eventTimeStr string
		err := rows.Scan(&evt.EventID, &evt.GroupID, &evt.Title, &evt.Description, &eventTimeStr, &evt.CreatorID)
		if err != nil {
			return nil, fmt.Errorf("failed to scan group event: %w", err)
		}
		if parsed, parseErr := time.Parse("2006-01-02 15:04:05", eventTimeStr); parseErr == nil {
			evt.EventTime = parsed
		}
		counts, err := GetEventResponseCounts(evt.EventID)
		if err != nil {
			return nil, err
		}
		evt.Responses = counts
		events = append(events, evt)
	}
	return events, nil
}

func GetGroupEventByID(eventID int) (GroupEvent, error) {
	statement := `
		SELECT e.Event_ID,
		       ge.Group_ID,
		       e.Event_Title,
		       e.Event_Description,
		       e.Event_Time,
		       e.User_ID
		FROM Group_Events ge
		JOIN Events e ON ge.Event_ID = e.Event_ID
		WHERE e.Event_ID = ? AND ge.Is_Active = 1 AND e.Is_Active = 1
		LIMIT 1`

	var evt GroupEvent
	var eventTimeStr string
	err := dbHandler.DB.QueryRow(statement, eventID).Scan(
		&evt.EventID,
		&evt.GroupID,
		&evt.Title,
		&evt.Description,
		&eventTimeStr,
		&evt.CreatorID,
	)
	if err != nil {
		return GroupEvent{}, fmt.Errorf("failed to fetch group event: %w", err)
	}

	if parsed, parseErr := time.Parse("2006-01-02 15:04:05", eventTimeStr); parseErr == nil {
		evt.EventTime = parsed
	}

	counts, err := GetEventResponseCounts(evt.EventID)
	if err != nil {
		return GroupEvent{}, err
	}
	evt.Responses = counts

	return evt, nil
}

func GetUserEventResponse(eventID, userID int) (*int, error) {
	var optionID sql.NullInt64
	err := dbHandler.DB.QueryRow(`
		SELECT Event_Option_ID
		FROM Events_Users_Options
		WHERE Event_ID = ? AND User_ID = ? AND Is_Active = 1
	`, eventID, userID).Scan(&optionID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to fetch user event response: %w", err)
	}
	if !optionID.Valid {
		return nil, nil
	}
	value := int(optionID.Int64)
	return &value, nil
}

func GetEventResponseCounts(eventID int) ([]EventResponseCount, error) {
	statement := `
		SELECT eop.Event_Option_ID,
		       eop.Event_Option_Name,
		       IFNULL(resp.ResponseCount, 0)
		FROM Event_Options eop
		LEFT JOIN (
			SELECT Event_Option_ID, COUNT(*) AS ResponseCount
			FROM Events_Users_Options
			WHERE Event_ID = ? AND Is_Active = 1
			GROUP BY Event_Option_ID
		) resp ON eop.Event_Option_ID = resp.Event_Option_ID
		WHERE eop.Is_Active = 1
		ORDER BY eop.Event_Option_ID`

	rows, err := dbHandler.DB.Query(statement, eventID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch event responses: %w", err)
	}
	defer rows.Close()

	var counts []EventResponseCount
	for rows.Next() {
		var count EventResponseCount
		err := rows.Scan(&count.OptionID, &count.OptionName, &count.Count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event response count: %w", err)
		}
		switch count.OptionName {
		case "Going", "Not Going":
			counts = append(counts, count)
		}
	}
	return counts, nil
}

func SetEventResponse(eventID, userID, optionID int) error {
	statement := `INSERT INTO Events_Users_Options (
		Event_ID,
		User_ID,
		Event_Option_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
	ON CONFLICT(Event_ID, User_ID) DO UPDATE SET 
		Event_Option_ID = excluded.Event_Option_ID,
		Last_Updated_By_ID = excluded.Last_Updated_By_ID,
		Last_Updated_Time = excluded.Last_Updated_Time,
		Is_Active = 1`

	now := formattedNow()
	_, err := dbHandler.DB.Exec(statement, eventID, userID, optionID, userID, now, userID, now)
	if err != nil {
		return fmt.Errorf("failed to record event response: %w", err)
	}
	return nil
}

func GetGroupIDForEvent(eventID int) (int, error) {
	var groupID int
	err := dbHandler.DB.QueryRow(`SELECT Group_ID FROM Group_Events WHERE Event_ID = ? AND Is_Active = 1`, eventID).Scan(&groupID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("event not found")
		}
		return 0, fmt.Errorf("failed to fetch event group: %w", err)
	}
	return groupID, nil
}

func GetEventOptionByID(optionID int) (string, error) {
	var optionName string
	err := dbHandler.DB.QueryRow(`SELECT Event_Option_Name FROM Event_Options WHERE Event_Option_ID = ? AND Is_Active = 1`, optionID).Scan(&optionName)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("event option not found")
		}
		return "", fmt.Errorf("failed to fetch event option: %w", err)
	}
	return optionName, nil
}
