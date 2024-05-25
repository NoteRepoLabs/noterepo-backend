/*
  Warnings:

  - You are about to drop the column `repoIds` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `bookmarked` on the `Repo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,repoId]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `repoId` to the `Bookmark` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_repoId_fkey";

-- DropIndex
DROP INDEX "Bookmark_userId_key";

-- AlterTable
ALTER TABLE "Bookmark" DROP COLUMN "repoIds",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "repoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Repo" DROP COLUMN "bookmarked";

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_repoId_key" ON "Bookmark"("userId", "repoId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
