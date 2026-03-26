import { z } from 'zod';

export const ConfigSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    TZ: z.string().default('Australia/Brisbane'),

    // Discord config
    TOKEN: z.string(),
    CLIENT_ID: z.string(),
    GUILD_ID: z.string().optional(),

    // Axiom config
    AXIOM_TOKEN: z.string().optional(),
    AXIOM_DATASET: z.string().optional(),
    AXIOM_ORG_ID: z.string().optional(),

    // OpenTelemetry config
    ENABLE_OTEL: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    OTEL_DEBUG: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    OTEL_SERVICE_NAME: z.string().default('vait-discord-bot'),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),

    // OpenObserve config (local dev only)
    OPENOBSERVE_AUTH_TOKEN: z.string().optional(),

    // Database config
    DATABASE_URL: z.string(),
  })
  .refine(
    (env) => {
      if (env.NODE_ENV !== 'development') return true;
      return !!env.GUILD_ID;
    },
    {
      message: 'GUILD_ID is required in development for command deployment',
      path: ['GUILD_ID'],
    }
  )
  .refine(
    (env) => {
      if (env.NODE_ENV !== 'production') return true;
      return !!env.AXIOM_TOKEN && !!env.AXIOM_DATASET && !!env.AXIOM_ORG_ID;
    },
    {
      message: 'AXIOM_TOKEN, AXIOM_DATASET, and AXIOM_ORG_ID are required in production',
      path: ['AXIOM_TOKEN'],
    }
  )
  .refine(
    (env) => {
      if (!env.ENABLE_OTEL) return true;
      return !!env.OTEL_EXPORTER_OTLP_ENDPOINT;
    },
    {
      message: 'OTEL_EXPORTER_OTLP_ENDPOINT is required when ENABLE_OTEL is true',
      path: ['OTEL_EXPORTER_OTLP_ENDPOINT'],
    }
  );
export type ConfigSchema = z.infer<typeof ConfigSchema>;

export const loadEnv = () => {
  const validatedEnv = ConfigSchema.safeParse(process.env);
  if (!validatedEnv.success) {
    console.error(`Error loading environment details. ${validatedEnv.error.message}`);
    throw new Error('INVALID CONFIG!', { cause: validatedEnv.error.issues });
  }
  return validatedEnv.data;
};
