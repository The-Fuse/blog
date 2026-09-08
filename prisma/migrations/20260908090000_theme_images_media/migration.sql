-- Dark-mode cover image (optional; the light image is used in both themes when empty).
ALTER TABLE "Article" ADD COLUMN "leadPlateDarkUrl" TEXT;

-- Media library: one row per uploaded image.
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT '',
    "size" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Media_url_key" ON "Media"("url");
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");
