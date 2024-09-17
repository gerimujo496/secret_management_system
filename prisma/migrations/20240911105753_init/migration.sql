-- DropForeignKey
ALTER TABLE "Account_secrets" DROP CONSTRAINT "Account_secrets_account_id_fkey";

-- DropForeignKey
ALTER TABLE "Account_secrets" DROP CONSTRAINT "Account_secrets_secret_id_fkey";

-- AddForeignKey
ALTER TABLE "Account_secrets" ADD CONSTRAINT "Account_secrets_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account_secrets" ADD CONSTRAINT "Account_secrets_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "Secrets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
