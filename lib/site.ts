import { prisma } from "./db";

export type SiteDTO = {
  aboutHeading: string;
  aboutText: string;
  aboutNote: string;
  contactEmail: string;
};

export type SiteInput = Partial<SiteDTO>;

/** The single settings row, created with defaults on first read. */
export async function getSite(): Promise<SiteDTO> {
  const row = await prisma.site.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
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
