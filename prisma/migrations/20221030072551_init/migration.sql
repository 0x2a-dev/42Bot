/*
  Warnings:

  - You are about to alter the column `tkn_creation` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ft_id" INTEGER NOT NULL,
    "wafrom" TEXT NOT NULL,
    "tkn_creation" INTEGER,
    "login" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "full_name" TEXT,
    "displayname" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "campusID" INTEGER,
    "campusName" TEXT,
    "phone" TEXT
);
INSERT INTO "new_User" ("accessToken", "campusID", "campusName", "displayname", "first_name", "ft_id", "full_name", "id", "last_name", "login", "phone", "refreshToken", "tkn_creation", "wafrom") SELECT "accessToken", "campusID", "campusName", "displayname", "first_name", "ft_id", "full_name", "id", "last_name", "login", "phone", "refreshToken", "tkn_creation", "wafrom" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_ft_id_key" ON "User"("ft_id");
CREATE UNIQUE INDEX "User_wafrom_key" ON "User"("wafrom");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
