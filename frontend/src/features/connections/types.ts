export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export const AUTH_TYPES = ["none", "bearer", "header"] as const;

export type AuthType = (typeof AUTH_TYPES)[number];

export type Connection = {
  id: string;
  name: string;
  description: string | null;
  baseUrl: string;
  authType: AuthType;
  authHeaderName: string | null;
  hasSecret: boolean;
  allowedMethods: HttpMethod[];
  createdAt: string;
  updatedAt: string;
};

export type AgentConnection = Connection & {
  attachedAt: string;
};
