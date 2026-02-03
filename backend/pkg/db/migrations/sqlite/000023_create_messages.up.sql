CREATE TABLE Messages 
(
  Message_ID    INTEGER NOT NULL,
  Message_Text  TEXT NOT NULL CHECK (length(Message_Text) <= 2000 AND length(Message_Text) > 0),
  Sender_ID     INTEGER NOT NULL,
  Receiver_ID   INTEGER NOT NULL,
  Is_Read       BOOL NOT NULL DEFAULT FALSE,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Message_ID AUTOINCREMENT),
  FOREIGN KEY (Sender_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Receiver_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);
