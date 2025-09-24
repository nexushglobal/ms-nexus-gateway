import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  NATS_SERVERS: string;
  ORIGIN: string[];
  API_KEY: string;
  REQUEST_TIMEOUT_MS: number;
}

const envsSchema = joi
  .object({
    NATS_SERVERS: joi
      .string()
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
        joi.string().custom((value, helpers) => {
          try {
            if (typeof value !== 'string') {
              return helpers.error('any.invalid');
            }
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
              return helpers.error('any.invalid');
            }
            return parsed as string[];
          } catch {
            return helpers.error('any.invalid');
          }
        }),
      )
      .default([
        'http://localhost:3000',
        'http://localhost:4321',
        'http://app.hoppscotch',
      ]),
    API_KEY: joi.string().default('secret').description('API Key'),
    REQUEST_TIMEOUT_MS: joi
      .number()
      .default(120000)
      .min(1000)
      .max(300000)
      .description('Request timeout in milliseconds (1s - 5min)'),
  })

  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs: EnvVars = value;
