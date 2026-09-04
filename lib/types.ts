export const TOPICS = ["Philosophy", "Technical"] as const;
export type Topic = (typeof TOPICS)[number];

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
  "plate",
  "code",
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
};
