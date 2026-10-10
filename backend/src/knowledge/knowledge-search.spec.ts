import { scoreChunk, searchTerms } from './knowledge-search.js';

describe('searchTerms', () => {
  it('lowercases, deduplicates and drops short words', () => {
    expect(searchTerms('What is the Travel policy? travel limits')).toEqual([
      'what',
      'the',
      'travel',
      'policy',
      'limits',
    ]);
  });

  it('keeps non-English letters', () => {
    expect(searchTerms('Polityka wydatków')).toEqual(['polityka', 'wydatków']);
  });
});

describe('scoreChunk', () => {
  it('ranks chunks matching more distinct terms higher', () => {
    const terms = ['travel', 'limit'];

    expect(scoreChunk('Travel limit is 500.', terms)).toBeGreaterThan(
      scoreChunk('Travel, travel, travel.', terms),
    );
  });

  it('scores zero when nothing matches', () => {
    expect(scoreChunk('Office rent', ['travel'])).toBe(0);
  });
});
