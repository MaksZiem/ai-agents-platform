import { IsBoolean, IsOptional } from 'class-validator';

export class EnableAgentToolDto {
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}
