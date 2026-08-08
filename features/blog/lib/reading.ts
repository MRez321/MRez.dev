import { slugify } from "./slug";

/**
 * Content metrics + heading extraction for the reading experience.
 * Pure functions — safe to import from client components.
 */

const CODE_FENCE = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`]*`/g;
const IMAGE = /!\[[^\]]*\]\([^)]*\)/g;
const LINK = /\[([^\]]*)\]\([^)]*\)/g;
const MARKDOWN_NOISE = /[#>*_~|]/g;

export function countWords(content: string): number {
  const text = content
    .replace(CODE_FENCE, " ")
    .replace(INLINE_CODE, " ")
    .replace(IMAGE, " ")
    .replace(LINK, "$1")
    .replace(MARKDOWN_NOISE, " ");
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Rough reading time at 200 wpm, minimum 1 minute. */
export function readingTimeMinutes(content: string): number {
  return Math.max(1, Math.round(countWords(content) / 200));
}

export type TocHeading = { id: string; text: string; level: 2 | 3 };

/**
 * h2/h3 outline matching the ids rehype-slug generates (GitHub-style),
 * including the -2, -3… dedupe suffix for repeated headings.
 */
export function extractHeadings(content: string): TocHeading[] {
  const seen = new Map<string, number>();
  const headings: TocHeading[] = [];

  for (const line of content.split("\n")) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    const level = match[1].length as 2 | 3;
    const text = match[2]
      .replace(LINK, "$1")
      .replace(/[*_`~]/g, "")
      .trim();
    if (!text) continue;

    let id = slugify(text);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;

    headings.push({ id, text, level });
  }

  return headings;
}
