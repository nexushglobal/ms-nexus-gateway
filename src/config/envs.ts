import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  NATS_SERVERS: string;
  ORIGIN: string[];
}

const envsSchema = joi
  .object({
    NATS_SERVERS: joi
      .string()
      .uri()
      .default('nats://localhost:4222')
      .description('NATS server URI'),
    PORT: joi.number().default(3000),
    NODE_ENV: joi
      .string()
      .valid('development', 'production', 'test')
      .default('development'),

    ORIGIN: joi
      .alternatives()
      .try(
        joi.array().items(joi.string().uri()),
        joi.string().custom((value, helpers): string[] | never => {
          try {
            if (typeof value !== 'string') {
              helpers.error('any.invalid');
              throw new Error('Invalid value');
            }
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
              helpers.error('any.invalid');
              throw new Error('Invalid value');
            }
            return parsed as string[];
          } catch {
            helpers.error('any.invalid');
            throw new Error('Invalid value');
          }
        }),
      )
      .default([
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:4321',
      ]),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs: EnvVars = value;
