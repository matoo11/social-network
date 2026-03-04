CREATE TABLE Comment_Likes
(
  Comment_Like_ID INTEGER NOT NULL,
  Comment_Like    BOOL    NULL    ,
  Post_ID         INTEGER NOT NULL,
  User_ID         INTEGER NOT NULL,
  Comment_ID      INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Comment_Like_ID AUTOINCREMENT),
  FOREIGN KEY (Post_ID) REFERENCES Posts (Post_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (User_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Comment_ID) REFERENCES Comments (Comment_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT unique_user_post_comment UNIQUE (User_ID, Post_ID, Comment_ID)
);
