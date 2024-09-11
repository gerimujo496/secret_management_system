/*
  Warnings:

  - You are about to drop the column `created_at` on the `Roles` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Roles` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Roles" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at";
