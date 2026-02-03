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

INSERT INTO EVENT_OPTIONS (Event_Option_Name, Created_By_ID, Creation_Time, Last_Updated_By_ID, Last_Updated_Time, Is_Active) VALUES
('Going', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1),
('Not Going', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1);
