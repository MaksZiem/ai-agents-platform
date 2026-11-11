import type { LibraryDocument } from "@/features/knowledge/types";
import {
  FILE_SOURCES,
  type FileEntry,
  type FileSource,
  type GeneratedFile,
} from "@/features/files/types";

export function isFileSource(value: unknown): value is FileSource {
  return (
    typeof value === "string" &&
    (FILE_SOURCES as readonly string[]).includes(value)
  );
}

export function fileAnchorId(id: string) {
  return `file-${id}`;
}

export function uploadedFileHref(documentId: string) {
  return `/files?source=uploaded&highlight=${documentId}#${fileAnchorId(documentId)}`;
}

export function toFileEntries(
  documents: LibraryDocument[],
  generated: GeneratedFile[],
): FileEntry[] {
  const entries: FileEntry[] = [
    ...documents.map((document) => ({
      source: "uploaded" as const,
      id: document.id,
      name: document.name,
      sizeBytes: document.sizeBytes,
      createdAt: document.createdAt,
      downloadHref: `/api/knowledge/${document.id}/download`,
      agents: document.agents,
    })),
    ...generated.map((file) => ({
      source: "generated" as const,
      id: file.id,
      name: file.name,
      sizeBytes: file.sizeBytes,
      createdAt: file.createdAt,
      downloadHref: `/api/files/${file.id}/download`,
      executionId: file.executionId,
      task: file.execution.task,
      agent: file.execution.agent,
    })),
  ];

  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
