CREATE TABLE Sessions
(
  Session_ID    TEXT   NOT NULL,
  Expiry_Time  DATETIME NOT NULL,
  User_ID       INTEGER   NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Session_ID),
  FOREIGN KEY (User_ID) REFERENCES Users (User_ID) ON UPDATE CASCADE ON DELETE CASCADE
);
