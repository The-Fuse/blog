// Topics are free text. These are only suggestions shown when no articles exist yet.
export const DEFAULT_TOPICS = ["Philosophy", "Technical"];
export type Topic = string;

export const STATUSES = ["draft", "published"] as const;
export type Status = (typeof STATUSES)[number];

export const BLOCK_TYPES = [
  "chapter",
  "lede",
  "p",
  "h3",
  "quote",
  "key",
  "warn",
  "exam",
  "steps",
  "list",
  "plate",
  "code",
  "table",
  "note",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export type Block = {
  id: string;
  type: BlockType;
  text: string;
  label?: string;
  cite?: string;
  imageUrl?: string;
};

export type ArticleDTO = {
  id: string;
  slug: string;
  kicker: string;
  title: string;
  dek: string;
  topic: Topic;
  status: Status;
  featured: boolean;
  publishDate: string;
  updatedAt: string;
  author: string;
  leadPlateUrl: string | null;
  leadPlateCaption: string;
  blocks: Block[];
};

/** Everything about an article except its body. Used for lists, feeds and navigation. */
export type ArticleSummary = Omit<ArticleDTO, "blocks"> & { words: number; minutes: number };

export type ArticleInput = {
  kicker?: string;
  title?: string;
  dek?: string;
  topic?: Topic;
  status?: Status;
  featured?: boolean;
  publishDate?: string;
  author?: string;
  leadPlateUrl?: string | null;
  leadPlateCaption?: string;
  blocks?: Block[];
  /** The updatedAt the editor last saw. If the article has changed since, the save is refused (409). */
  expectedUpdatedAt?: string;
};
