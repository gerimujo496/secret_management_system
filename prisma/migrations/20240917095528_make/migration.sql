-- DropForeignKey
ALTER TABLE "Memberships" DROP CONSTRAINT "Memberships_user_id_fkey";

-- AlterTable
ALTER TABLE "Memberships" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Roles" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
