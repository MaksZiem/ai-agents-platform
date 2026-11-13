import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_URL: z.url().default('http://localhost:3000'),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(3600),
  GEMINI_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(32),
  TAVILY_API_KEY: z.string().optional(),
  TOKEN_BUDGET_PER_EXECUTION: z.coerce
    .number()
    .int()
    .positive()
    .default(200_000),
  DAILY_TOKEN_LIMIT_PER_USER: z.coerce
    .number()
    .int()
    .positive()
    .default(1_000_000),
  MAX_CONCURRENT_EXECUTIONS_PER_USER: z.coerce
    .number()
    .int()
    .positive()
    .default(3),
  MAX_EXECUTION_STARTS_PER_MINUTE: z.coerce
    .number()
    .int()
    .positive()
    .default(10),
  EMAIL_FROM: z
    .string()
    .min(1)
    .default('AI Agent Platform <onboarding@resend.dev>'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
