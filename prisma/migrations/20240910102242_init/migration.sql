/*
  Warnings:

  - You are about to drop the `SecretsShare` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SecretsShare" DROP CONSTRAINT "SecretsShare_account_giver_id_fkey";

-- DropForeignKey
ALTER TABLE "SecretsShare" DROP CONSTRAINT "SecretsShare_account_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "SecretsShare" DROP CONSTRAINT "SecretsShare_secret_id_fkey";

-- DropTable
DROP TABLE "SecretsShare";

-- CreateTable
CREATE TABLE "Secrets_share" (
    "id" SERIAL NOT NULL,
    "expiration_time" TIMESTAMP(3) NOT NULL,
    "account_giver_id" INTEGER NOT NULL,
    "account_receiver_id" INTEGER NOT NULL,
    "number_of_tries" INTEGER NOT NULL,
    "passcode" INTEGER NOT NULL,
    "is_accepted" BOOLEAN NOT NULL,
    "secret_id" INTEGER NOT NULL,

    CONSTRAINT "Secrets_share_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Secrets_share" ADD CONSTRAINT "Secrets_share_account_giver_id_fkey" FOREIGN KEY ("account_giver_id") REFERENCES "Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secrets_share" ADD CONSTRAINT "Secrets_share_account_receiver_id_fkey" FOREIGN KEY ("account_receiver_id") REFERENCES "Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secrets_share" ADD CONSTRAINT "Secrets_share_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "Secrets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
