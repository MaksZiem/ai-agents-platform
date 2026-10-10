import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';
import { SocketIoAdapter } from './realtime/socket-io.adapter.js';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.get('FRONTEND_URL', { infer: true }) });
  app.enableShutdownHooks();
  app.useWebSocketAdapter(
    new SocketIoAdapter(app, config.get('FRONTEND_URL', { infer: true })),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(config.get('PORT', { infer: true }));
}
await bootstrap();
