import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  type FunctionDeclaration,
} from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import type { Env } from '../config/env.js';
import type { ToolDefinition } from '../tools/tool-definition.js';
import {
  Planner,
  type PlannedToolCall,
  type PlanningContext,
} from './planner.js';

const GEMINI_TIMEOUT_MS = 30_000;

@Injectable()
export class GeminiPlanner extends Planner {
  private readonly client: GoogleGenAI;

  constructor(config: ConfigService<Env, true>) {
    super();
    this.client = new GoogleGenAI({
      apiKey: config.get('GEMINI_API_KEY', { infer: true }),
      httpOptions: { timeout: GEMINI_TIMEOUT_MS },
    });
  }

  async plan({
    task,
    agent,
    tools,
  }: PlanningContext): Promise<PlannedToolCall[]> {
    if (tools.length === 0) {
      return [];
    }

    const response = await this.client.models.generateContent({
      model: agent.model,
      contents: task,
      config: {
        systemInstruction: this.buildInstruction(agent.instructions),
        temperature: agent.temperature,
        maxOutputTokens: agent.maxOutputTokens,
        tools: [
          {
            functionDeclarations: tools.map((tool) => this.toDeclaration(tool)),
          },
        ],
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
        },
      },
    });

    return (response.functionCalls ?? []).flatMap((call) =>
      call.name ? [{ toolName: call.name, input: call.args ?? {} }] : [],
    );
  }

  private buildInstruction(instructions: string): string {
    const today = new Date().toISOString().slice(0, 10);

    return [
      instructions,
      '',
      `Today is ${today}.`,
      'Plan the task by calling every tool you need, in the order they should run.',
      'Make all the calls in this single response. Do not answer in text.',
    ].join('\n');
  }

  private toDeclaration(tool: ToolDefinition): FunctionDeclaration {
    return {
      name: tool.name,
      description: tool.description,
      // The openapi-3.0 target drops the "$schema" key Gemini does not need.
      parametersJsonSchema: z.toJSONSchema(tool.inputSchema, {
        target: 'openapi-3.0',
      }),
    };
  }
}
