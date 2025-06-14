import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  NATS_SERVERS: string;
  ORIGIN: string[];

  RATE_LIMIT_TTL: number;
  RATE_LIMIT_MAX: number;
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

    RATE_LIMIT_TTL: joi
      .number()
      .default(60000)
      .description('Rate limit time window in milliseconds'),
    RATE_LIMIT_MAX: joi
      .number()
      .default(100)
      .description('Maximum requests per time window'),
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
