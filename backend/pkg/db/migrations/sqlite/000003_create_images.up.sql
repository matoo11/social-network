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
