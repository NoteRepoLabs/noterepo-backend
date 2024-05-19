/*
  Warnings:

  - You are about to drop the column `description` on the `File` table. All the data in the column will be lost.
  - Added the required column `urlLink` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "description",
ADD COLUMN     "urlLink" TEXT NOT NULL;
