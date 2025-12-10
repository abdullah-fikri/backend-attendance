/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
DROP COLUMN "password",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "password_hash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
