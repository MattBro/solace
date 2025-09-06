require('dotenv').config();
const { drizzle } = require("drizzle-orm/postgres-js");
const { migrate } = require("drizzle-orm/postgres-js/migrator");
const postgres = require("postgres");
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  console.log(process.env.DATABASE_URL);

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);
  
  // Create the advocates table
  console.log("Creating advocates table...");
  await sql`
    CREATE TABLE IF NOT EXISTS advocates (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      city VARCHAR(100),
      degree VARCHAR(100),
      payload JSONB,
      years_of_experience INTEGER,
      phone_number VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  // Apply full-text search migration
  const ftsPath = path.join(__dirname, 'add-fulltext-search.sql');
  if (fs.existsSync(ftsPath)) {
    console.log("Applying full-text search migration...");
    const ftsSql = fs.readFileSync(ftsPath, 'utf8');
    await sql.unsafe(ftsSql);
  }
  
  await sql.end();
};

runMigration()
  .then(() => {
    console.log("Successfully ran migration.");

    process.exit(0);
  })
  .catch((e) => {
    console.error("Failed to run migration.");
    console.error(e);

    process.exit(1);
  });
