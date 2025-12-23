-- AlterTable
ALTER TABLE "users" ADD COLUMN     "leave_balance" INTEGER NOT NULL DEFAULT 14;

-- CreateIndex
CREATE INDEX "attendances_status_created_at_user_id_idx" ON "attendances"("status", "created_at", "user_id");

-- CreateIndex
CREATE INDEX "users_full_name_idx" ON "users"("full_name");
