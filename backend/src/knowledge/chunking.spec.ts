import { chunkText, mergeChunks } from './chunking.js';

describe('chunkText', () => {
  it('returns short text as a single chunk', () => {
    expect(chunkText('  Hello world.  ')).toEqual(['Hello world.']);
  });

  it('returns nothing for blank text', () => {
    expect(chunkText(' \n\n ')).toEqual([]);
  });

  it('keeps chunks within the size limit and covers the whole text', () => {
    const text = Array.from(
      { length: 50 },
      (_, index) => `Sentence number ${index} is here.`,
    ).join(' ');
    const chunks = chunkText(text, { size: 200, overlap: 40 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 200)).toBe(true);
    expect(chunks[0].startsWith('Sentence number 0')).toBe(true);
    expect(chunks.at(-1)?.endsWith('Sentence number 49 is here.')).toBe(true);
  });

  it('prefers to cut at paragraph boundaries', () => {
    const first = 'a'.repeat(120);
    const second = 'b'.repeat(120);
    const chunks = chunkText(`${first}\n\n${second}`, {
      size: 200,
      overlap: 0,
    });

    expect(chunks).toEqual([first, second]);
  });

  it('cuts text without any separators at the size limit', () => {
    const chunks = chunkText('x'.repeat(450), { size: 200, overlap: 50 });

    expect(chunks.map((chunk) => chunk.length)).toEqual([200, 200, 150]);
  });
});

describe('mergeChunks', () => {
  it('rebuilds the original text from overlapping chunks', () => {
    const text = Array.from(
      { length: 80 },
      (_, index) =>
        `Line ${index}: revenue ${index * 10} kEUR.${index % 7 === 0 ? '\n\n' : ' '}`,
    )
      .join('')
      .trim();

    expect(mergeChunks(chunkText(text))).toBe(text);
  });

  it('joins chunks that share no text with a paragraph break', () => {
    const first = 'a'.repeat(120);
    const second = 'b'.repeat(120);

    expect(mergeChunks([first, second])).toBe(`${first}\n\n${second}`);
  });
});
