import { PartialType } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto.js';

export class UpdateAgentDto extends PartialType(CreateAgentDto) {}
