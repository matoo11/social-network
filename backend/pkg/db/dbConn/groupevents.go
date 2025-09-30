package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"sync"
	"time"
)

var ensureGroupEventTableOnce sync.Once

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

func ensureGroupEventTable() error {
	var err error
	ensureGroupEventTableOnce.Do(func() {
		statement := `CREATE TABLE IF NOT EXISTS Group_Events (
			Group_Event_ID INTEGER NOT NULL,
			Group_ID INTEGER NOT NULL,
			Event_ID INTEGER NOT NULL,
			Created_By_ID INTEGER NOT NULL,
			Creation_Time DATETIME NOT NULL,
			Last_Updated_By_ID INTEGER NOT NULL,
			Last_Updated_Time DATETIME NOT NULL,
			Is_Active BOOL NOT NULL DEFAULT TRUE,
			PRIMARY KEY (Group_Event_ID AUTOINCREMENT),
			FOREIGN KEY (Group_ID) REFERENCES User_Groups (Group_ID) ON UPDATE CASCADE ON DELETE CASCADE,
			FOREIGN KEY (Event_ID) REFERENCES Events (Event_ID) ON UPDATE CASCADE ON DELETE CASCADE
		)`
		_, err = dbHandler.DB.Exec(statement)
	})
	return err
}

func CreateGroupEvent(groupID, creatorID int, title, description string, eventTime time.Time) (GroupEvent, error) {
	if err := ensureGroupEventTable(); err != nil {
		return GroupEvent{}, err
	}

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
