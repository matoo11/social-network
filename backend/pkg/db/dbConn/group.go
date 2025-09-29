package dbConn

import (
	"database/sql"
	"fmt"
	"social/backend/pkg/db/dbHandler"
	"time"
)

const (
	StatusPending  = 1
	StatusAccepted = 2
	StatusRejected = 3
)

func formattedNow() string {
	return time.Now().Format("2006-01-02 15:04:05")
}

type Group struct {
	GroupID      int
	Title        string
	Description  string
	OwnerID      int
	CreationTime time.Time
}

type GroupSummary struct {
	GroupID      int
	Title        string
	Description  string
	OwnerID      int
	MemberCount  int
	CreationTime time.Time
}

type GroupMember struct {
	GroupID  int
	UserID   int
	JoinedAt time.Time
}

type GroupInvite struct {
	InviteID     int
	GroupID      int
	InviterID    int
	InviteeID    int
	StatusID     int
	CreationTime time.Time
}

type GroupInviteDisplay struct {
	InviteID     int
	GroupID      int
	GroupTitle   string
	InviterID    int
	InviteeID    int
	StatusID     int
	CreationTime time.Time
}
