/*
  Warnings:

  - You are about to drop the column `tag` on the `Repo` table. All the data in the column will be lost.
  - You are about to drop the column `repoIds` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Repo" DROP COLUMN "tag";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "repoIds";

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repoId" INTEGER NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "tags" TEXT[],
    "repoId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_repoId_key" ON "Tag"("repoId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
