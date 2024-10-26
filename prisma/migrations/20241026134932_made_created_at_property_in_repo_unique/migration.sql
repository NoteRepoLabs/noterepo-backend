/*
  Warnings:

  - A unique constraint covering the columns `[createdAt]` on the table `Repo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Repo_createdAt_key" ON "Repo"("createdAt");
