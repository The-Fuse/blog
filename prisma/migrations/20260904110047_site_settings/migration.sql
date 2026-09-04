-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "author" SET DEFAULT 'Rohit Yadav';

-- CreateTable
CREATE TABLE "Site" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "aboutHeading" TEXT NOT NULL DEFAULT 'About',
    "aboutText" TEXT NOT NULL DEFAULT 'Long-form study editions of philosophers and of technical ideas — arguments set out as arguments, with every diagram drawn in one visual grammar.',
    "aboutNote" TEXT NOT NULL DEFAULT 'New edition roughly every month.',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);
