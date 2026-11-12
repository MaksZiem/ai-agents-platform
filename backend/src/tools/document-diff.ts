import { diffArrays } from 'diff';

export type LineChange =
  | { type: 'added'; lineB: number; after: string }
  | { type: 'removed'; lineA: number; before: string }
  | {
      type: 'changed';
      lineA: number;
      lineB: number;
      before: string;
      after: string;
    };

export interface DocumentDiff {
  identical: boolean;
  similarity: number;
  stats: {
    linesA: number;
    linesB: number;
    unchanged: number;
    added: number;
    removed: number;
  };
  changes: LineChange[];
}

interface Line {
  number: number;
  text: string;
}

const MAX_CHANGE_TEXT = 1_000;

function toLines(content: string): Line[] {
  return content
    .split(/\r?\n/)
    .map((raw, index) => ({
      number: index + 1,
      text: raw.replace(/\s+/g, ' ').trim(),
    }))
    .filter((line) => line.text !== '');
}

function joinLines(lines: Line[]): string {
  const text = lines.map((line) => line.text).join('\n');
  return text.length > MAX_CHANGE_TEXT
    ? `${text.slice(0, MAX_CHANGE_TEXT)}…`
    : text;
}

export function diffDocuments(
  contentA: string,
  contentB: string,
): DocumentDiff {
  const linesA = toLines(contentA);
  const linesB = toLines(contentB);
  const parts = diffArrays(
    linesA.map((line) => line.text),
    linesB.map((line) => line.text),
  );
  const changes: LineChange[] = [];
  let indexA = 0;
  let indexB = 0;
  let unchanged = 0;
  let added = 0;
  let removed = 0;

  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    const count = part.value.length;

    if (!part.added && !part.removed) {
      unchanged += count;
      indexA += count;
      indexB += count;
      continue;
    }

    if (part.removed) {
      const removedLines = linesA.slice(indexA, indexA + count);
      const next = parts[index + 1];
      removed += count;
      indexA += count;

      if (next?.added) {
        const addedLines = linesB.slice(indexB, indexB + next.value.length);
        added += addedLines.length;
        indexB += addedLines.length;
        index++;
        changes.push({
          type: 'changed',
          lineA: removedLines[0].number,
          lineB: addedLines[0].number,
          before: joinLines(removedLines),
          after: joinLines(addedLines),
        });
      } else {
        changes.push({
          type: 'removed',
          lineA: removedLines[0].number,
          before: joinLines(removedLines),
        });
      }
      continue;
    }

    const addedLines = linesB.slice(indexB, indexB + count);
    added += count;
    indexB += count;
    changes.push({
      type: 'added',
      lineB: addedLines[0].number,
      after: joinLines(addedLines),
    });
  }

  const total = linesA.length + linesB.length;

  return {
    identical: changes.length === 0,
    similarity:
      total === 0 ? 1 : Math.round((unchanged * 2 * 1000) / total) / 1000,
    stats: {
      linesA: linesA.length,
      linesB: linesB.length,
      unchanged,
      added,
      removed,
    },
    changes,
  };
}
