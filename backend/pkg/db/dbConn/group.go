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

func HasPendingGroupInvite(groupID, inviterID, inviteeID int) (bool, error) {
	var exists bool
	err := dbHandler.DB.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM Group_Invite_Requests
			WHERE Group_ID = ? AND Inviter_ID = ? AND Invitee_ID = ? AND Status_ID = ? AND Is_Active = 1
		)
	`, groupID, inviterID, inviteeID, StatusPending).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check pending invite: %w", err)
	}
	return exists, nil
}

func HasPendingInviteForUser(groupID, inviteeID int) (bool, error) {
	var exists bool
	err := dbHandler.DB.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM Group_Invite_Requests
			WHERE Group_ID = ? AND Invitee_ID = ? AND Status_ID = ? AND Is_Active = 1
		)
	`, groupID, inviteeID, StatusPending).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check pending invite for user: %w", err)
	}
	return exists, nil
}

func CreateGroup(title, description string, ownerID int) (int, error) {
	statement := `INSERT INTO User_Groups (
		Group_Title,
		Gruop_Description,
		User_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`

	now := formattedNow()
	res, err := dbHandler.DB.Exec(statement, title, description, ownerID, ownerID, now, ownerID, now)
	if err != nil {
		return 0, fmt.Errorf("failed to create group: %w", err)
	}

	groupID64, err := res.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch group id: %w", err)
	}
	groupID := int(groupID64)

	if err := AddUserToGroup(groupID, ownerID, ownerID); err != nil {
		return 0, err
	}

	return groupID, nil
}

func AddUserToGroup(groupID, userID, actorID int) error {
	exists, err := IsGroupMember(groupID, userID)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	statement := `INSERT INTO Group_Users (
		Group_ID,
		User_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, 1)`

	now := formattedNow()
	_, err = dbHandler.DB.Exec(statement, groupID, userID, actorID, now, actorID, now)
	if err != nil {
		return fmt.Errorf("failed to add user to group: %w", err)
	}
	return nil
}

func IsGroupMember(groupID, userID int) (bool, error) {
	var exists bool
	err := dbHandler.DB.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM Group_Users
			WHERE Group_ID = ? AND User_ID = ? AND Is_Active = 1
		)
	`, groupID, userID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check group membership: %w", err)
	}
	return exists, nil
}

func GetGroupOwnerID(groupID int) (int, error) {
	var ownerID int
	err := dbHandler.DB.QueryRow(`SELECT User_ID FROM User_Groups WHERE Group_ID = ? AND Is_Active = 1`, groupID).Scan(&ownerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("group not found")
		}
		return 0, fmt.Errorf("failed to fetch group owner: %w", err)
	}
	return ownerID, nil
}

func GetGroupByID(groupID int) (Group, error) {
	var g Group
	err := dbHandler.DB.QueryRow(`
		SELECT Group_ID, Group_Title, Gruop_Description, User_ID, Creation_Time
		FROM User_Groups
		WHERE Group_ID = ? AND Is_Active = 1
	`, groupID).Scan(&g.GroupID, &g.Title, &g.Description, &g.OwnerID, &g.CreationTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return Group{}, fmt.Errorf("group not found")
		}
		return Group{}, fmt.Errorf("failed to fetch group: %w", err)
	}
	return g, nil
}


func GetAllGroups() ([]GroupSummary, error) {
	statement := `
		SELECT g.Group_ID,
		       g.Group_Title,
		       g.Gruop_Description,
		       g.User_ID,
		       g.Creation_Time,
		       IFNULL(u.MemberCount, 0) AS MemberCount
		FROM User_Groups g
		LEFT JOIN (
			SELECT Group_ID, COUNT(*) AS MemberCount
			FROM Group_Users
			WHERE Is_Active = 1
			GROUP BY Group_ID
		) u ON g.Group_ID = u.Group_ID
		WHERE g.Is_Active = 1
		ORDER BY g.Creation_Time DESC`

	rows, err := dbHandler.DB.Query(statement)
	if err != nil {
		return nil, fmt.Errorf("failed to list groups: %w", err)
	}
	defer rows.Close()

	var groups []GroupSummary
	for rows.Next() {
		var g GroupSummary
		err := rows.Scan(&g.GroupID, &g.Title, &g.Description, &g.OwnerID, &g.CreationTime, &g.MemberCount)
		if err != nil {
			return nil, fmt.Errorf("failed to scan group: %w", err)
		}
		groups = append(groups, g)
	}

	return groups, nil
}

func GetGroupsForUser(userID int) ([]GroupSummary, error) {
	statement := `
		SELECT g.Group_ID,
		       g.Group_Title,
		       g.Gruop_Description,
		       g.User_ID,
		       g.Creation_Time,
		       IFNULL(u.MemberCount, 0) AS MemberCount
		FROM Group_Users gu
		JOIN User_Groups g ON gu.Group_ID = g.Group_ID
		LEFT JOIN (
			SELECT Group_ID, COUNT(*) AS MemberCount
			FROM Group_Users
			WHERE Is_Active = 1
			GROUP BY Group_ID
		) u ON g.Group_ID = u.Group_ID
		WHERE gu.User_ID = ? AND gu.Is_Active = 1 AND g.Is_Active = 1
		ORDER BY g.Creation_Time DESC`

	rows, err := dbHandler.DB.Query(statement, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list user groups: %w", err)
	}
	defer rows.Close()

	var groups []GroupSummary
	for rows.Next() {
		var g GroupSummary
		err := rows.Scan(&g.GroupID, &g.Title, &g.Description, &g.OwnerID, &g.CreationTime, &g.MemberCount)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user group: %w", err)
		}
		groups = append(groups, g)
	}

	return groups, nil
}

func GetGroupMembers(groupID int) ([]GroupMember, error) {
	statement := `
		SELECT Group_ID,
		       User_ID,
		       Creation_Time
		FROM Group_Users
		WHERE Group_ID = ? AND Is_Active = 1`

	rows, err := dbHandler.DB.Query(statement, groupID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch group members: %w", err)
	}
	defer rows.Close()

	var members []GroupMember
	for rows.Next() {
		var member GroupMember
		var created string
		err := rows.Scan(&member.GroupID, &member.UserID, &created)
		if err != nil {
			return nil, fmt.Errorf("failed to scan group member: %w", err)
		}
		if parsed, parseErr := time.Parse("2006-01-02 15:04:05", created); parseErr == nil {
			member.JoinedAt = parsed
		}
		members = append(members, member)
	}
	return members, nil
}

func CreateGroupInvite(groupID, inviterID, inviteeID int) (int, error) {
	ownerID, err := GetGroupOwnerID(groupID)
	if err != nil {
		return 0, err
	}
	if inviteeID != ownerID {
		inviterMember, err := IsGroupMember(groupID, inviterID)
		if err != nil {
			return 0, err
		}
		if !inviterMember {
			return 0, fmt.Errorf("only group members can invite others")
		}
		isMember, err := IsGroupMember(groupID, inviteeID)
		if err != nil {
			return 0, err
		}
		if isMember {
			return 0, fmt.Errorf("user already belongs to the group")
		}
		existsForUser, err := HasPendingInviteForUser(groupID, inviteeID)
		if err != nil {
			return 0, err
		}
		if existsForUser {
			return 0, fmt.Errorf("invite already pending")
		}
	} else {
		requesterMember, err := IsGroupMember(groupID, inviterID)
		if err != nil {
			return 0, err
		}
		if requesterMember {
			return 0, fmt.Errorf("user already belongs to the group")
		}
	}
	exists, err := HasPendingGroupInvite(groupID, inviterID, inviteeID)
	if err != nil {
		return 0, err
	}
	if exists {
		return 0, fmt.Errorf("invite already pending")
	}

	statement := `INSERT INTO Group_Invite_Requests (
		Group_ID,
		Inviter_ID,
		Invitee_ID,
		Status_ID,
		Created_By_ID,
		Creation_Time,
		Last_Updated_By_ID,
		Last_Updated_Time,
		Is_Active
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`

	now := formattedNow()
	res, err := dbHandler.DB.Exec(statement, groupID, inviterID, inviteeID, StatusPending, inviterID, now, inviterID, now)
	if err != nil {
		return 0, fmt.Errorf("failed to create group invite: %w", err)
	}

	inviteID64, err := res.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch invite id: %w", err)
	}
	return int(inviteID64), nil
}

func GetPendingInvitesForUser(userID int) ([]GroupInviteDisplay, error) {
	statement := `
		SELECT gir.Invite_Request_ID,
		       gir.Group_ID,
		       ug.Group_Title,
		       gir.Inviter_ID,
		       gir.Invitee_ID,
		       gir.Status_ID,
		       gir.Creation_Time
		FROM Group_Invite_Requests gir
		JOIN User_Groups ug ON gir.Group_ID = ug.Group_ID
		WHERE gir.Invitee_ID = ? AND gir.Status_ID = ? AND gir.Is_Active = 1
		ORDER BY gir.Creation_Time DESC`

	rows, err := dbHandler.DB.Query(statement, userID, StatusPending)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch pending invites: %w", err)
	}
	defer rows.Close()

	var invites []GroupInviteDisplay
	for rows.Next() {
		var invite GroupInviteDisplay
		err := rows.Scan(&invite.InviteID, &invite.GroupID, &invite.GroupTitle, &invite.InviterID, &invite.InviteeID, &invite.StatusID, &invite.CreationTime)
		if err != nil {
			return nil, fmt.Errorf("failed to scan invite: %w", err)
		}
		invites = append(invites, invite)
	}
	return invites, nil
}

func GetPendingRequestsForOwner(ownerID int) ([]GroupInviteDisplay, error) {
	statement := `
		SELECT gir.Invite_Request_ID,
		       gir.Group_ID,
		       g.Group_Title,
		       gir.Inviter_ID,
		       gir.Invitee_ID,
		       gir.Status_ID,
		       gir.Creation_Time
		FROM Group_Invite_Requests gir
		JOIN User_Groups g ON gir.Group_ID = g.Group_ID
		WHERE gir.Status_ID = ? AND g.User_ID = ? AND gir.Is_Active = 1 AND gir.Inviter_ID != g.User_ID
		ORDER BY gir.Creation_Time DESC`

	rows, err := dbHandler.DB.Query(statement, StatusPending, ownerID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch join requests: %w", err)
	}
	defer rows.Close()

	var requests []GroupInviteDisplay
	for rows.Next() {
		var invite GroupInviteDisplay
		err := rows.Scan(&invite.InviteID, &invite.GroupID, &invite.GroupTitle, &invite.InviterID, &invite.InviteeID, &invite.StatusID, &invite.CreationTime)
		if err != nil {
			return nil, fmt.Errorf("failed to scan join request: %w", err)
		}
		requests = append(requests, invite)
	}
	return requests, nil
}

func GetGroupInviteByID(inviteID int) (GroupInvite, error) {
	var invite GroupInvite
	err := dbHandler.DB.QueryRow(`
		SELECT Invite_Request_ID, Group_ID, Inviter_ID, Invitee_ID, Status_ID, Creation_Time
		FROM Group_Invite_Requests
		WHERE Invite_Request_ID = ?
	`, inviteID).Scan(&invite.InviteID, &invite.GroupID, &invite.InviterID, &invite.InviteeID, &invite.StatusID, &invite.CreationTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return GroupInvite{}, fmt.Errorf("invite not found")
		}
		return GroupInvite{}, fmt.Errorf("failed to fetch invite: %w", err)
	}
	return invite, nil
}

func UpdateGroupInviteStatus(inviteID, actingUserID, statusID int) (GroupInvite, error) {
	invite, err := GetGroupInviteByID(inviteID)
	if err != nil {
		return GroupInvite{}, err
	}
	if invite.StatusID != StatusPending {
		return GroupInvite{}, fmt.Errorf("invite already processed")
	}
	if actingUserID != invite.InviteeID {
		return GroupInvite{}, fmt.Errorf("not authorized to update this invite")
	}

	statement := `UPDATE Group_Invite_Requests
		SET Status_ID = ?, Last_Updated_By_ID = ?, Last_Updated_Time = ?
		WHERE Invite_Request_ID = ?`

	now := formattedNow()
	_, err = dbHandler.DB.Exec(statement, statusID, actingUserID, now, inviteID)
	if err != nil {
		return GroupInvite{}, fmt.Errorf("failed to update invite: %w", err)
	}

	invite.StatusID = statusID
	return invite, nil
}

func CreateGroupJoinRequest(groupID, requesterID int) (int, error) {
	ownerID, err := GetGroupOwnerID(groupID)
	if err != nil {
		return 0, err
	}
	return CreateGroupInvite(groupID, requesterID, ownerID)
}
