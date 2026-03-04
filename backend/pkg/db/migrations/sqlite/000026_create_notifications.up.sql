CREATE TABLE Notifications
(
  Notification_ID INTEGER NOT NULL,
  Notification_Text TEXT NOT NULL CHECK (length(Notification_Text) <= 255),
  Source_ID INTEGER NOT NULL,
  Target_ID INTEGER NOT NULL,
  Notification_Type_ID INTEGER NOT NULL,
  Is_Read       BOOL NOT NULL DEFAULT FALSE,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Notification_ID AUTOINCREMENT),
  FOREIGN KEY (Target_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (Notification_Type_ID) REFERENCES Notification_Types (Notification_Type_ID)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
