/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `CategoryGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CategoryGroup_slug_key" ON "CategoryGroup"("slug");
