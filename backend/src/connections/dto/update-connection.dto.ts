import { PartialType } from '@nestjs/swagger';
import { CreateConnectionDto } from './create-connection.dto.js';

export class UpdateConnectionDto extends PartialType(CreateConnectionDto) {}
