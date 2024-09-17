-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "confirmation_token" TEXT,
    "is_confirmed" BOOLEAN,
    "two_fa_secret" JSONB,
    "is_2fa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memberships" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "is_confirmed" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "role_name" "UserRoles" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accounts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Secrets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account_secrets" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "secret_id" INTEGER NOT NULL,

    CONSTRAINT "Account_secrets_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account_secrets" ADD CONSTRAINT "Account_secrets_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account_secrets" ADD CONSTRAINT "Account_secrets_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "Secrets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secrets_share" ADD CONSTRAINT "Secrets_share_account_giver_id_fkey" FOREIGN KEY ("account_giver_id") REFERENCES "Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secrets_share" ADD CONSTRAINT "Secrets_share_account_receiver_id_fkey" FOREIGN KEY ("account_receiver_id") REFERENCES "Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secrets_share" ADD CONSTRAINT "Secrets_share_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "Secrets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
