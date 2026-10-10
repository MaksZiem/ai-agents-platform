import { extname } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import { extractText, getDocumentProxy } from 'unpdf';

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.markdown', '.csv', '.json']);

export const SUPPORTED_EXTENSIONS = [...TEXT_EXTENSIONS, '.pdf'];

// PostgreSQL text columns cannot store NUL characters.
export async function extractDocumentText(
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  const text = await extractRawText(fileName, buffer);
  return text.replaceAll('\0', '');
}

async function extractRawText(
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  const extension = extname(fileName).toLowerCase();

  if (TEXT_EXTENSIONS.has(extension)) {
    return buffer.toString('utf8');
  }

  if (extension === '.pdf') {
    try {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return text;
    } catch {
      throw new BadRequestException('Could not read the PDF file');
    }
  }

  throw new BadRequestException(
    `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`,
  );
}
