import path from 'path';
import fs from 'fs';
import { z } from 'zod';

export const CommandFileSchema = z.object({
  prefix: z.string().optional(),
});

export type ICommandFileSchema = z.infer<typeof CommandFileSchema>;

const DEFAULT_CONFIG = {
  prefix: '-',
} as const;

export const parseConfigFile = () => {
  try {
    const pathToConfigFile = path.resolve(__dirname, '..', '..', 'config.json');
    const content = fs.readFileSync(pathToConfigFile, { encoding: 'utf-8' });
    const rawData = JSON.parse(content);

    const validateResult: ICommandFileSchema = CommandFileSchema.parse(rawData);
    return { ...DEFAULT_CONFIG, ...validateResult };
  } catch (error: any) {
    console.error(`There's an error reading the config file. Error: ${error}`);
    console.log('LOADING DEFAULT CONFIG');
    return DEFAULT_CONFIG;
  }
};
