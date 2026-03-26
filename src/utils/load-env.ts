import { z } from 'zod';

const configSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    TZ: z.string().default('Australia/Brisbane'),

    // Discord config
    TOKEN: z.string(),
    CLIENT_ID: z.string(),
    GUILD_ID: z.string().optional(),

    // OpenTelemetry config
    ENABLE_OTEL: z.enum(['true', 'false']).default('false'),
    OTEL_DEBUG: z.enum(['true', 'false']).default('false'),
    OTEL_SERVICE_NAME: z.string().default('vait-discord-bot'),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),

    // OpenObserve config (local dev only)
    OPENOBSERVE_AUTH_TOKEN: z.string().optional(),

    // Axiom config (production only)
    AXIOM_TOKEN: z.string().optional(),
    AXIOM_DATASET: z.string().optional(),

    // Database config
    DATABASE_URL: z.string(),
  })
  .refine(
    (env) => {
      if (env.ENABLE_OTEL !== 'true') return true;
      return !!env.OTEL_EXPORTER_OTLP_ENDPOINT;
    },
    {
      message: 'OTEL_EXPORTER_OTLP_ENDPOINT is required when ENABLE_OTEL is true',
      path: ['OTEL_EXPORTER_OTLP_ENDPOINT'],
    }
  )
  .refine(
    (env) => {
      const otelEnabledInProd = env.ENABLE_OTEL === 'true' && env.NODE_ENV === 'production';
      if (!otelEnabledInProd) return true;
      return !!env.AXIOM_TOKEN && !!env.AXIOM_DATASET;
    },
    {
      message: 'AXIOM_TOKEN and AXIOM_DATASET are required when ENABLE_OTEL is true in production',
      path: ['AXIOM_TOKEN'],
    }
  );
type ConfigSchema = z.infer<typeof configSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ConfigSchema {}
  }
}

export const loadEnv = () => {
  const validatedEnv = configSchema.safeParse(process.env);
  if (!validatedEnv.success) {
    console.error(`Error loading environment details. ${validatedEnv.error.message}`);
    throw new Error('INVALID CONFIG!', { cause: validatedEnv.error.issues });
  }
};
