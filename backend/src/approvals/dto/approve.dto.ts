import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  answer?: string;
}
