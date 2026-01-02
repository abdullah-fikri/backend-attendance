-- AlterTable
ALTER TABLE "users" ADD COLUMN     "leave_balance" INTEGER NOT NULL DEFAULT 14;

-- RenameIndex
ALTER INDEX "attendances_date_idx" RENAME TO "idx_attendances_date";

-- RenameIndex
ALTER INDEX "attendances_status_created_at_user_id_idx" RENAME TO "idx_attendances_status_created_at_user_id";

-- RenameIndex
ALTER INDEX "attendances_user_id_idx" RENAME TO "idx_attendances_user_id";

-- RenameIndex
ALTER INDEX "users_email_idx" RENAME TO "idx_users_email";

-- RenameIndex
ALTER INDEX "users_full_name_idx" RENAME TO "idx_users_full_name";
