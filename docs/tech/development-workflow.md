# Development Workflow and Tooling

## Development Environment Setup

### Prerequisites

Before starting development, ensure you have the following installed:

| Tool | Minimum Version | Installation Command | Purpose |
|------|----------------|---------------------|---------|
| Node.js | 18.0.0 | `brew install node` (macOS) | JavaScript runtime |
| npm | 8.0.0 | Comes with Node.js | Package management |
| Git | 2.30.0 | `brew install git` (macOS) | Version control |
| Docker | 20.10.0 | Download from docker.com | Database containerization |
| VS Code | Latest | Download from code.visualstudio.com | Recommended IDE |

### Initial Setup

#### 1. Clone Repository
```bash
# Clone the repository
git clone https://github.com/your-org/solace-candidate-assignment.git
cd solace-candidate-assignment

# Create your feature branch
git checkout -b feature/your-feature-name
```

#### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
# Uncomment DATABASE_URL when using PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/solaceassignment"
```

#### 4. Database Setup
```bash
# Start PostgreSQL with Docker
docker compose up -d

# Verify container is running
docker ps

# Create database (if not auto-created)
docker exec -it postgres-container psql -U postgres -c "CREATE DATABASE solaceassignment;"

# Push schema to database
npx drizzle-kit push

# Seed database with test data
curl -X POST http://localhost:3000/api/seed
```

#### 5. Start Development Server
```bash
# Start Next.js development server
npm run dev

# Application available at http://localhost:3000
```

## Development Workflow

### Standard Development Cycle

```
┌────────────┐
│   Plan     │
└─────┬──────┘
      ↓
┌────────────┐
│   Code     │
└─────┬──────┘
      ↓
┌────────────┐
│   Test     │
└─────┬──────┘
      ↓
┌────────────┐
│  Review    │
└─────┬──────┘
      ↓
┌────────────┐
│   Deploy   │
└────────────┘
```

### 1. Planning Phase

#### Task Definition
- Review requirements in issue tracker
- Break down tasks into manageable units
- Estimate time and complexity
- Identify dependencies

#### Technical Design
```markdown
## Feature: [Feature Name]

### Requirements
- [ ] Requirement 1
- [ ] Requirement 2

### Technical Approach
- Database changes needed
- API endpoints to create/modify
- UI components to build
- Testing strategy

### Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
```

### 2. Coding Phase

#### Branch Strategy
```bash
# Feature branches
git checkout -b feature/add-advocate-search

# Bug fix branches
git checkout -b bugfix/fix-phone-validation

# Hotfix branches
git checkout -b hotfix/critical-security-fix

# Release branches
git checkout -b release/v1.2.0
```

#### Commit Convention
```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(api): add advocate search endpoint"
git commit -m "fix(ui): correct phone number formatting"
git commit -m "docs(api): update endpoint documentation"
git commit -m "style(components): format advocate table"
git commit -m "refactor(db): optimize advocate queries"
git commit -m "test(api): add advocate endpoint tests"
git commit -m "chore(deps): update dependencies"
```

#### Code Style Guidelines

**TypeScript:**
```typescript
// Use explicit types
interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  // ... other fields
}

// Use async/await over promises
async function fetchAdvocates(): Promise<Advocate[]> {
  const response = await fetch('/api/advocates');
  const data = await response.json();
  return data.data;
}

// Destructure when possible
const { firstName, lastName, city } = advocate;

// Use const for immutable values
const MAX_RESULTS = 100;
```

**React Components:**
```typescript
// Functional components with TypeScript
interface AdvocateCardProps {
  advocate: Advocate;
  onSelect: (id: number) => void;
}

export function AdvocateCard({ advocate, onSelect }: AdvocateCardProps) {
  return (
    <div onClick={() => onSelect(advocate.id)}>
      {/* Component content */}
    </div>
  );
}
```

### 3. Testing Phase

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- advocates.test.ts
```

#### Writing Tests
```typescript
// Example test structure
describe('Advocate API', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  test('should return list of advocates', async () => {
    const advocates = await fetchAdvocates();
    expect(advocates).toHaveLength(10);
  });

  test('should handle errors gracefully', async () => {
    // Test error scenarios
  });
});
```

### 4. Code Review Phase

#### Pre-Review Checklist
```markdown
- [ ] Code compiles without warnings
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Performance considerations addressed
- [ ] Security considerations addressed
```

#### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### 5. Deployment Phase

#### Build Process
```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Verify build output
ls -la .next/
```

## Tooling Configuration

### VS Code Configuration

#### Recommended Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### Workspace Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.next": true
  }
}
```

### ESLint Configuration

#### .eslintrc.json
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error"
  }
}
```

#### Running ESLint
```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Lint specific file
npx eslint src/app/page.tsx
```

### TypeScript Configuration

#### tsconfig.json Key Settings
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### Type Checking
```bash
# Run type check
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

### Git Hooks (Optional)

#### Pre-commit Hook
```bash
#!/bin/sh
# .husky/pre-commit

npm run lint
npm run typecheck
npm test
```

#### Setup Husky
```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run typecheck"
```

## Database Management

### Migration Workflow

#### Creating Migrations
```bash
# Generate migration from schema changes
npm run generate

# Review generated SQL
cat drizzle/0001_migration.sql

# Apply migration
npx drizzle-kit push
```

#### Migration Best Practices
1. Always review generated SQL before applying
2. Test migrations on a copy of production data
3. Include rollback scripts
4. Document breaking changes

### Database Backup and Restore

#### Backup
```bash
# Backup database
docker exec postgres-container pg_dump -U postgres solaceassignment > backup.sql

# Backup with timestamp
docker exec postgres-container pg_dump -U postgres solaceassignment > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Restore
```bash
# Restore from backup
docker exec -i postgres-container psql -U postgres solaceassignment < backup.sql
```

## Debugging

### Next.js Debugging

#### VS Code Debug Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

#### Debug Commands
```bash
# Start with Node.js inspector
NODE_OPTIONS='--inspect' npm run dev

# Start with verbose logging
DEBUG=* npm run dev
```

### Database Debugging

#### Query Logging
```typescript
// Enable query logging in Drizzle
const db = drizzle(queryClient, {
  logger: true
});
```

#### PostgreSQL Monitoring
```sql
-- View active connections
SELECT * FROM pg_stat_activity;

-- View slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Performance Optimization

### Build Optimization

#### Analyze Bundle Size
```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Run analysis
ANALYZE=true npm run build
```

#### Optimization Techniques
1. **Code Splitting**: Lazy load components
2. **Image Optimization**: Use Next.js Image component
3. **Font Optimization**: Use next/font
4. **Tree Shaking**: Remove unused code
5. **Minification**: Automatic in production builds

### Development Performance

#### Fast Refresh Configuration
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    turbo: {
      loaders: {
        '.md': ['@mdx-js/loader'],
      },
    },
  },
};
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npx tsc --noEmit
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Build application
        run: npm run build
```

## Monitoring and Logging

### Application Monitoring

#### Structured Logging
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ 
      level: 'info', 
      message, 
      ...meta, 
      timestamp: new Date().toISOString() 
    }));
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      message, 
      error: error?.stack, 
      ...meta, 
      timestamp: new Date().toISOString() 
    }));
  }
};
```

#### Performance Monitoring
```typescript
// Monitor API response times
export async function GET(request: Request) {
  const start = performance.now();
  
  try {
    const data = await fetchAdvocates();
    const duration = performance.now() - start;
    
    logger.info('API request completed', { 
      endpoint: '/api/advocates', 
      duration 
    });
    
    return Response.json({ data });
  } catch (error) {
    logger.error('API request failed', error);
    throw error;
  }
}
```

## Troubleshooting Guide

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Module not found | Missing dependency | Run `npm install` |
| TypeScript errors | Type mismatches | Check type definitions |
| Database connection failed | Wrong credentials | Verify DATABASE_URL |
| Port already in use | Another process on 3000 | Change port or kill process |
| Build fails | Syntax errors | Run linter and fix issues |
| Tests fail | Outdated snapshots | Update test snapshots |

### Debug Commands

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset database
docker compose down -v
docker compose up -d
npx drizzle-kit push
npm run seed

# Check Node.js version
node --version

# Check npm packages
npm list

# View npm scripts
npm run
```

## Best Practices

### Code Quality
1. Write self-documenting code
2. Keep functions small and focused
3. Use meaningful variable names
4. Add JSDoc comments for public APIs
5. Handle errors appropriately

### Security
1. Never commit sensitive data
2. Use environment variables for secrets
3. Validate all user inputs
4. Sanitize data before database operations
5. Keep dependencies updated

### Performance
1. Optimize images and assets
2. Implement lazy loading
3. Use pagination for large datasets
4. Cache expensive operations
5. Monitor bundle size

### Team Collaboration
1. Write clear commit messages
2. Create detailed pull requests
3. Respond to code reviews promptly
4. Document architectural decisions
5. Share knowledge through documentation

## Conclusion

This development workflow provides a comprehensive guide for working with the Solace Advocates Platform. Following these practices ensures consistent, high-quality code delivery while maintaining team productivity and code maintainability.