# API and Integration Documentation

## API Overview

The Solace Advocates Platform provides a RESTful API for managing healthcare advocate data. The API is built using Next.js API routes and follows REST conventions for resource management.

## Base Configuration

### Base URL
```
Development: http://localhost:3000/api
Production: https://[your-domain]/api
```

### Request Headers
```http
Content-Type: application/json
Accept: application/json
```

### Response Format
All API responses follow a consistent JSON structure:

```json
{
  "data": [...] | {...},
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## API Endpoints

### 1. Get Advocates

Retrieves a list of all advocates in the system.

**Endpoint:** `GET /api/advocates`

**Request:**
```http
GET /api/advocates HTTP/1.1
Host: localhost:3000
Accept: application/json
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "firstName": "Jane",
      "lastName": "Smith",
      "city": "New York",
      "degree": "MD",
      "specialties": ["Cardiology", "Internal Medicine"],
      "yearsOfExperience": 15,
      "phoneNumber": 5551234567,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe",
      "city": "Los Angeles",
      "degree": "DO",
      "specialties": ["Pediatrics"],
      "yearsOfExperience": 8,
      "phoneNumber": 5559876543,
      "createdAt": "2024-01-16T14:20:00Z"
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier for the advocate |
| firstName | string | Advocate's first name |
| lastName | string | Advocate's last name |
| city | string | City where advocate practices |
| degree | string | Medical degree or certification |
| specialties | array | List of medical specialties |
| yearsOfExperience | number | Years of professional experience |
| phoneNumber | number | Contact phone number |
| createdAt | string | ISO 8601 timestamp of record creation |

**Error Responses:**

| Status Code | Description | Example |
|-------------|-------------|---------|
| 500 | Internal Server Error | Database connection failure |

### 2. Seed Database

Populates the database with initial advocate data for development and testing.

**Endpoint:** `POST /api/seed`

**Request:**
```http
POST /api/seed HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "data": {
    "message": "Database seeded successfully",
    "count": 10
  }
}
```

**Response (409 Conflict):**
```json
{
  "error": {
    "code": "DATA_EXISTS",
    "message": "Database already contains data"
  }
}
```

**Error Responses:**

| Status Code | Description | Example |
|-------------|-------------|---------|
| 409 | Conflict | Data already exists |
| 500 | Internal Server Error | Database operation failed |

## Database Integration

### PostgreSQL Configuration

The application uses PostgreSQL as its primary database. Connection configuration is managed through environment variables.

#### Environment Variables

```bash
# .env file
DATABASE_URL="postgresql://user:password@localhost:5432/solaceassignment"
```

#### Connection String Format
```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

### Drizzle ORM Integration

The application uses Drizzle ORM for type-safe database operations.

#### Configuration (drizzle.config.ts)
```typescript
const config = {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
};
```

#### Schema Definition
```typescript
const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  specialties: jsonb("payload").default([]).notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});
```

### Database Operations

#### Query Examples

**Select All Advocates:**
```typescript
const advocates = await db.select().from(advocatesTable);
```

**Insert Advocate:**
```typescript
const newAdvocate = await db.insert(advocatesTable).values({
  firstName: "Jane",
  lastName: "Doe",
  city: "Boston",
  degree: "MD",
  specialties: ["Neurology"],
  yearsOfExperience: 10,
  phoneNumber: 5551234567
}).returning();
```

**Update Advocate:**
```typescript
const updated = await db.update(advocatesTable)
  .set({ city: "Seattle" })
  .where(eq(advocatesTable.id, 1))
  .returning();
```

**Delete Advocate:**
```typescript
const deleted = await db.delete(advocatesTable)
  .where(eq(advocatesTable.id, 1))
  .returning();
```

### Migration Management

#### Generate Migration
```bash
npm run generate
# or
npx drizzle-kit generate
```

#### Apply Migration
```bash
npm run migrate:up
# or
npx drizzle-kit push
```

#### Migration Files
Migrations are stored in the `drizzle/` directory and tracked in version control.

## Client Integration

### JavaScript/TypeScript Integration

#### Fetch API Example
```typescript
// Get all advocates
async function getAdvocates() {
  try {
    const response = await fetch('/api/advocates');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch advocates:', error);
    throw error;
  }
}

// Seed database
async function seedDatabase() {
  try {
    const response = await fetch('/api/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
}
```

#### React Hook Integration
```typescript
import { useState, useEffect } from 'react';

function useAdvocates() {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAdvocates() {
      try {
        const response = await fetch('/api/advocates');
        const data = await response.json();
        setAdvocates(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAdvocates();
  }, []);

  return { advocates, loading, error };
}
```

### curl Examples

```bash
# Get all advocates
curl -X GET http://localhost:3000/api/advocates \
  -H "Accept: application/json"

# Seed database
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json"

# Pretty print JSON response
curl -X GET http://localhost:3000/api/advocates \
  -H "Accept: application/json" | jq '.'
```

## Data Source Integration

The application supports two data source modes:

### 1. Static Data Mode (Default)
Uses in-memory advocate data from `src/db/seed/advocates.ts`

```typescript
// src/app/api/advocates/route.ts
const data = advocateData; // Static data
```

### 2. Database Mode
Queries live data from PostgreSQL database

```typescript
// src/app/api/advocates/route.ts
const data = await db.select().from(advocates); // Database query
```

### Switching Data Sources

To enable database mode:

1. Uncomment the database URL in `.env`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/solaceassignment"
```

2. Uncomment the database query in `src/app/api/advocates/route.ts`:
```typescript
const data = await db.select().from(advocates);
// const data = advocateData; // Comment out static data
```

## Error Handling

### API Error Structure

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| DATABASE_ERROR | Database operation failed | 500 |
| CONNECTION_ERROR | Cannot connect to database | 503 |
| VALIDATION_ERROR | Invalid request data | 400 |
| NOT_FOUND | Resource not found | 404 |
| DATA_EXISTS | Duplicate data conflict | 409 |

### Error Handling Best Practices

```typescript
export async function GET() {
  try {
    // Attempt database operation
    const data = await db.select().from(advocates);
    
    return Response.json({ data }, { status: 200 });
  } catch (error) {
    // Log error for debugging
    console.error('Database error:', error);
    
    // Return user-friendly error
    return Response.json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve advocates',
        details: process.env.NODE_ENV === 'development' 
          ? { originalError: error.message } 
          : undefined
      }
    }, { status: 500 });
  }
}
```

## Authentication & Authorization

### Current State
The API currently operates without authentication, suitable for development and internal use.

### Future Authentication Strategy

#### JWT Token Authentication
```typescript
// Proposed authentication middleware
export async function authenticateRequest(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No authentication token provided');
  }
  
  const payload = await verifyJWT(token);
  return payload;
}

// Protected endpoint example
export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    const data = await db.select().from(advocates);
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

#### API Key Authentication
```typescript
// Alternative: API key authentication
const API_KEY = process.env.API_KEY;

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (apiKey !== API_KEY) {
    return Response.json({ 
      error: 'Invalid API key' 
    }, { status: 401 });
  }
  
  // Process request...
}
```

## Rate Limiting

### Implementation Strategy

```typescript
// Rate limiting with in-memory store
const rateLimitStore = new Map();

function rateLimit(ip: string, limit: number = 100, window: number = 60000) {
  const now = Date.now();
  const userLimits = rateLimitStore.get(ip) || { count: 0, resetTime: now + window };
  
  if (now > userLimits.resetTime) {
    userLimits.count = 0;
    userLimits.resetTime = now + window;
  }
  
  userLimits.count++;
  rateLimitStore.set(ip, userLimits);
  
  if (userLimits.count > limit) {
    throw new Error('Rate limit exceeded');
  }
  
  return {
    remaining: limit - userLimits.count,
    reset: userLimits.resetTime
  };
}
```

## Monitoring & Logging

### Request Logging

```typescript
// Middleware for API logging
export async function middleware(request: Request) {
  const start = Date.now();
  
  console.log({
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries())
  });
  
  // Process request...
  
  console.log({
    duration: Date.now() - start,
    status: response.status
  });
  
  return response;
}
```

### Performance Metrics

```typescript
// Track API performance
interface Metrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
}

function trackMetrics(metrics: Metrics) {
  // Send to monitoring service
  // Examples: DataDog, New Relic, CloudWatch
}
```

## API Versioning

### Versioning Strategy

Future API versions will use URL path versioning:

```
/api/v1/advocates  (current)
/api/v2/advocates  (future)
```

### Version Migration

```typescript
// Support multiple API versions
export async function GET(request: Request) {
  const url = new URL(request.url);
  const version = url.pathname.split('/')[2]; // Extract version
  
  switch(version) {
    case 'v1':
      return handleV1Request(request);
    case 'v2':
      return handleV2Request(request);
    default:
      return Response.json({ 
        error: 'Invalid API version' 
      }, { status: 400 });
  }
}
```

## Testing

### API Testing with Jest

```typescript
// __tests__/api/advocates.test.ts
import { GET } from '@/app/api/advocates/route';

describe('Advocates API', () => {
  test('GET /api/advocates returns advocate list', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data).toBeInstanceOf(Array);
    expect(data.data[0]).toHaveProperty('firstName');
  });
});
```

### Integration Testing

```typescript
// Integration test with database
import db from '@/db';

beforeEach(async () => {
  await db.delete(advocates);
  await seedTestData();
});

test('Database integration', async () => {
  const result = await db.select().from(advocates);
  expect(result).toHaveLength(10);
});
```

## OpenAPI Specification

### Swagger Documentation (Future)

```yaml
openapi: 3.0.0
info:
  title: Solace Advocates API
  version: 1.0.0
  description: API for managing healthcare advocates

servers:
  - url: http://localhost:3000/api
    description: Development server
  - url: https://api.solaceadvocates.com
    description: Production server

paths:
  /advocates:
    get:
      summary: Get all advocates
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Advocate'
        '500':
          description: Server error

  /seed:
    post:
      summary: Seed database with test data
      responses:
        '200':
          description: Database seeded successfully
        '409':
          description: Data already exists

components:
  schemas:
    Advocate:
      type: object
      properties:
        id:
          type: integer
        firstName:
          type: string
        lastName:
          type: string
        city:
          type: string
        degree:
          type: string
        specialties:
          type: array
          items:
            type: string
        yearsOfExperience:
          type: integer
        phoneNumber:
          type: integer
        createdAt:
          type: string
          format: date-time
```

## Deployment Considerations

### Environment-Specific Configuration

```typescript
// config/api.config.ts
const config = {
  development: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 30000,
    retries: 0
  },
  staging: {
    baseUrl: 'https://staging.api.solaceadvocates.com',
    timeout: 15000,
    retries: 2
  },
  production: {
    baseUrl: 'https://api.solaceadvocates.com',
    timeout: 10000,
    retries: 3
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### CORS Configuration

```typescript
// middleware.ts
export function middleware(request: Request) {
  const response = NextResponse.next();
  
  // Configure CORS
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}
```

## Conclusion

This API provides a simple yet extensible interface for managing advocate data. The current implementation focuses on core functionality with clear paths for enhancement including authentication, advanced querying, and comprehensive monitoring.