# Architecture Reorganization: Database Consolidation

## Date: 2025-09-06

## Problem Statement
The current architecture splits database concerns between `src/db/` and `src/app/api/`, creating unnecessary separation between closely related components. The repository layer in `api/advocates/repositories/` directly depends on the database layer, yet they live in different directory hierarchies.

## Current Structure Issues
1. **Scattered Database Logic**: Database connection, schema, and migrations are in `src/db/` while the code that uses them is in `src/app/api/`
2. **Cross-boundary Imports**: Repository files import from `@/db`, crossing logical architecture boundaries
3. **Inconsistent Organization**: API has a well-organized layered structure (repositories, services, types) but database sits outside this hierarchy
4. **Maintenance Complexity**: Related changes require updates across multiple directory trees

## Solution: Consolidate Database into API Directory

### New Structure
```
src/
├── app/
│   ├── api/
│   │   ├── db/                    # All database concerns
│   │   │   ├── client.ts          # Database connection (formerly src/db/index.ts)
│   │   │   ├── schema/            # Schema definitions
│   │   │   │   ├── index.ts       # Schema exports
│   │   │   │   └── advocates.ts   # Advocates table schema
│   │   │   ├── migrations/        # Database migrations
│   │   │   │   └── migrate.js     # Migration runner
│   │   │   └── seed/              # Seed data
│   │   │       ├── advocates.ts
│   │   │       └── performance-seed.ts
│   │   ├── advocates/
│   │   │   ├── repositories/     # Data access layer
│   │   │   ├── services/         # Business logic
│   │   │   ├── types/            # TypeScript types
│   │   │   ├── utils/            # Utilities
│   │   │   └── route.ts          # API endpoint
│   │   └── seed/
│   │       └── route.ts          # Seed API endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Frontend components
├── contexts/                     # React contexts
├── hooks/                        # React hooks
└── types/                        # Shared types
```

## Benefits

### 1. Improved Cohesion
- All backend/API concerns live under `app/api/`
- Database layer is co-located with its consumers
- Clear separation between frontend and backend

### 2. Better Domain Organization
- Each API domain can own its complete data layer
- Future domains (e.g., `api/patients/`) can have their own schemas
- Easier to understand data flow within a domain

### 3. Simplified Imports
- Repository imports become relative: `import db from "../db/client"`
- No more cross-boundary imports with `@/db`
- Clearer dependency graph

### 4. Scalability
- As the app grows, each API domain can manage its own schema
- Microservice extraction becomes easier if needed
- Better supports domain-driven design

## Implementation Steps

### Phase 1: Move Files
1. Create `src/app/api/db/` directory structure
2. Move `src/db/index.ts` → `src/app/api/db/client.ts`
3. Move `src/db/schema.ts` → `src/app/api/db/schema/advocates.ts`
4. Create `src/app/api/db/schema/index.ts` to export all schemas
5. Move `src/db/migrate.js` → `src/app/api/db/migrations/migrate.js`
6. Move `src/db/seed/*` → `src/app/api/db/seed/`

### Phase 2: Update Imports
1. Update repository imports from `@/db` to `../../db/client`
2. Update schema imports to use new paths
3. Update seed route to use new paths
4. Update any other files importing from old db location

### Phase 3: Update Configuration
1. Update `drizzle.config.ts` to point to new schema location
2. Update `package.json` scripts if they reference db paths
3. Update any environment or build configurations

### Phase 4: Testing
1. Run migrations to ensure they still work
2. Test database connection
3. Verify API endpoints function correctly
4. Run build to check for any import errors

## Migration Commands
```bash
# Create new directory structure
mkdir -p src/app/api/db/schema
mkdir -p src/app/api/db/migrations
mkdir -p src/app/api/db/seed

# Move files (to be executed)
mv src/db/index.ts src/app/api/db/client.ts
mv src/db/schema.ts src/app/api/db/schema/advocates.ts
mv src/db/migrate.js src/app/api/db/migrations/migrate.js
mv src/db/seed/* src/app/api/db/seed/

# Remove old directory
rmdir src/db/seed
rmdir src/db
```

## Rollback Plan
If issues arise:
1. Git revert the commit
2. Move files back to original locations
3. Restore original import paths
4. Revert drizzle.config.ts changes

## Success Criteria
- [ ] All database files moved to `app/api/db/`
- [ ] All imports updated and working
- [ ] Application builds without errors
- [ ] API endpoints function correctly
- [ ] Database migrations run successfully
- [ ] No regression in functionality

## Long-term Vision
This reorganization sets the foundation for:
- Domain-driven design with self-contained API modules
- Easier testing with isolated domain boundaries
- Potential microservice extraction
- Better code organization as the application scales