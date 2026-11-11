export interface ChunkOptions {
  size: number;
  overlap: number;
}

const DEFAULT_OPTIONS: ChunkOptions = { size: 1_000, overlap: 150 };

// Splits text into chunks of at most `size` characters, preferring to cut
// at paragraph, line and sentence boundaries. Consecutive chunks share
// `overlap` characters so a fact split across a boundary stays findable.
export function chunkText(
  text: string,
  { size, overlap }: ChunkOptions = DEFAULT_OPTIONS,
): string[] {
  const normalized = text
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + size, normalized.length);

    if (end < normalized.length) {
      end = findBreak(normalized, start + Math.floor(size / 2), end);
    }

    const chunk = normalized.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

export function mergeChunks(
  chunks: string[],
  { overlap }: Pick<ChunkOptions, 'overlap'> = DEFAULT_OPTIONS,
): string {
  return chunks.reduce((text, chunk) => {
    if (!text) {
      return chunk;
    }

    const shared = sharedLength(text, chunk, overlap);
    return shared > 0 ? text + chunk.slice(shared) : `${text}\n\n${chunk}`;
  }, '');
}

function sharedLength(text: string, next: string, overlap: number): number {
  for (
    let length = Math.min(overlap, text.length, next.length);
    length > 0;
    length--
  ) {
    if (text.endsWith(next.slice(0, length))) {
      return length;
    }
  }

  return 0;
}

// The last natural break between `min` and `max`, or `max` if there is none.
function findBreak(text: string, min: number, max: number): number {
  for (const separator of ['\n\n', '\n', '. ', ' ']) {
    const index = text.lastIndexOf(separator, max - separator.length);

    if (index >= min) {
      return index + separator.length;
    }
  }

  return max;
}
