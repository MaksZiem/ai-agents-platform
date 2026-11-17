import { extname } from 'node:path';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { extractText, getDocumentProxy } from 'unpdf';
import { errorBody } from '../common/error-body.js';

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.markdown', '.csv', '.json']);

export const SUPPORTED_EXTENSIONS = [...TEXT_EXTENSIONS, '.pdf'];

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
      throw new BadRequestException(
        errorBody(
          HttpStatus.BAD_REQUEST,
          'PDF_UNREADABLE',
          'Could not read the PDF file',
        ),
      );
    }
  }

  throw new BadRequestException(
    errorBody(
      HttpStatus.BAD_REQUEST,
      'FILE_TYPE_UNSUPPORTED',
      `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`,
      { types: SUPPORTED_EXTENSIONS.join(', ') },
    ),
  );
}
