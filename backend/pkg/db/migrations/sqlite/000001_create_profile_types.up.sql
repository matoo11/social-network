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

INSERT INTO Profile_Types (Profile_Type_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Public', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Private', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);
