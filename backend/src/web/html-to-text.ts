const REMOVED_ELEMENTS =
  /<(script|style|noscript|svg|template|iframe|nav|footer|header|form|aside)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const BLOCK_TAGS =
  /<\/?(p|div|section|article|main|h[1-6]|ul|ol|table|thead|tbody|tr|blockquote|pre|figure|dl|dt|dd)\b[^>]*>/gi;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  euro: '€',
  copy: '©',
  reg: '®',
  trade: '™',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
};

export function decodeEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (match, entity: string) => {
      if (entity.startsWith('#')) {
        const code =
          entity[1].toLowerCase() === 'x'
            ? Number.parseInt(entity.slice(2), 16)
            : Number.parseInt(entity.slice(1), 10);

        return Number.isFinite(code) && code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : match;
      }

      return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
    },
  );
}

export function extractTitle(html: string): string | null {
  const title = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const text = title ? decodeEntities(title).replace(/\s+/g, ' ').trim() : '';

  return text || null;
}

export function htmlToText(html: string): string {
  const body = /<body\b[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html;

  return decodeEntities(
    body
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(REMOVED_ELEMENTS, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li\b[^>]*>/gi, '\n- ')
      .replace(/<\/(td|th)>/gi, ' | ')
      .replace(BLOCK_TAGS, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
