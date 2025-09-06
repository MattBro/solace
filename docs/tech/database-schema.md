# Database Schema Documentation

## Overview

The Solace Advocates Platform uses PostgreSQL as its primary database with Drizzle ORM for type-safe database interactions. This document provides comprehensive documentation of the database schema, relationships, indexes, and optimization strategies.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────┐
│              advocates                   │
├─────────────────────────────────────────┤
│ PK │ id                  │ SERIAL       │
│    │ first_name          │ TEXT         │
│    │ last_name           │ TEXT         │
│    │ city                │ TEXT         │
│    │ degree              │ TEXT         │
│    │ specialties         │ JSONB        │
│    │ years_of_experience │ INTEGER      │
│    │ phone_number        │ BIGINT       │
│    │ created_at          │ TIMESTAMP    │
└─────────────────────────────────────────┘
```

## Table: advocates

### Purpose
Stores comprehensive information about healthcare advocates including personal details, professional qualifications, and contact information.

### Schema Definition

```sql
CREATE TABLE advocates (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    city TEXT NOT NULL,
    degree TEXT NOT NULL,
    specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
    years_of_experience INTEGER NOT NULL,
    phone_number BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Column Specifications

| Column | Type | Constraints | Description | Example |
|--------|------|------------|-------------|---------|
| `id` | SERIAL | PRIMARY KEY, NOT NULL | Unique identifier, auto-incremented | 1, 2, 3... |
| `first_name` | TEXT | NOT NULL | Advocate's first name | "Jane" |
| `last_name` | TEXT | NOT NULL | Advocate's last name | "Smith" |
| `city` | TEXT | NOT NULL | City of practice | "New York" |
| `degree` | TEXT | NOT NULL | Medical degree or certification | "MD", "DO", "NP" |
| `specialties` | JSONB | NOT NULL, DEFAULT '[]' | Array of specialty areas | ["Cardiology", "Internal Medicine"] |
| `years_of_experience` | INTEGER | NOT NULL | Years of professional experience | 15 |
| `phone_number` | BIGINT | NOT NULL | Contact phone number (no formatting) | 5551234567 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp | 2024-01-15 10:30:00 |

### Drizzle ORM Schema

```typescript
import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  integer,
  bigint,
  jsonb,
  timestamp
} from "drizzle-orm/pg-core";

export const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  specialties: jsonb("specialties").$type<string[]>().default([]).notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Type inference
export type Advocate = typeof advocates.$inferSelect;
export type NewAdvocate = typeof advocates.$inferInsert;
```

## Indexes

### Current Indexes

```sql
-- Primary key index (automatic)
CREATE UNIQUE INDEX advocates_pkey ON advocates(id);

-- Recommended additional indexes for performance
CREATE INDEX idx_advocates_last_name ON advocates(last_name);
CREATE INDEX idx_advocates_city ON advocates(city);
CREATE INDEX idx_advocates_specialties ON advocates USING GIN (specialties);
CREATE INDEX idx_advocates_created_at ON advocates(created_at DESC);
```

### Index Strategy

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `advocates_pkey` | id | B-tree (Unique) | Primary key lookups |
| `idx_advocates_last_name` | last_name | B-tree | Name-based searches |
| `idx_advocates_city` | city | B-tree | Location-based filtering |
| `idx_advocates_specialties` | specialties | GIN | JSONB array searches |
| `idx_advocates_created_at` | created_at | B-tree | Time-based sorting |

## Data Types Explanation

### SERIAL
- Auto-incrementing integer
- Starts at 1
- Guaranteed unique
- Cannot be null

### TEXT
- Variable-length character string
- No length limit in PostgreSQL
- UTF-8 encoding supported
- Efficient for varying text lengths

### INTEGER
- 4-byte signed integer
- Range: -2,147,483,648 to 2,147,483,647
- Suitable for years of experience

### BIGINT
- 8-byte signed integer
- Range: -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807
- Used for phone numbers to avoid formatting issues

### JSONB
- Binary JSON storage
- Supports indexing
- Efficient querying
- Flexible schema for specialties array

### TIMESTAMP
- Date and time without timezone
- Microsecond precision
- Default to current time for audit trail

## Constraints

### Not Null Constraints
All fields except `created_at` are required to ensure data integrity.

### Default Values
- `specialties`: Empty array `[]`
- `created_at`: Current timestamp

### Potential Future Constraints

```sql
-- Ensure positive experience
ALTER TABLE advocates 
ADD CONSTRAINT check_positive_experience 
CHECK (years_of_experience >= 0);

-- Validate phone number length
ALTER TABLE advocates 
ADD CONSTRAINT check_phone_length 
CHECK (phone_number >= 1000000000 AND phone_number <= 9999999999);

-- Ensure specialties is an array
ALTER TABLE advocates 
ADD CONSTRAINT check_specialties_array 
CHECK (jsonb_typeof(specialties) = 'array');
```

## JSONB Specialties Structure

### Schema
```json
[
  "Specialty 1",
  "Specialty 2",
  "Specialty 3"
]
```

### Common Queries

```sql
-- Find advocates with specific specialty
SELECT * FROM advocates 
WHERE specialties @> '["Cardiology"]';

-- Find advocates with any of multiple specialties
SELECT * FROM advocates 
WHERE specialties ?| array['Cardiology', 'Pediatrics'];

-- Count specialties per advocate
SELECT id, first_name, last_name, 
       jsonb_array_length(specialties) as specialty_count
FROM advocates;

-- Extract all unique specialties
SELECT DISTINCT jsonb_array_elements_text(specialties) as specialty
FROM advocates
ORDER BY specialty;
```

## Sample Data

```sql
INSERT INTO advocates (
    first_name, 
    last_name, 
    city, 
    degree, 
    specialties, 
    years_of_experience, 
    phone_number
) VALUES 
(
    'Jane',
    'Smith',
    'New York',
    'MD',
    '["Cardiology", "Internal Medicine"]'::jsonb,
    15,
    5551234567
),
(
    'John',
    'Doe',
    'Los Angeles',
    'DO',
    '["Pediatrics", "Emergency Medicine"]'::jsonb,
    8,
    5559876543
);
```

## Migration Strategies

### Adding New Columns

```sql
-- Add email column
ALTER TABLE advocates 
ADD COLUMN email TEXT;

-- Add with default value
ALTER TABLE advocates 
ADD COLUMN status TEXT DEFAULT 'active';

-- Add with not null (requires default for existing rows)
ALTER TABLE advocates 
ADD COLUMN verified BOOLEAN NOT NULL DEFAULT false;
```

### Modifying Columns

```sql
-- Change column type
ALTER TABLE advocates 
ALTER COLUMN degree TYPE VARCHAR(10);

-- Add not null constraint
ALTER TABLE advocates 
ALTER COLUMN email SET NOT NULL;

-- Remove constraint
ALTER TABLE advocates 
ALTER COLUMN email DROP NOT NULL;
```

### Renaming Columns

```sql
ALTER TABLE advocates 
RENAME COLUMN phone_number TO contact_phone;
```

## Performance Considerations

### Query Optimization

```sql
-- Efficient: Uses index
SELECT * FROM advocates WHERE last_name = 'Smith';

-- Efficient: Uses GIN index
SELECT * FROM advocates WHERE specialties @> '["Cardiology"]';

-- Inefficient: Full table scan
SELECT * FROM advocates WHERE first_name LIKE '%ohn%';

-- Optimized with index
CREATE INDEX idx_advocates_name_trgm ON advocates 
USING gin (first_name gin_trgm_ops, last_name gin_trgm_ops);
```

### Partitioning Strategy (Future)

```sql
-- Partition by creation year for large datasets
CREATE TABLE advocates_2024 PARTITION OF advocates
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE advocates_2025 PARTITION OF advocates
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

## Data Integrity

### Referential Integrity (Future)

```sql
-- Future: Separate specialties table
CREATE TABLE specialties (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE advocate_specialties (
    advocate_id INTEGER REFERENCES advocates(id),
    specialty_id INTEGER REFERENCES specialties(id),
    PRIMARY KEY (advocate_id, specialty_id)
);
```

### Data Validation

```typescript
// Drizzle validation before insert
const validateAdvocate = (data: NewAdvocate) => {
  if (data.yearsOfExperience < 0) {
    throw new Error('Years of experience must be non-negative');
  }
  
  if (String(data.phoneNumber).length !== 10) {
    throw new Error('Phone number must be 10 digits');
  }
  
  if (!Array.isArray(data.specialties)) {
    throw new Error('Specialties must be an array');
  }
};
```

## Backup and Recovery

### Backup Commands

```bash
# Full database backup
pg_dump -h localhost -U postgres -d solaceassignment > backup.sql

# Table-specific backup
pg_dump -h localhost -U postgres -d solaceassignment -t advocates > advocates_backup.sql

# Compressed backup
pg_dump -h localhost -U postgres -d solaceassignment | gzip > backup.sql.gz
```

### Recovery Commands

```bash
# Restore full database
psql -h localhost -U postgres -d solaceassignment < backup.sql

# Restore specific table
psql -h localhost -U postgres -d solaceassignment < advocates_backup.sql
```

## Monitoring Queries

### Table Statistics

```sql
-- Table size
SELECT 
    pg_size_pretty(pg_total_relation_size('advocates')) as total_size,
    pg_size_pretty(pg_relation_size('advocates')) as table_size,
    pg_size_pretty(pg_indexes_size('advocates')) as indexes_size;

-- Row count
SELECT COUNT(*) FROM advocates;

-- Average row size
SELECT 
    pg_size_pretty(avg(pg_column_size(advocates.*))::bigint) as avg_row_size
FROM advocates;
```

### Performance Monitoring

```sql
-- Slow queries
SELECT 
    query,
    calls,
    total_time,
    mean,
    max
FROM pg_stat_statements
WHERE query LIKE '%advocates%'
ORDER BY mean DESC
LIMIT 10;

-- Index usage
SELECT 
    indexrelname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Future Schema Evolution

### Proposed Enhancements

1. **User Authentication Table**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **Advocate Availability**
```sql
CREATE TABLE advocate_availability (
    id SERIAL PRIMARY KEY,
    advocate_id INTEGER REFERENCES advocates(id),
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT valid_day CHECK (day_of_week BETWEEN 0 AND 6)
);
```

3. **Audit Log**
```sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id INTEGER,
    changed_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Database Maintenance

### Regular Maintenance Tasks

```sql
-- Update statistics
ANALYZE advocates;

-- Rebuild indexes
REINDEX TABLE advocates;

-- Vacuum to reclaim space
VACUUM FULL advocates;

-- Check for bloat
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS external_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Security Considerations

### Access Control

```sql
-- Create read-only user
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE solaceassignment TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Create application user with limited permissions
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE solaceassignment TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON advocates TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### Data Encryption

```sql
-- Future: Encrypt sensitive data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt phone numbers
ALTER TABLE advocates 
ADD COLUMN phone_encrypted BYTEA;

UPDATE advocates 
SET phone_encrypted = pgp_sym_encrypt(phone_number::text, 'encryption_key');
```

## Raw SQL vs Drizzle Usage

### Design Decision: Mixed Approach

The advocate repository (`src/app/api/advocates/repositories/advocate.repository.ts`) uses raw SQL instead of Drizzle's query builder for several operations. This is an intentional design decision based on the following factors:

#### When Raw SQL is Used

1. **Full-Text Search Operations**
   - PostgreSQL `search_vector @@ to_tsquery()` queries
   - `ts_rank()` functions for search result ranking
   - Complex search query building with prefix matching

2. **JSONB Operations** 
   - `payload::jsonb ?|` for "any of" specialty matching
   - `payload::jsonb @>` for exact specialty matching
   - Complex array operations that aren't well-supported by query builders

#### Why Raw SQL is Preferred for Search

**Advantages:**
- Full control over PostgreSQL-specific features
- Optimal performance for complex search queries
- Direct access to full-text search ranking
- No risk of ORM generating inefficient queries

**Trade-offs Accepted:**
- Reduced type safety (mitigated by TypeScript interfaces)
- Manual SQL maintenance (acceptable for core search functionality)
- Less consistency with simple CRUD operations

#### Example: Full-Text Search Query

```sql
SELECT id, first_name, last_name, city, degree, payload as specialties, 
       years_of_experience, phone_number, created_at, 
       ts_rank(search_vector, to_tsquery('english', ${searchQuery})) as rank
FROM advocates
WHERE search_vector @@ to_tsquery('english', ${searchQuery})
ORDER BY rank DESC
LIMIT ${limit} OFFSET ${offset}
```

This query combines:
- Full-text search matching
- Relevance ranking with `ts_rank()`
- Proper result ordering
- Efficient pagination

Attempting to replicate this with Drizzle would require complex workarounds and potentially sacrifice performance.

#### Future Considerations

- Simple CRUD operations could migrate to Drizzle for type safety
- Search operations will remain raw SQL for performance
- Consider custom Drizzle extensions for reusable PostgreSQL functions

This mixed approach balances the benefits of type-safe ORM usage with the performance requirements of advanced PostgreSQL features.

## Conclusion

The database schema is designed to be simple, efficient, and scalable. The use of PostgreSQL with JSONB provides flexibility for evolving requirements while maintaining strong data integrity and performance characteristics. The strategic use of raw SQL for search operations ensures optimal performance while preserving type safety where it matters most.