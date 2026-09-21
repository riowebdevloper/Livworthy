if (!process.env.DATABASE_URL) {
  throw new Error('[drizzle.config] DATABASE_URL environment variable is required');
}

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
