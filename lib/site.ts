import { prisma } from "./db";

export type SiteDTO = {
  aboutHeading: string;
  aboutText: string;
  aboutNote: string;
  contactEmail: string;
};

export type SiteInput = Partial<SiteDTO>;

const DEFAULTS: SiteDTO = {
  aboutHeading: "About",
  aboutText: "Long-form study editions of philosophers and of technical ideas — arguments set out as arguments, with every diagram drawn in one visual grammar.",
  aboutNote: "New edition roughly every month.",
  contactEmail: "",
};

/** The single settings row, or the defaults if it has never been saved. Read-only: never writes. */
export async function getSite(): Promise<SiteDTO> {
  const row = await prisma.site.findUnique({ where: { id: 1 } });
  if (!row) return DEFAULTS;
  return { aboutHeading: row.aboutHeading, aboutText: row.aboutText, aboutNote: row.aboutNote, contactEmail: row.contactEmail };
}

export async function updateSite(input: SiteInput): Promise<SiteDTO> {
  const clean = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
  const row = await prisma.site.upsert({
    where: { id: 1 },
    update: {
      aboutHeading: clean(input.aboutHeading, 80),
      aboutText: clean(input.aboutText),
      aboutNote: clean(input.aboutNote, 400),
      contactEmail: clean(input.contactEmail, 200),
    },
    create: { id: 1 },
  });
  return { aboutHeading: row.aboutHeading, aboutText: row.aboutText, aboutNote: row.aboutNote, contactEmail: row.contactEmail };
}
