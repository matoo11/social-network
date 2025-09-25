CREATE TABLE Profile_Types
(
  Profile_Type_ID INTEGER NOT NULL,
  Profile_Type_Name    VARCHAR(50) NOT NULL UNIQUE CHECK (length(Profile_Type_Name) <= 50),
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Profile_Type_ID AUTOINCREMENT)
);

CREATE TABLE Image_Usage_Types
(
  Image_Usage_Type_ID INTEGER NOT NULL,
  Image_Usage_Type_Name VARCHAR(50) NOT NULL UNIQUE CHECK (length(Image_Usage_Type_Name) <= 50),
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Image_Usage_Type_ID AUTOINCREMENT)
);

CREATE TABLE Images
(
  Image_ID        INTEGER NOT NULL,
  Image_Reference INTEGER NOT NULL,
  Image_Data      BLOB    NOT NULL,
  Image_Filename  VARCHAR(255) NOT NULL,
  Image_Mimetype  VARCHAR(100) NOT NULL,
  Image_Width     VARCHAR(50) NULL    ,
  Image_Height    INTEGER NULL    ,
  Image_Size      INTEGER NULL    ,
  Image_Usage_Type_ID   INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Image_ID AUTOINCREMENT),
  FOREIGN KEY (Image_Usage_Type_ID) REFERENCES Image_Usage_Types (Image_Usage_Type_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CHECK (length(Image_Filename) <= 255),
  CHECK (length(Image_Mimetype) <= 100)
);

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

CREATE TABLE Follow_Requests
(
  Request_ID INTEGER NOT NULL,
  Requester_ID INTEGER NOT NULL,
  Receiver_ID     INTEGER NOT NULL,
  Status_ID      INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Request_ID AUTOINCREMENT),
  FOREIGN KEY (Requester_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Receiver_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Status_ID) REFERENCES Statuses (Status_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Statuses
(
  Status_ID INTEGER NOT NULL,
  Status_Name VARCHAR(50) NOT NULL UNIQUE CHECK (length(Status_Name) <= 50),
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Status_ID AUTOINCREMENT)
);

CREATE TABLE Post_Types
(
  Post_Type_ID INTEGER NOT NULL,
  Post_Type_Name VARCHAR(50) NOT NULL UNIQUE CHECK (length(Post_Type_Name) <= 50),
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Post_Type_ID AUTOINCREMENT)
);

CREATE TABLE Posts
(
  Post_ID   INTEGER NOT NULL,
  Post_Title TEXT NOT NULL CHECK (length(Post_Title) <= 30),
  Post_Text TEXT NOT NULL CHECK (length(Post_Text) <= 2000),
  User_ID   INTEGER NOT NULL,
  Post_Type_ID INTEGER NOT NULL,
  Image_ID  INTEGER DEFAULT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Post_ID AUTOINCREMENT),
  FOREIGN KEY (User_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Post_Type_ID) REFERENCES Post_Types (Post_Type_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Image_ID) REFERENCES Images (Image_ID)
    ON UPDATE CASCADE ON DELETE SET DEFAULT
);

--remove the post-type table and make it as a field

CREATE TABLE Private_Posts_Users
(
  Post_ID INTEGER NOT NULL,
  User_ID INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Post_ID, User_ID),
  FOREIGN KEY (Post_ID) REFERENCES Posts (Post_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (User_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Comments
(
  Comment_ID   INTEGER NOT NULL,
  Comment_Text TEXT NOT NULL CHECK (length(Comment_Text) <= 1000),
  Post_ID      INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Comment_ID AUTOINCREMENT),
  FOREIGN KEY (Post_ID) REFERENCES Posts (Post_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CHECK (length(Comment_Text) <= 1000)
);

CREATE TABLE Post_Likes
(
  Post_Like_ID INTEGER NOT NULL,
  Post_Like    BOOL    NULL    ,
  User_ID      INTEGER NOT NULL,
  Post_ID      INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Post_Like_ID AUTOINCREMENT),
  FOREIGN KEY (User_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Post_ID) REFERENCES Posts (Post_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT unique_user_post UNIQUE (User_ID, Post_ID)
);

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

CREATE TABLE Group_Users
(
  Group_ID INTEGER NOT NULL,
  User_ID  INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Group_ID, User_ID),
  FOREIGN KEY (Group_ID) REFERENCES User_Groups (Group_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (User_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Group_Invite_Requests
(
  Invite_Request_ID INTEGER NOT NULL,
  Group_ID INTEGER NOT NULL,
  Inviter_ID INTEGER NOT NULL,
  Invitee_ID INTEGER NOT NULL,
  Status_ID      INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Invite_Request_ID AUTOINCREMENT),
  FOREIGN KEY (Group_ID) REFERENCES User_Groups (Group_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Inviter_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Invitee_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Status_ID) REFERENCES Statuses (Status_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);

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

CREATE TABLE Event_Options
(
  Event_Option_ID INTEGER NOT NULL,
  Event_Option_Name     TEXT    NOT NULL CHECK (length(Event_Option_Name) <= 100),
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Event_Option_ID AUTOINCREMENT)
);

CREATE TABLE Events_Users_Options
(
  Event_ID INTEGER NOT NULL,
  User_ID  INTEGER NOT NULL,
  Event_Option_ID INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Event_ID, User_ID),
  FOREIGN KEY (Event_ID) REFERENCES Events (Event_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Event_Option_ID) REFERENCES Event_Options (Event_Option_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (User_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Group_Posts
(
  Group_Post_ID INTEGER NOT NULL,
  Post_ID INTEGER NOT NULL,
  Group_ID INTEGER NOT NULL,
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Group_Post_ID AUTOINCREMENT),
  FOREIGN KEY (Post_ID) REFERENCES Posts (Post_ID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Group_ID) REFERENCES User_Groups (Group_ID)
    ON UPDATE CASCADE ON DELETE CASCADE
);

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

CREATE TABLE Notification_Types
(
  Notification_Type_ID INTEGER NOT NULL,
  Notification_Type_Name VARCHAR(50) NOT NULL UNIQUE CHECK (length(Notification_Type_Name) <= 50),
  Created_By_ID      INTEGER  NOT NULL,
  Creation_Time      DATETIME NOT NULL,
  Last_Updated_By_ID INTEGER  NOT NULL,
  Last_Updated_Time  DATETIME NOT NULL,
  Is_Active          BOOL     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (Notification_Type_ID AUTOINCREMENT)
);

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
  FOREIGN KEY (Source_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (Target_ID) REFERENCES Users (User_ID)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (Notification_Type_ID) REFERENCES Notification_Types (Notification_Type_ID)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

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

INSERT INTO Profile_Types (Profile_Type_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Public', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Private', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);

INSERT INTO Post_Types (Post_Type_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Public', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Almost Private', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Private', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);

INSERT INTO Image_Usage_Types (Image_Usage_Type_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Profile Image', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Post Image', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Post Image', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Profile Image', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);

INSERT INTO Statuses (Status_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Pending', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Accepted', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Rejected', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);

INSERT INTO Notification_Types (Notification_Type_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Private Message', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Message', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Follow Request', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Follow Accepted', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Follow Rejected', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Invite', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Invite Accepted', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Invite Rejected', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Event Invitation', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);   

INSERT INTO EVENT_OPTIONS (Event_Option_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Going', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Not Going', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);
