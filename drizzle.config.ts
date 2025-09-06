const config = {
  dialect: "postgresql",
  schema: "./src/app/api/db/schema/advocates.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
};

export default config;
