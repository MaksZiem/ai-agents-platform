import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extractText, getDocumentProxy } from 'unpdf';
import type { Env } from '../config/env.js';
import { extractTitle, htmlToText } from './html-to-text.js';
import { safeFetch, SafeFetchError } from './safe-fetch.js';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebPage {
  url: string;
  finalUrl: string;
  status: number;
  contentType: string;
  title: string | null;
  content: string;
  truncated: boolean;
}

const TAVILY_URL = 'https://api.tavily.com/search';
const SEARCH_TIMEOUT_MS = 20_000;
const MAX_PAGE_CHARACTERS = 30_000;
const TEXT_TYPES = ['application/json', 'application/xml'];

@Injectable()
export class WebService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  async search(query: string, maxResults: number): Promise<WebSearchResult[]> {
    const apiKey = this.config.get('TAVILY_API_KEY', { infer: true });

    if (!apiKey) {
      throw new SafeFetchError(
        'Web search is not configured: set TAVILY_API_KEY in the backend environment',
      );
    }

    let response: Response;

    try {
      response = await fetch(TAVILY_URL, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          query,
          max_results: maxResults,
          search_depth: 'basic',
        }),
        signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
      });
    } catch (error) {
      throw new SafeFetchError(
        `Web search failed: ${error instanceof Error ? error.message : String(error)}`,
        true,
      );
    }

    if (!response.ok) {
      throw new SafeFetchError(
        `Web search failed with HTTP ${response.status}`,
        response.status === 429 || response.status >= 500,
      );
    }

    const body = (await response.json()) as {
      results?: { title?: string; url?: string; content?: string }[];
    };

    return (body.results ?? []).flatMap((result) =>
      result.url
        ? [
            {
              title: result.title ?? result.url,
              url: result.url,
              snippet: (result.content ?? '').slice(0, 1_000),
            },
          ]
        : [],
    );
  }

  async fetchPage(url: string): Promise<WebPage> {
    const response = await safeFetch(url, {
      headers: {
        accept:
          'text/html, text/plain, application/json, application/pdf;q=0.9, */*;q=0.5',
      },
      maxRedirects: 5,
      maxBytes: 5_000_000,
    });

    if (response.status >= 400) {
      throw new SafeFetchError(
        `${url} returned HTTP ${response.status}`,
        response.status === 429 || response.status >= 500,
      );
    }

    const contentType = (response.headers['content-type'] ?? '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    const { title, text } = await this.toText(contentType, response.body);

    return {
      url,
      finalUrl: response.url,
      status: response.status,
      contentType: contentType || 'unknown',
      title,
      content: text.slice(0, MAX_PAGE_CHARACTERS),
      truncated: response.truncated || text.length > MAX_PAGE_CHARACTERS,
    };
  }

  private async toText(
    contentType: string,
    body: Buffer,
  ): Promise<{ title: string | null; text: string }> {
    if (
      contentType === 'text/html' ||
      contentType === 'application/xhtml+xml' ||
      contentType === ''
    ) {
      const html = body.toString('utf8');
      return { title: extractTitle(html), text: htmlToText(html) };
    }

    if (contentType === 'application/pdf') {
      try {
        const pdf = await getDocumentProxy(new Uint8Array(body));
        const { text } = await extractText(pdf, { mergePages: true });
        return { title: null, text: text.trim() };
      } catch {
        throw new SafeFetchError('Could not read the PDF');
      }
    }

    if (
      contentType.startsWith('text/') ||
      TEXT_TYPES.includes(contentType) ||
      contentType.endsWith('+json')
    ) {
      return { title: null, text: body.toString('utf8').trim() };
    }

    throw new SafeFetchError(`Unsupported content type: ${contentType}`);
  }
}
