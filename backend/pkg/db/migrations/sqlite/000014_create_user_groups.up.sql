CREATE TABLE User_Groups
(
  Group_ID   INTEGER NOT NULL,
  Group_Title VARCHAR(100) NOT NULL UNIQUE CHECK (length(Group_Title) <= 100),
  Gruop_Description TEXT CHECK (length(Gruop_Description) <= 500),
  User_ID   INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Group_ID AUTOINCREMENT),
  FOREIGN KEY (User_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);
