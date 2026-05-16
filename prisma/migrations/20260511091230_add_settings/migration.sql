/*
  Warnings:

  - You are about to drop the column `heroCount` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `levelInfo` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `platformInfo` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `rankInfo` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `serverInfo` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `skinCount` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the `GameAccountSecret` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Game` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "GameAccountSecret" DROP CONSTRAINT "GameAccountSecret_accountID_fkey";

-- AlterTable
ALTER TABLE "GameAccount" DROP COLUMN "heroCount",
DROP COLUMN "levelInfo",
DROP COLUMN "platformInfo",
DROP COLUMN "rankInfo",
DROP COLUMN "serverInfo",
DROP COLUMN "skinCount",
ADD COLUMN     "contactNote" TEXT,
ADD COLUMN     "displayCode" TEXT,
ADD COLUMN     "displayPasswordHint" TEXT,
ADD COLUMN     "displayUsername" TEXT;

-- AlterTable
ALTER TABLE "GameAccountImage" ADD COLUMN     "publicId" TEXT;

-- DropTable
DROP TABLE "GameAccountSecret";

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "logo" TEXT,
    "banner" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");
