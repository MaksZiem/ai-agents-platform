import { PartialType } from '@nestjs/mapped-types';
import { CreateConnectionDto } from './create-connection.dto.js';

export class UpdateConnectionDto extends PartialType(CreateConnectionDto) {}
