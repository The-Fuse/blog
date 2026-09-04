import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import type { Block } from "../lib/types";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function b(type: Block["type"], text: string, extra: Partial<Block> = {}): Block {
  return { id: crypto.randomUUID(), type, text, ...extra };
}

const berkeley: Block[] = [
  b("chapter", "The whole system turns on one distinction", { label: "How to read this" }),
  b("note", "PHK = Principles of Human Knowledge. DHP = Three Dialogues. NTV = New Theory of Vision.", { label: "Citation style" }),
  b("note", "Hylas, from hylē, matter. Philonous, lover of mind. The outcome is encoded in the cast list.", { label: "Names" }),
  b("lede", "Berkeley divides everything that exists into two, and only two, kinds: things that are perceived and things that perceive. Ideas are wholly passive and exist only in being perceived. Spirits are wholly active, and exist in perceiving and willing. There is no third category, and — this is the crucial move — nothing can belong to both."),
  b("p", "Every plate in this document encodes that division the same way, so you can read the structure of an argument before you read its words: {idea:ideas are filled} {spirit:spirits are outlined} {matter:matter is dashed}."),
  b("plate", "Keep this in view. When a **filled** shape is drawn causing something, an error has been made: ideas are inert, so an idea can never sit at the tail of a causal arrow.", { label: "Plate II · Legend" }),
  b("key", "Berkeley denies *matter*; he does not deny *bodies*. He denies that sensible things exist unperceived; he does not deny that they exist unperceived *by me*. Almost every bad answer comes from blurring one of these pairs.", { label: "The single sentence to memorise" }),
  b("h3", "What each chapter is for"),
  b("p", "Chapters III–IV are diagnostic. Chapter V states the thesis. You should be able to run each line of argument without leaning on the others, since examiners like to ask whether they stand or fall together."),
  b("p", "Read the plates first, the prose second, the marginal notes last. The margin is apparatus, not argument.^[The convention follows the Luce–Jessop edition. Marginal notes never introduce a claim the body does not make.]"),
  b("chapter", "Try to conceive a tree unconceived", { label: "The master argument" }),
  b("note", "PHK §§22–23; DHP I. The name is Gallois's (1974), not Berkeley's.", { label: "Source" }),
  b("lede", "Berkeley says he is willing to rest the whole matter on a single challenge. Conceive of a sensible thing existing without any mind perceiving it. If you can, he will grant the materialist everything."),
  b("quote", "“But say you, surely there is nothing easier than to imagine trees in a park, or books in a closet, and nobody by to perceive them. I answer, you may so — but what is all this, I beseech you, more than framing in your mind certain ideas?”", { cite: "Principles §23" }),
  b("h3", "The argument as steps"),
  b("steps", "P1 To conceive a tree existing unperceived, I must form an idea of the tree.\nP2 But in forming the idea I perceive it; so the tree, as conceived, is perceived.\nP3 Therefore no one can conceive a sensible thing existing unperceived.\n∴ The notion of unperceived sensible existence is not merely false but inconceivable."),
  b("warn", "The argument does not show that trees cannot exist unconceived. At most it shows that *you* cannot conceive one doing so — and the step from the second to the first is exactly what is in dispute.", { label: "Common error" }),
  b("chapter", "The world as a lazy data structure", { label: "A technical aside" }),
  b("note", "The same format carries technical writing. Code slots into the same column.", { label: "Why this is here" }),
  b("lede", "A useful, if anachronistic, model: sensible things are not stored objects but values produced on demand by a perceiver's query. Nothing exists in the cache between reads."),
  b("code", "// esse est percipi, as a getter\nconst cherry = {\n  get redness()  { return perceive(\"sight\") },\n  get tartness() { return perceive(\"taste\") },\n};\n// there is no cherry.itself — only the getters"),
];

const lazy: Block[] = [
  b("chapter", "Getters, caches and idealism", { label: "Model" }),
  b("lede", "Sensible things are not stored objects but values produced on demand."),
  b("code", "const cherry = {\n  get redness() { return perceive(\"sight\") },\n};"),
  b("p", "There is no `cherry.itself` sitting behind the getters. The object *is* the set of queries a perceiver can make."),
];

const hume: Block[] = [
  b("lede", ""),
];

const consensus: Block[] = [
  b("chapter", "What “before” means", { label: "Clocks" }),
  b("lede", "What does it mean for one event to happen before another when no two machines agree on the time?"),
  b("p", "Lamport clocks and vector clocks are two answers. Neither restores a global now; both restore a usable *before*."),
];

const locke: Block[] = [
  b("chapter", "The veil", { label: "Locke" }),
  b("lede", "Representation, resemblance, and the sceptical gap: Locke's ideas stand between us and the world they are meant to copy."),
  b("key", "If the copy is checked against an original we never see, scepticism is a standing risk.", { label: "The gap" }),
];

async function main() {
  await prisma.article.deleteMany();
  await prisma.article.createMany({
    data: [
      {
        slug: "george-berkeley-esse-est-percipi",
        title: "George Berkeley: esse est percipi",
        kicker: "The whole system in four words",
        dek: "An illustrated study edition. Eighteen chapters, twenty-two plates, and the whole system in four words.",
        topic: "Philosophy",
        status: "published",
        featured: true,
        publishDate: new Date("2026-09-04"),
        leadPlateCaption: "Plate I · The cherry. Take away softness, moisture, redness, tartness — and you take away the cherry.",
        blocks: berkeley,
      },
      {
        slug: "the-world-as-a-lazy-data-structure",
        title: "The world as a lazy data structure",
        dek: "Getters, caches and idealism — an anachronistic model",
        topic: "Technical",
        status: "published",
        featured: false,
        publishDate: new Date("2026-08-22"),
        blocks: lazy,
      },
      {
        slug: "hume-on-causation",
        title: "Hume on causation",
        dek: "Constant conjunction and the habit of the mind",
        topic: "Philosophy",
        status: "draft",
        featured: false,
        publishDate: new Date("2026-08-30"),
        blocks: hume,
      },
      {
        slug: "consensus-without-a-clock",
        title: "Consensus without a clock",
        dek: "Lamport, vector clocks, and what \"before\" means",
        topic: "Technical",
        status: "published",
        featured: false,
        publishDate: new Date("2026-06-11"),
        blocks: consensus,
      },
      {
        slug: "locke-and-the-veil-of-perception",
        title: "Locke and the veil of perception",
        dek: "Representation, resemblance, and the sceptical gap",
        topic: "Philosophy",
        status: "published",
        featured: false,
        publishDate: new Date("2026-05-14"),
        blocks: locke,
      },
      {
        slug: "why-the-calculus-worried-berkeley",
        title: "Why the calculus worried Berkeley",
        dek: "The Analyst, fluxions and the ghosts of departed quantities",
        topic: "Technical",
        status: "published",
        featured: false,
        publishDate: new Date("2026-04-08"),
        blocks: [
          b("lede", "Berkeley's attack on fluxions is often read as crankish. Read slowly, it is a demand that a proof not traffic in quantities that vanish the moment they are needed."),
        ],
      },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
