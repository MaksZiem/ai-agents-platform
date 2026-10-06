import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateExecutionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  task: string;
}
