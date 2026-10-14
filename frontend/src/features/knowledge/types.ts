export type KnowledgeDocument = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  characterCount: number;
  chunkCount: number;
  createdAt: string;
};

export type LibraryDocument = KnowledgeDocument & {
  agents: { id: string; name: string }[];
};

export type AgentDocument = KnowledgeDocument & {
  attachedAt: string;
};
