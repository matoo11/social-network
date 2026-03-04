CREATE TABLE Group_Messages 
(
  Group_Message_ID    INTEGER NOT NULL,
  Message_Text  TEXT NOT NULL CHECK (length(Message_Text) <= 2000 AND length(Message_Text) > 0),
  Sender_ID     INTEGER NOT NULL,
  Group_ID      INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Group_Message_ID AUTOINCREMENT),
  FOREIGN KEY (Sender_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Group_ID) REFERENCES User_Groups (Group_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);
