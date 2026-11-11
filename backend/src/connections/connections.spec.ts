import { buildRequestUrl } from './request-url.js';
import { SecretCipher } from './secret-cipher.js';

describe('buildRequestUrl', () => {
  it('joins the base URL and the path', () => {
    expect(
      buildRequestUrl('https://api.example.com/v1/', '/deals?status=open#x')
        .href,
    ).toBe('https://api.example.com/v1/deals?status=open');
    expect(buildRequestUrl('https://api.example.com', '/users').href).toBe(
      'https://api.example.com/users',
    );
  });

  it.each([
    ['deals', 'single "/"'],
    ['//evil.com/x', 'single "/"'],
    ['/../admin', '".."'],
    ['/%2e%2e/admin', '".."'],
    ['/a/./b', '"."'],
    ['/a\\b', 'forbidden characters'],
    ['/a b', 'forbidden characters'],
    ['/%zz', 'percent-encoding'],
  ])('rejects %s', (path, message) => {
    expect(() => buildRequestUrl('https://api.example.com/v1', path)).toThrow(
      message,
    );
  });

  it('does not let @ change the host', () => {
    const url = buildRequestUrl('https://api.example.com', '/@evil.com');
    expect(url.host).toBe('api.example.com');
  });
});

describe('SecretCipher', () => {
  const cipher = new SecretCipher('a'.repeat(32));

  it('round-trips a secret and never stores it in plain text', () => {
    const encrypted = cipher.encrypt('sk_live_123');

    expect(encrypted).not.toContain('sk_live_123');
    expect(encrypted).not.toBe(cipher.encrypt('sk_live_123'));
    expect(cipher.decrypt(encrypted)).toBe('sk_live_123');
  });

  it('rejects a payload encrypted with another key', () => {
    const other = new SecretCipher('b'.repeat(32));
    expect(() => other.decrypt(cipher.encrypt('secret'))).toThrow();
  });
});
