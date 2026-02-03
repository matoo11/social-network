CREATE TABLE Followers
(
  Follower_ID INTEGER NOT NULL,
  Followed_ID     INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Follower_ID, followed_ID),
  FOREIGN KEY (Follower_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Followed_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);
