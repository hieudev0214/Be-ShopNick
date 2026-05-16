/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `bindInfo` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `contactNote` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `displayCode` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `displayPasswordHint` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `displayUsername` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `extraInfo` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `loginType` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `rejectReason` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `soldAt` on the `GameAccount` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `GameAccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productCode]` on the table `GameAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productCode` to the `GameAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `GameAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "GameAccount_approvalStatus_idx";

-- DropIndex
DROP INDEX "GameAccount_code_key";

-- AlterTable
ALTER TABLE "GameAccount" DROP COLUMN "approvedAt",
DROP COLUMN "approvedBy",
DROP COLUMN "bindInfo",
DROP COLUMN "code",
DROP COLUMN "contactNote",
DROP COLUMN "displayCode",
DROP COLUMN "displayPasswordHint",
DROP COLUMN "displayUsername",
DROP COLUMN "extraInfo",
DROP COLUMN "loginType",
DROP COLUMN "originalPrice",
DROP COLUMN "rejectReason",
DROP COLUMN "soldAt",
DROP COLUMN "title",
ADD COLUMN     "accountInfo" TEXT,
ADD COLUMN     "categoryGroup" TEXT,
ADD COLUMN     "detailInfo" TEXT,
ADD COLUMN     "discountPercent" INTEGER DEFAULT 0,
ADD COLUMN     "productCode" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "productType" TEXT DEFAULT 'Mặc định',
ADD COLUMN     "salePrice" DECIMAL(15,2);

-- CreateIndex
CREATE UNIQUE INDEX "GameAccount_productCode_key" ON "GameAccount"("productCode");
