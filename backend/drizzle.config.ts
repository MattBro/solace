import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schemas/*',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/solace_dev',
  },
} satisfies Config;