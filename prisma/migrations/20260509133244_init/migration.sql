/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `yourService` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'TRIAL_EXPIRED', 'PAUSED_FOR_BILLING', 'BLOCKED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash",
DROP COLUMN "yourService",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "service" TEXT,
ADD COLUMN     "status" "UserStatus";
