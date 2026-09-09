-- Default About text no longer calls the articles "study editions".
ALTER TABLE "Site" ALTER COLUMN "aboutText" SET DEFAULT 'Long-form essays on philosophers and on technical ideas — arguments set out as arguments, with every diagram drawn in one visual grammar.';
