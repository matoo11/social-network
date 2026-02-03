CREATE TABLE Group_Comments
(
  Group_Comment_ID INTEGER NOT NULL,
  Comment_Text TEXT NOT NULL CHECK (length(Comment_Text) <= 1000),
  Group_Post_ID INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Group_Comment_ID AUTOINCREMENT),
  FOREIGN KEY (Group_Post_ID) REFERENCES Group_Posts (Group_Post_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CHECK (length(Comment_Text) <= 1000)
);
