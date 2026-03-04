CREATE TABLE Notification_Types
(
  Notification_Type_ID INTEGER NOT NULL,
  Notification_Type_Name VARCHAR(50) NOT NULL UNIQUE CHECK (length(Notification_Type_Name) <= 50),
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Notification_Type_ID AUTOINCREMENT)
);

INSERT INTO Notification_Types (Notification_Type_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Private Message', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Message', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Follow Request', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Follow Accepted', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Follow Rejected', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Invite', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Invite Accepted', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Invite Rejected', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Event Invitation', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Join Group Request', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);
