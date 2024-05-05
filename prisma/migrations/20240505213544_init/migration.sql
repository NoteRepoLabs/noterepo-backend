/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Verification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Verification" DROP CONSTRAINT "Verification_userId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Verification_userId_key" ON "Verification"("userId");
