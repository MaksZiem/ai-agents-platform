import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AgentStatus, LlmProvider } from '../entities/agent.entity.js';
import { MAX_OUTPUT_TOKENS } from '../agent-limits.js';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsOptional()
  @IsEnum(AgentStatus)
  status?: AgentStatus;

  @IsOptional()
  @IsEnum(LlmProvider)
  provider?: LlmProvider;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_OUTPUT_TOKENS)
  maxOutputTokens?: number;
}
