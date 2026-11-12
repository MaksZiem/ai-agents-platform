import { z } from 'zod';
import { HTTP_METHODS } from '../../connections/entities/connection.entity.js';
import { defineTool } from '../tool-definition.js';

export const httpRequestTool = defineTool({
  name: 'httpRequest',
  summary: 'Calls an API from the connections attached to the agent.',
  category: 'web',
  description:
    'Calls an HTTP API through a connection the user configured for this agent. Pass the connection name, the method and a path relative to the connection base URL (it may include a query string, e.g. "/deals?status=open"). Authentication is added by the platform: never put keys or tokens in the request. For POST, PUT and PATCH pass a JSON string as body. GET requests run immediately; every other method waits for the user\'s approval. Only methods allowed on the connection can be used. The available connections are listed in the system instructions.',
  inputSchema: z.object({
    connection: z.string().min(1).max(64),
    method: z.enum(HTTP_METHODS),
    path: z.string().min(1).max(2_000),
    body: z
      .string()
      .max(50_000)
      .refine(
        (value) => {
          try {
            JSON.parse(value);
            return true;
          } catch {
            return false;
          }
        },
        { message: 'body must be valid JSON' },
      )
      .optional(),
  }),
  outputSchema: z.object({
    connection: z.string(),
    method: z.enum(HTTP_METHODS),
    url: z.string(),
    status: z.number().int(),
    contentType: z.string(),
    body: z.string(),
    truncated: z.boolean(),
  }),
  permission: { resource: 'connections', action: 'read' },
  permissionFor: ({ method }) => ({
    resource: 'connections',
    action: method === 'GET' ? 'read' : 'modify',
  }),
  requiresApproval: false,
  needsApproval: ({ method }) => method !== 'GET',
  execute: ({ method, body, ...request }, context) =>
    context.httpRequest({
      ...request,
      method,
      body: method === 'GET' || method === 'DELETE' ? undefined : body,
    }),
});
