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

INSERT INTO Image_Usage_Types (Image_Usage_Type_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Profile Image', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Post Image', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Post Image', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Group Profile Image', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);
