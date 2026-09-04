-- CreateIndex
CREATE INDEX "Article_status_publishDate_idx" ON "Article"("status", "publishDate");

-- CreateIndex
CREATE INDEX "Article_updatedAt_idx" ON "Article"("updatedAt");
