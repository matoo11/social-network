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

INSERT INTO Statuses (Status_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Pending', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Accepted', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Rejected', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);
