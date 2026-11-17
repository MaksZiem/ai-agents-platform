import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  BadRequestErrorDto,
  ConflictErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { User } from '../users/entities/user.entity.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import {
  AuthResponseDto,
  SocketTokenResponseDto,
} from './dto/auth-response.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { JwtPayload } from './jwt-payload.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Rejestracja',
    description: 'Tworzy konto i od razu zwraca token JWT.',
  })
  @ApiCreatedResponse({
    description: 'Konto utworzone',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiConflictResponse({
    description: 'Adres e-mail jest już zajęty',
    type: ConflictErrorDto,
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logowanie' })
  @ApiOkResponse({ description: 'Zalogowano', type: AuthResponseDto })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Nieprawidłowy e-mail lub hasło',
    type: UnauthorizedErrorDto,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth(BEARER_AUTH)
  @ApiOperation({ summary: 'Dane zalogowanego użytkownika' })
  @ApiOkResponse({ description: 'Zalogowany użytkownik', type: User })
  @ApiUnauthorizedResponse({
    description: 'Brak tokenu lub token nieprawidłowy',
    type: UnauthorizedErrorDto,
  })
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth(BEARER_AUTH)
  @ApiOperation({ summary: 'Zmień hasło' })
  @ApiNoContentResponse({ description: 'Hasło zmienione' })
  @ApiBadRequestResponse({
    description:
      'Obecne hasło jest nieprawidłowe (kod CURRENT_PASSWORD_INCORRECT) lub nowe hasło nie spełnia wymagań',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Brak tokenu lub token nieprawidłowy',
    type: UnauthorizedErrorDto,
  })
  changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.authService.changePassword(user.sub, dto);
  }

  @Post('socket-token')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(BEARER_AUTH)
  @ApiOperation({
    summary: 'Token do połączenia WebSocket',
    description:
      'Zwraca krótkotrwały token, którym klient uwierzytelnia połączenie Socket.IO z postępem wykonań.',
  })
  @ApiOkResponse({ description: 'Token', type: SocketTokenResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Brak tokenu lub token nieprawidłowy',
    type: UnauthorizedErrorDto,
  })
  socketToken(@CurrentUser() user: JwtPayload) {
    return this.authService.createSocketToken(user);
  }
}
