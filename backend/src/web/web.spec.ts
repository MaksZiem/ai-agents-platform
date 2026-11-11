import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extractTitle, htmlToText } from './html-to-text.js';
import {
  assertPublicUrl,
  isBlockedAddress,
  safeFetch,
  SafeFetchError,
} from './safe-fetch.js';

describe('isBlockedAddress', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.20.0.1',
    '192.168.1.10',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    '::ffff:127.0.0.1',
    'fd00::1',
    'fe80::1',
    'not-an-ip',
  ])('blocks %s', (address) => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it.each(['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111'])(
    'allows %s',
    (address) => {
      expect(isBlockedAddress(address)).toBe(false);
    },
  );
});

describe('assertPublicUrl', () => {
  it.each([
    ['ftp://example.com', 'Only http and https'],
    ['file:///etc/passwd', 'Only http and https'],
    ['http://user:pass@example.com', 'credentials'],
    ['http://127.0.0.1:3001/api', 'private or reserved'],
    ['http://[::1]/', 'private or reserved'],
    ['http://169.254.169.254/latest/meta-data', 'private or reserved'],
    ['not a url', 'Invalid URL'],
  ])('rejects %s', (url, message) => {
    expect(() => assertPublicUrl(url)).toThrow(message);
  });

  it('accepts a public URL', () => {
    expect(assertPublicUrl('https://example.com/a?b=1').hostname).toBe(
      'example.com',
    );
  });
});

describe('safeFetch', () => {
  let server: Server;

  beforeAll(async () => {
    server = createServer((_request, response) => response.end('secret'));
    await new Promise<void>((resolve) =>
      server.listen(0, 'localhost', resolve),
    );
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('refuses a hostname that resolves to a local address', async () => {
    const { port } = server.address() as AddressInfo;

    await expect(safeFetch(`http://localhost:${port}/`)).rejects.toThrow(
      SafeFetchError,
    );
    await expect(safeFetch(`http://localhost:${port}/`)).rejects.toThrow(
      'private or reserved',
    );
  });
});

describe('htmlToText', () => {
  it('keeps readable text and drops scripts, styles and navigation', () => {
    const html = `<!doctype html><html><head><title>Q3 &amp; Q4 results</title><style>p{color:red}</style></head>
      <body><nav><a href="/">Home</a></nav><h1>Results</h1><p>Revenue grew&nbsp;12%.<br>Costs fell.</p>
      <script>alert("x")</script><ul><li>One</li><li>Two</li></ul>
      <table><tr><td>Q3</td><td>500</td></tr></table><!-- hidden --></body></html>`;

    expect(extractTitle(html)).toBe('Q3 & Q4 results');
    expect(htmlToText(html)).toBe(
      'Results\n\nRevenue grew 12%.\nCosts fell.\n\n- One\n- Two\n\nQ3 | 500 |',
    );
  });

  it('decodes numeric entities', () => {
    expect(htmlToText('<p>&#8364;5 &#x2014; ok</p>')).toBe('€5 — ok');
  });
});
