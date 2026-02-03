CREATE TABLE Events
(
  Event_ID   INTEGER NOT NULL,
  Event_Title VARCHAR(100) NOT NULL UNIQUE CHECK (length(Event_Title) <= 100),
  Event_Description TEXT CHECK (length(Event_Description) <= 500),
  Event_Time DATETIME NOT NULL,
  User_ID     INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Event_ID AUTOINCREMENT),
  FOREIGN KEY (User_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);
