import { Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { TOOL_DEFINITIONS } from './definitions/index.js';
import type { ToolDefinition } from './tool-definition.js';

@Injectable()
export class ToolsService {
  private readonly tools = new Map<string, ToolDefinition>(
    TOOL_DEFINITIONS.map((tool) => [tool.name, tool]),
  );

  findAll() {
    return [...this.tools.values()].map((tool) => this.toPublic(tool));
  }

  findOne(name: string) {
    return this.toPublic(this.get(name));
  }

  find(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  get(name: string): ToolDefinition {
    const tool = this.find(name);

    if (!tool) {
      throw new NotFoundException(`Tool ${name} not found`);
    }

    return tool;
  }

  private toPublic(tool: ToolDefinition) {
    return {
      name: tool.name,
      description: tool.description,
      inputSchema: z.toJSONSchema(tool.inputSchema),
      outputSchema: z.toJSONSchema(tool.outputSchema),
      permission: tool.permission,
      requiresApproval: tool.requiresApproval,
    };
  }
}
