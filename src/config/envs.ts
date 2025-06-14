import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  NATS_SERVERS: string;

  RATE_LIMIT_TTL: number;
  RATE_LIMIT_MAX: number;
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
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs: EnvVars = value;
