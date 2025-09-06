## Solace Candidate Assignment

This project features a **Next.js frontend** with a **Nest.js backend** providing a robust advocate search and management system.

## Architecture

- **Frontend**: Next.js with React, TypeScript, Tailwind CSS
- **Backend**: Nest.js API with Swagger documentation
- **Database**: PostgreSQL with Drizzle ORM
- **Features**: Full-text search, pagination, dark mode, responsive design

## Getting Started

### Quick Setup

```bash
# Install dependencies for both frontend and backend
npm install
cd backend && npm install && cd ..

# Setup database and start both services
npm run dev:backend        # Start backend (port 4000)
npm run dev               # Start frontend (port 3000) in another terminal
```

### Development Commands

```bash
# Frontend (Next.js)
npm run dev               # Start frontend dev server (port 3000)
npm run build             # Build frontend for production

# Backend (Nest.js)
npm run dev:backend       # Start backend dev server (port 4000)
npm run build:backend     # Build backend for production

# Database
npm run db:setup          # Setup fresh database (from root)
npm run seed              # Seed sample data (from root)
```

## Database Setup

The backend requires PostgreSQL. Follow these steps:

### 1. Install PostgreSQL
```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb solaceassignment_backend
```

### 2. Setup Backend Database
```bash
cd backend

# Configure environment (already set in backend/.env)
# DATABASE_URL=postgresql://username@localhost:5432/solaceassignment_backend

# Run migrations and seed data
npm run db:setup         # Creates tables and seeds sample data
# OR run separately:
npm run migrate:up       # Create database schema
npm run seed            # Add sample data (15 advocates)

# For performance testing
npm run seed:performance 100000  # Seed 100k records for testing
```

### 3. Alternative: Fresh Database Setup
```bash
# Drop and recreate database
dropdb solaceassignment_backend
createdb solaceassignment_backend
cd backend && npm run db:setup
```

## API Documentation

The backend provides Swagger/OpenAPI documentation:
- **URL**: http://localhost:4000/api/docs
- **Endpoints**: 
  - `GET /api/advocates` - Search and list advocates
  - `GET /api/advocates/:id` - Get single advocate
  - `GET /api/advocates/specialty/:specialty` - Filter by specialty

## Testing

```bash
# Test backend API directly
curl "http://localhost:4000/api/advocates"
curl "http://localhost:4000/api/advocates?search=anxiety"
curl "http://localhost:4000/api/advocates?specialties=ADHD"

# Performance testing
cd backend
npm run seed:performance 100000  # Seed 100k advocates
# Test performance with large dataset
```

## Project Structure

```
├── src/                    # Next.js frontend
│   ├── app/
│   ├── components/
│   └── hooks/
├── backend/               # Nest.js backend
│   ├── src/
│   │   ├── advocates/     # Advocates module
│   │   ├── database/      # Database config, migrations, seeds
│   │   └── main.ts
│   └── package.json
├── docs/                  # Documentation
└── README.md
```
