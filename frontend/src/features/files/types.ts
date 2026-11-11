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
