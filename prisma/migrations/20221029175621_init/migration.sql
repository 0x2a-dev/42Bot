/*
  Warnings:

  - Added the required column `wafrom` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wafrom" TEXT NOT NULL,
    "login" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "displayname" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "campusID" INTEGER,
    "campusName" TEXT,
    "phone" TEXT
);
INSERT INTO "new_User" ("accessToken", "campusID", "campusName", "displayname", "first_name", "id", "last_name", "login", "phone", "refreshToken") SELECT "accessToken", "campusID", "campusName", "displayname", "first_name", "id", "last_name", "login", "phone", "refreshToken" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_wafrom_key" ON "User"("wafrom");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
