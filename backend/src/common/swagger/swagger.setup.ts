import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const BEARER_AUTH = 'access-token';

const TITLE = 'AI Agents Platform API';

const DESCRIPTION = `REST API platformy do tworzenia, konfigurowania i uruchamiania agentów AI.

## Autoryzacja
Większość endpointów wymaga tokenu JWT w nagłówku \`Authorization: Bearer <token>\`.
Token zwracają **POST /api/auth/register** i **POST /api/auth/login**.
Kliknij **Authorize** i wklej sam token (bez słowa "Bearer"), aby wywoływać chronione endpointy z tego widoku.

## Format błędów
Każdy błąd ma spójny format JSON:
\`\`\`json
{
  "statusCode": 409,
  "code": "CONNECTION_NAME_TAKEN",
  "message": "Connection name is already taken",
  "params": {}
}
\`\`\`
- \`code\` to stały identyfikator błędu, na podstawie którego frontend wyświetla przetłumaczony komunikat (PL/EN), a \`params\` zawiera wartości do wstawienia w ten komunikat.
- \`message\` jest po angielsku i służy do debugowania.
- Błędy walidacji danych wejściowych mają kod \`VALIDATION_FAILED\` i zwracają w \`message\` tablicę komunikatów, po jednym na każde niepoprawne pole.
- Identyfikator w ścieżce, który nie jest UUID, daje błąd 400 z kodem \`INVALID_ID\` (\`params.param\` to nazwa parametru).
- Błędy bez własnego kodu dostają kod z nazwy statusu HTTP, np. \`NOT_FOUND\` albo \`UNAUTHORIZED\`.

## Limity
Uruchamianie zadań jest ograniczone liczbą startów na minutę, liczbą równoległych wykonań i dziennym limitem tokenów (błąd 429 z kodem \`RATE_LIMIT_STARTS\`, \`RATE_LIMIT_CONCURRENT\` lub \`DAILY_TOKEN_LIMIT\`).

## Czas rzeczywisty
Postęp wykonań jest wysyłany przez WebSocket (Socket.IO). Jednorazowy token do połączenia zwraca **POST /api/auth/socket-token**.`;

const TAGS: [string, string][] = [
  ['auth', 'Rejestracja, logowanie i konto użytkownika'],
  ['users', 'Profil zalogowanego użytkownika'],
  ['dashboard', 'Podsumowanie aktywności na stronie startowej'],
  ['agents', 'Agenci AI, ich narzędzia i uprawnienia'],
  ['tools', 'Katalog narzędzi dostępnych dla agentów'],
  ['connections', 'Połączenia z zewnętrznymi API, z których korzystają agenci'],
  ['knowledge', 'Dokumenty bazy wiedzy i przypisywanie ich do agentów'],
  ['executions', 'Wykonania zadań przez agentów wraz z krokami i metrykami'],
  ['approvals', 'Akceptacja operacji wymagających zgody człowieka'],
  ['files', 'Pliki wygenerowane przez agentów'],
  ['health', 'Stan aplikacji i jej zależności'],
];

export function setupSwagger(app: INestApplication): void {
  const builder = new DocumentBuilder()
    .setTitle(TITLE)
    .setDescription(DESCRIPTION)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT z /api/auth/login lub /api/auth/register',
      },
      BEARER_AUTH,
    );

  for (const [name, description] of TAGS) {
    builder.addTag(name, description);
  }

  const document = SwaggerModule.createDocument(app, builder.build(), {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
  });

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: `${TITLE} Docs`,
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
