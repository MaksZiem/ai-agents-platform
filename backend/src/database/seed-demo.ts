import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { User } from '../users/entities/user.entity.js';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../demo/demo-account.js';
import dataSource from './data-source.js';

const API_URL =
  process.env.DEMO_API_URL ??
  `http://localhost:${process.env.PORT ?? 3001}/api`;
const DEMO_FILES_DIR = join(process.cwd(), 'demo-data');
const DEMO_FILES = [
  'koszty-2026.csv',
  'umowa-v1.md',
  'umowa-v2.md',
  'brightline-financial-results.md',
];
const MIME_TYPES: Record<string, string> = {
  '.csv': 'text/csv',
  '.md': 'text/markdown',
};

const FINANCIAL_ANALYST = {
  name: 'Financial Analyst',
  description:
    'Analyses costs, contracts and financial results from the attached documents and prepares a report.',
  instructions: [
    'You are a financial analyst.',
    'Never invent financial information: use only the attached documents and tool results, and name the document behind every number.',
    'If the task is ambiguous, ask the user with askUser before you continue.',
    'Do the arithmetic with calculate, never in your head.',
    'Finish with a short report created by generateReport.',
  ].join(' '),
  model: 'gemini-3.5-flash',
  temperature: 0.2,
};

const TOOLS = [
  'readDocument',
  'searchDocuments',
  'extractTable',
  'compareDocuments',
  'calculate',
  'generateReport',
  'askUser',
];

const PERMISSIONS = [
  { resource: 'documents', action: 'read' },
  { resource: 'documents', action: 'search' },
  { resource: 'financial_data', action: 'read' },
  { resource: 'reports', action: 'create' },
];

async function call<T>(
  method: string,
  path: string,
  { token, body }: { token?: string; body?: unknown } = {},
): Promise<T> {
  const isForm = body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isForm &&
        body !== undefined && { 'Content-Type': 'application/json' }),
    },
    body: isForm ? body : body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `${method} ${path} failed with ${response.status}: ${await response.text()}`,
    );
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function removeDemoAccount(): Promise<void> {
  await dataSource.initialize();
  try {
    await dataSource.getRepository(User).delete({ email: DEMO_EMAIL });
  } finally {
    await dataSource.destroy();
  }
}

async function uploadDocument(
  token: string,
  fileName: string,
): Promise<string> {
  const content = await readFile(join(DEMO_FILES_DIR, fileName));
  const form = new FormData();
  form.append(
    'file',
    new Blob([content], {
      type: MIME_TYPES[extname(fileName)] ?? 'text/plain',
    }),
    fileName,
  );
  const document = await call<{ id: string }>('POST', '/knowledge', {
    token,
    body: form,
  });
  return document.id;
}

async function main(): Promise<void> {
  await removeDemoAccount();

  const { accessToken: token } = await call<{ accessToken: string }>(
    'POST',
    '/auth/register',
    { body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: 'Demo User' } },
  );

  const agent = await call<{ id: string }>('POST', '/agents', {
    token,
    body: FINANCIAL_ANALYST,
  });

  for (const tool of TOOLS) {
    await call('PUT', `/agents/${agent.id}/tools/${tool}`, { token, body: {} });
  }
  await call('PUT', `/agents/${agent.id}/permissions`, {
    token,
    body: { permissions: PERMISSIONS },
  });

  for (const fileName of DEMO_FILES) {
    const documentId = await uploadDocument(token, fileName);
    await call('PUT', `/agents/${agent.id}/knowledge/${documentId}`, { token });
  }

  console.log(
    [
      'Demo account reset.',
      `  Login:     ${DEMO_EMAIL} / ${DEMO_PASSWORD}`,
      `  Agent:     ${FINANCIAL_ANALYST.name} (${agent.id})`,
      `  Documents: ${DEMO_FILES.join(', ')}`,
    ].join('\n'),
  );
}

await main();
