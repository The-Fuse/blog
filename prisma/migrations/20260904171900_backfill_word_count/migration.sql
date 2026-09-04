-- Fill wordCount for rows saved before the column existed. Mirrors lib/format.ts articleStats:
-- words in title, subtitle and every block's text, split on whitespace.
UPDATE "Article" a
SET "wordCount" = COALESCE(
  array_length(
    regexp_split_to_array(
      btrim(regexp_replace(
        a.title || ' ' || a.dek || ' ' || COALESCE((
          SELECT string_agg(COALESCE(b->>'text', ''), ' ')
          FROM jsonb_array_elements(a.blocks::jsonb) AS b
        ), ''),
        '\s+', ' ', 'g'
      )),
      ' '
    ),
    1
  ),
  0
)
WHERE a."wordCount" = 0;
