-- CreateEnum
CREATE TYPE "CategoryGroupStatus" AS ENUM ('active', 'hidden');

-- AlterTable
ALTER TABLE "GameAccount" ADD COLUMN     "groupID" TEXT;

-- CreateTable
CREATE TABLE "CategoryGroup" (
    "id" TEXT NOT NULL,
    "gameID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "status" "CategoryGroupStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoryGroup_gameID_idx" ON "CategoryGroup"("gameID");

-- CreateIndex
CREATE INDEX "CategoryGroup_priority_idx" ON "CategoryGroup"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryGroup_gameID_slug_key" ON "CategoryGroup"("gameID", "slug");

-- CreateIndex
CREATE INDEX "Game_priority_idx" ON "Game"("priority");

-- CreateIndex
CREATE INDEX "GameAccount_groupID_idx" ON "GameAccount"("groupID");

-- AddForeignKey
ALTER TABLE "CategoryGroup" ADD CONSTRAINT "CategoryGroup_gameID_fkey" FOREIGN KEY ("gameID") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAccount" ADD CONSTRAINT "GameAccount_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "CategoryGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
