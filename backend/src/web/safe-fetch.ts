import { lookup as dnsLookup, type LookupAddress } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import { BlockList, isIP } from 'node:net';
import type { Readable } from 'node:stream';
import { createBrotliDecompress, createGunzip, createInflate } from 'node:zlib';

export class SafeFetchError extends Error {
  constructor(
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'SafeFetchError';
  }
}

export interface SafeFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  signal?: AbortSignal;
}

export interface SafeFetchResponse {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: Buffer;
  truncated: boolean;
}

const BLOCKED = new BlockList();

for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  BLOCKED.addSubnet(network, prefix, 'ipv4');
}

for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['100::', 64],
  ['2001:db8::', 32],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  BLOCKED.addSubnet(network, prefix, 'ipv6');
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_BYTES = 2_000_000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export function isBlockedAddress(address: string): boolean {
  const family = isIP(address);

  if (family === 0) {
    return true;
  }

  return BLOCKED.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

const guardedLookup: typeof dnsLookup = ((
  hostname: string,
  options: { all?: boolean },
  callback: (
    error: NodeJS.ErrnoException | null,
    address: string | LookupAddress[],
    family?: number,
  ) => void,
) => {
  dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) {
      callback(error, []);
      return;
    }

    const blocked = addresses.find(({ address }) => isBlockedAddress(address));

    if (blocked || addresses.length === 0) {
      callback(
        new SafeFetchError(
          `${hostname} resolves to a private or reserved address`,
        ) as NodeJS.ErrnoException,
        [],
      );
      return;
    }

    if (options.all) {
      callback(null, addresses);
    } else {
      callback(null, addresses[0].address, addresses[0].family);
    }
  });
}) as typeof dnsLookup;

export function assertPublicUrl(raw: string): URL {
  let url: URL;

  try {
    url = new URL(raw);
  } catch {
    throw new SafeFetchError(`Invalid URL: ${raw}`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new SafeFetchError('Only http and https URLs are allowed');
  }

  if (url.username || url.password) {
    throw new SafeFetchError('URLs with credentials are not allowed');
  }

  const host = url.hostname.replace(/^\[|\]$/g, '');

  if (isIP(host) !== 0 && isBlockedAddress(host)) {
    throw new SafeFetchError(`${host} is a private or reserved address`);
  }

  return url;
}

function decode(response: http.IncomingMessage): Readable {
  switch (response.headers['content-encoding']) {
    case 'gzip':
      return response.pipe(createGunzip());
    case 'deflate':
      return response.pipe(createInflate());
    case 'br':
      return response.pipe(createBrotliDecompress());
    default:
      return response;
  }
}

function requestOnce(
  url: URL,
  options: Required<Pick<SafeFetchOptions, 'timeoutMs' | 'maxBytes'>> &
    SafeFetchOptions,
): Promise<SafeFetchResponse> {
  const client = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = client.request(
      url,
      {
        method: options.method ?? 'GET',
        headers: {
          'user-agent': 'AgentPlatform/1.0',
          'accept-encoding': 'gzip, deflate, br',
          ...options.headers,
          ...(options.body !== undefined && {
            'content-length': String(Buffer.byteLength(options.body)),
          }),
        },
        lookup: guardedLookup,
        timeout: options.timeoutMs,
        signal: options.signal,
      },
      (response) => {
        const chunks: Buffer[] = [];
        let size = 0;
        let truncated = false;
        const stream = decode(response);
        const headers = Object.fromEntries(
          Object.entries(response.headers).map(([name, value]) => [
            name,
            Array.isArray(value) ? value.join(', ') : (value ?? ''),
          ]),
        );
        const finish = () =>
          resolve({
            url: url.href,
            status: response.statusCode ?? 0,
            headers,
            body: Buffer.concat(chunks),
            truncated,
          });

        stream.on('data', (chunk: Buffer) => {
          if (truncated) {
            return;
          }

          const remaining = options.maxBytes - size;

          if (chunk.length >= remaining) {
            chunks.push(chunk.subarray(0, remaining));
            size = options.maxBytes;
            truncated = true;
            response.destroy();
            finish();
            return;
          }

          chunks.push(chunk);
          size += chunk.length;
        });
        stream.on('end', finish);
        stream.on('error', (error) => {
          if (!truncated) {
            reject(
              new SafeFetchError(
                `Could not read response: ${error.message}`,
                true,
              ),
            );
          }
        });
      },
    );

    request.on('timeout', () => {
      request.destroy(
        new SafeFetchError(
          `Request timed out after ${options.timeoutMs} ms`,
          true,
        ),
      );
    });
    request.on('error', (error) => {
      reject(
        error instanceof SafeFetchError
          ? error
          : new SafeFetchError(`Request failed: ${error.message}`, true),
      );
    });

    if (options.body !== undefined) {
      request.write(options.body);
    }

    request.end();
  });
}

export async function safeFetch(
  raw: string,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResponse> {
  const settings = {
    ...options,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    maxBytes: options.maxBytes ?? DEFAULT_MAX_BYTES,
  };
  const maxRedirects = options.maxRedirects ?? 0;
  let url = assertPublicUrl(raw);

  for (let redirects = 0; ; redirects += 1) {
    const response = await requestOnce(url, settings);
    const location = response.headers.location;

    if (
      !REDIRECT_STATUSES.has(response.status) ||
      !location ||
      maxRedirects === 0
    ) {
      return response;
    }

    if (redirects >= maxRedirects) {
      throw new SafeFetchError(
        `Too many redirects (more than ${maxRedirects})`,
      );
    }

    url = assertPublicUrl(new URL(location, url).href);

    if (response.status <= 303 && settings.method !== 'HEAD') {
      settings.method = 'GET';
      settings.body = undefined;
    }
  }
}
