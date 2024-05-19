/*
  Warnings:

  - You are about to drop the column `bookmarkId` on the `Repo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Repo" DROP CONSTRAINT "Repo_bookmarkId_fkey";

-- AlterTable
ALTER TABLE "Repo" DROP COLUMN "bookmarkId",
ADD COLUMN     "bookmarked" BOOLEAN NOT NULL DEFAULT false;
