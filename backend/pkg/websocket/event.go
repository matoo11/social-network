package websocket

import (
	"encoding/json"
	"fmt"
	"social/backend/pkg/db/dbConn"
)

type EventResponse struct {
	EventID  int    `json:"eventId"`
	GroupID  int    `json:"groupId"`
	UserID   int    `json:"userId"`
	UserName string `json:"userName"`
	OptionID int    `json:"optionId"`
	Option   string `json:"option"`
}

func SendEventResponse(eventID, groupID, userID, optionID int, userName, optionName string) {

	groupMembers, err := dbConn.GetGroupMembers(groupID)
	if err != nil {
		fmt.Println("Error getting group members for event response:", err)
		return
	}

	eventResponse := EventResponse{
		EventID:  eventID,
		GroupID:  groupID,
		UserID:   userID,
		UserName: userName,
		OptionID: optionID,
		Option:   optionName,
	}

	responseData, err := json.Marshal(eventResponse)
	if err != nil {
		fmt.Println("Error marshaling event response:", err)
		return
	}

	res := Response{
		Type: "event_response",
		Data: responseData,
	}

	for _, member := range groupMembers {
		memberConn := GetClientConn(member.UserID)
		if memberConn != nil {
			memberConn.Lock.Lock()
			if err := memberConn.Conn.WriteJSON(res); err != nil {
				fmt.Printf("Error sending event response to user %d: %v\n", member.UserID, err)
			}
			memberConn.Lock.Unlock()
		}
	}
	fmt.Printf("Event response broadcasted to %d group members\n", len(groupMembers))
}
