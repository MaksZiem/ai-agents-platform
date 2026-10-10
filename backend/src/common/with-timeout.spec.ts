import { withTimeout } from './with-timeout.js';

describe('withTimeout', () => {
  it('resolves with the value when the promise settles in time', async () => {
    await expect(
      withTimeout(Promise.resolve(42), 50, 'Too slow'),
    ).resolves.toBe(42);
  });

  it('rejects when the promise takes too long', async () => {
    const neverSettles = new Promise<never>(() => {});

    await expect(withTimeout(neverSettles, 10, 'Too slow')).rejects.toThrow(
      'Too slow',
    );
  });

  it('passes through the original rejection', async () => {
    await expect(
      withTimeout(Promise.reject(new Error('Boom')), 50, 'Too slow'),
    ).rejects.toThrow('Boom');
  });
});
