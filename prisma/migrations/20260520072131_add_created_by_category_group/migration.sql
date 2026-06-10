-- AlterTable
ALTER TABLE "CategoryGroup" ADD COLUMN     "createdById" TEXT;

-- CreateIndex
CREATE INDEX "CategoryGroup_createdById_idx" ON "CategoryGroup"("createdById");

-- AddForeignKey
ALTER TABLE "CategoryGroup" ADD CONSTRAINT "CategoryGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
