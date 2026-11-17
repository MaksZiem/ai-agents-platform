import { ApiProperty } from '@nestjs/swagger';
import { Connection } from '../entities/connection.entity.js';

export class AttachedConnectionDto extends Connection {
  @ApiProperty({ description: 'Kiedy połączenie zostało przypięte do agenta' })
  attachedAt: Date;
}
