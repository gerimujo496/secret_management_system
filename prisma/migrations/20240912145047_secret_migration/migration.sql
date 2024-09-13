/*
  Warnings:

  - You are about to drop the column `TwoFaSecret` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "TwoFaSecret",
ADD COLUMN     "two_fa_secret" TEXT;
