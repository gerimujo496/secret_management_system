-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isConfirmed" DROP NOT NULL,
ALTER COLUMN "isConfirmed" DROP DEFAULT;
