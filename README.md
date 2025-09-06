## Solace Candidate Assignment

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Quick Start with Make

The easiest way to get started is using the included Makefile:

```bash
# Complete setup (install deps, postgres, create db, migrate, seed)
make full-setup

# Start the development server
make dev
```

### Manual Setup

Install dependencies

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

## Database Setup

The app is configured to return a default list of advocates. This will allow you to get the app up and running without needing to configure a database. 

### Option 1: Using Make (Recommended)

```bash
# Complete database setup (postgres, db creation, migration, seeding)
make setup-db

# Or step by step:
make install-postgres  # Install PostgreSQL via Homebrew
make start-postgres    # Start PostgreSQL service
make create-db        # Create the database
make migrate          # Run migrations
make seed             # Seed with sample data

# Enable/disable database connection
make enable-db        # Switch to database
make disable-db       # Switch back to mock data
```

### Option 2: Using Docker

The project includes a docker-compose.yml for PostgreSQL:

```bash
docker compose up -d
```

Then create the database and run migrations:

```bash
npx drizzle-kit push
curl -X POST http://localhost:3000/api/seed
```

### Option 3: Manual Setup

1. Install PostgreSQL locally
2. Create a `solaceassignment` database
3. Push migration to the database: `npx drizzle-kit push`
4. Seed the database: `curl -X POST http://localhost:3000/api/seed`

To enable the database connection, uncomment the DATABASE_URL in `.env` and the database query in `src/app/api/advocates/route.ts`.
