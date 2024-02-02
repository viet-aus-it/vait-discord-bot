import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { z } from 'zod';

const configSchema = z.object({
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

  // Database config
  DATABASE_URL: z.string(),
});
type ConfigSchema = z.infer<typeof configSchema>;

declare global {
  namespace NodeJS {
    // biome-ignore lint/suspicious/noEmptyInterface: We already know which types we need.
    interface ProcessEnv extends ConfigSchema {}
  }
}

export const loadEnv = () => {
  const config = dotenv.config();
  dotenvExpand.expand(config);

  const validatedEnv = configSchema.safeParse(process.env);
  if (!validatedEnv.success) {
    console.error(`Error loading environment details. ${validatedEnv.error.message}`);
    throw new Error('INVALID CONFIG!', { cause: validatedEnv.error.issues });
  }
};
