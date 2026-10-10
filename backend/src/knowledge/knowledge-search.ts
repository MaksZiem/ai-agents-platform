import type { DocumentChunk } from './entities/document-chunk.entity.js';

export interface DocumentSearchHit {
  documentId: string;
  documentName: string;
  position: number;
  content: string;
  score: number;
}

const MIN_TERM_LENGTH = 3;
const MAX_TERMS = 8;

// Words worth searching for: lowercase, unique, without very short ones.
export function searchTerms(query: string): string[] {
  const words = query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

  return [
    ...new Set(words.filter((word) => word.length >= MIN_TERM_LENGTH)),
  ].slice(0, MAX_TERMS);
}

// Keyword relevance: every occurrence counts, and chunks matching more
// distinct terms rank higher. Embeddings can replace this later without
// changing the callers.
export function scoreChunk(content: string, terms: string[]): number {
  const text = content.toLowerCase();
  let occurrences = 0;
  let matchedTerms = 0;

  for (const term of terms) {
    const count = text.split(term).length - 1;
    occurrences += count;
    matchedTerms += count > 0 ? 1 : 0;
  }

  return occurrences + matchedTerms * 2;
}

export function rankChunks(
  chunks: (DocumentChunk & { document: { name: string } })[],
  terms: string[],
  limit: number,
): DocumentSearchHit[] {
  return chunks
    .map((chunk) => ({
      documentId: chunk.documentId,
      documentName: chunk.document.name,
      position: chunk.position,
      content: chunk.content,
      score: scoreChunk(chunk.content, terms),
    }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
