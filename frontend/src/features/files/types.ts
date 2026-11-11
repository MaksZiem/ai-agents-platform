export type GeneratedFile = {
  id: string;
  executionId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  execution: {
    id: string;
    task: string;
    agent: { id: string; name: string };
  };
};

export const FILE_SOURCES = ["uploaded", "generated"] as const;

export type FileSource = (typeof FILE_SOURCES)[number];

type FileEntryBase = {
  id: string;
  name: string;
  sizeBytes: number;
  createdAt: string;
  downloadHref: string;
};

export type UploadedFileEntry = FileEntryBase & {
  source: "uploaded";
  agents: { id: string; name: string }[];
};

export type GeneratedFileEntry = FileEntryBase & {
  source: "generated";
  executionId: string;
  task: string;
  agent: { id: string; name: string };
};

export type FileEntry = UploadedFileEntry | GeneratedFileEntry;
