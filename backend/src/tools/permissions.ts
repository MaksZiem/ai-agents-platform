import type { ToolAction, ToolResource } from './tool-definition.js';

export const RESOURCE_ACTIONS: Record<ToolResource, readonly ToolAction[]> = {
  financial_data: ['read', 'modify', 'delete'],
  documents: ['read', 'search', 'delete'],
  email: ['send'],
};

export function isSupportedPermission(
  resource: string,
  action: string,
): resource is ToolResource {
  return (
    resource in RESOURCE_ACTIONS &&
    RESOURCE_ACTIONS[resource as ToolResource].includes(action as ToolAction)
  );
}
