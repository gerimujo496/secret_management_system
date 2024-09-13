-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "confirmation_token" TEXT,
ADD COLUMN     "two_fa_secret" TEXT;
