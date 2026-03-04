CREATE TABLE Users
(
  User_ID       INTEGER NOT NULL,
  User_Name     VARCHAR(255) NOT NULL UNIQUE CHECK (length(User_Name) >= 3 AND length(User_Name) <= 15),
  Nick_Name      VARCHAR(255) NOT NULL UNIQUE CHECK (length(Nick_Name) >= 3 AND length(Nick_Name) <= 15),
  Password      BLOB    NOT NULL CHECK (length(Password) <= 128),
  Email         TEXT NOT NULL CHECK (length(Email) <= 254),
  First_Name    TEXT NOT NULL CHECK (length(First_Name) <= 20),
  Last_Name     TEXT NOT NULL CHECK (length(Last_Name) <= 20),
  Date_of_Birth DATE    NOT NULL,
  Gender TEXT NOT NULL CHECK (Gender IN ('M', 'F')),
  Image_ID  INTEGER NOT NULL,
  About_Me      TEXT    CHECK (length(About_Me) <= 512),
  Profile_Type_ID INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (User_ID AUTOINCREMENT),
  FOREIGN KEY (Profile_Type_ID) REFERENCES Profile_Types (Profile_Type_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);
