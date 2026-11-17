import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity.js';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT do nagłówka Authorization',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  user: User;
}

export class SocketTokenResponseDto {
  @ApiProperty({
    description: 'Krótkotrwały token (60 s) do połączenia WebSocket',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;
}
