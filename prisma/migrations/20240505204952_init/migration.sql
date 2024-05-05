/*
  Warnings:

  - You are about to drop the column `verificationId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_verificationId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "verificationId";
