import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  TZ: z.string(),

  // Discord config
  TOKEN: z.string(),
  CLIENT_ID: z.string(),
  GUILD_ID: z.string().optional(),
});
type ConfigSchema = z.infer<typeof configSchema>;

declare global {
  namespace NodeJS {
    // rome-ignore lint/suspicious/noEmptyInterface: We already know which types we need.
    interface ProcessEnv extends ConfigSchema {}
  }
}

export const loadEnv = () => {
  const config = dotenv.config();
  dotenvExpand.expand(config);

  const validatedEnv = configSchema.safeParse(process.env);
  if (!validatedEnv.success) {
    throw new Error('INVALID CONFIG!', { cause: validatedEnv.error.issues });
  }
};
