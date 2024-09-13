/*
  Warnings:

  - The `two_fa_secret` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "two_fa_secret",
ADD COLUMN     "two_fa_secret" JSONB;
