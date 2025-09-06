# API Architecture Documentation

## Overview

The Advocates API follows enterprise-grade architectural patterns with clear separation of concerns, proper error handling, and scalability in mind.

## Architecture Layers

```
┌─────────────────────────────────────┐
│         Route Handlers              │  ← HTTP Layer
│    (src/app/api/advocates/)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Service Layer               │  ← Business Logic
│    (src/services/)                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Repository Layer              │  ← Data Access
│    (src/repositories/)              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Database                    │  ← PostgreSQL
│    (Drizzle ORM + Raw SQL)         │
└─────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Route Handlers (`/api/advocates/route.ts`)
- **Purpose**: HTTP request/response handling
- **Responsibilities**:
  - Parse and validate request parameters
  - Call appropriate service methods
  - Format HTTP responses
  - Handle HTTP-specific concerns (headers, status codes)
  - API documentation

### 2. Service Layer (`/services/advocate.service.ts`)
- **Purpose**: Business logic and orchestration
- **Responsibilities**:
  - Business rule validation
  - Data transformation (DB models ↔ API models)
  - Orchestrating multiple repository calls
  - Pagination calculations
  - Sorting and filtering logic
  - Caching strategies (if needed)

### 3. Repository Layer (`/repositories/advocate.repository.ts`)
- **Purpose**: Database access abstraction
- **Responsibilities**:
  - Database queries
  - Raw SQL when needed (full-text search)
  - Database-specific optimizations
  - Query building
  - Connection management

### 4. Supporting Utilities

#### Types (`/types/advocate.types.ts`)
- Domain models (`Advocate`)
- Database models (`AdvocateDB`)
- DTOs (Data Transfer Objects)
- Request/Response interfaces

#### Error Handling (`/utils/api-error.ts`)
- Custom error classes
- Consistent error responses
- Error logging
- Status code mapping

#### Logging (`/utils/logger.ts`)
- Structured logging
- Environment-aware logging
- Request/Response logging
- Query logging (development)

## Key Design Patterns

### 1. Singleton Services
Services and repositories are exported as singleton instances to ensure consistent state and connection pooling.

```typescript
export const advocateService = new AdvocateService();
```

### 2. Data Transformation
Clear separation between database models (snake_case) and API models (camelCase):

```typescript
private transformAdvocate(dbAdvocate: AdvocateDB): Advocate {
  return {
    id: dbAdvocate.id,
    firstName: dbAdvocate.first_name,
    // ...
  };
}
```

### 3. Error Boundaries
Consistent error handling across all layers:

```typescript
try {
  // Business logic
} catch (error) {
  return handleApiError(error);
}
```

## API Endpoints

### GET /api/advocates

Search and retrieve advocates with pagination.

**Query Parameters:**
- `search` (string): Full-text search term
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 50, max: 100)
- `sortBy` (string): Sort field (relevance|name|experience|city)
- `sortOrder` (string): Sort order (asc|desc)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "city": "New York",
      "degree": "MD",
      "specialties": ["..."],
      "yearsOfExperience": 10,
      "phoneNumber": 5551234567
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalCount": 100,
    "totalPages": 2
  }
}
```

## Performance Optimizations

### 1. Database Level
- **Full-text search**: PostgreSQL tsvector with GIN index
- **Pagination**: LIMIT/OFFSET for efficient data loading
- **Indexing**: Indexes on searchable columns

### 2. API Level
- **Response caching**: Cache-Control headers (1 minute)
- **Data limiting**: Maximum 100 records per request
- **Efficient queries**: Only fetch needed data

### 3. Application Level
- **Connection pooling**: Reuse database connections
- **Singleton instances**: Prevent multiple service instantiations
- **Lazy loading**: Load data only when needed

## Security Considerations

### 1. Input Validation
- Parameter type checking
- Range validation for pagination
- SQL injection prevention (parameterized queries)

### 2. Error Handling
- No sensitive data in error messages
- Consistent error format
- Proper status codes

### 3. Rate Limiting (Future)
- Implement rate limiting middleware
- Per-IP or per-user limits
- Prevent API abuse

## Testing Strategy

### 1. Unit Tests
- Service layer business logic
- Repository queries
- Data transformation

### 2. Integration Tests
- API endpoint testing
- Database interaction
- Error scenarios

### 3. Performance Tests
- Load testing with large datasets
- Query performance monitoring
- Response time benchmarks

## Future Enhancements

### 1. Caching Layer
- Redis for query result caching
- Invalidation strategies
- Cache warming

### 2. GraphQL Support
- Flexible field selection
- Nested resource loading
- Subscription support

### 3. Advanced Search
- Elasticsearch integration
- Faceted search
- Search suggestions

### 4. Monitoring
- APM integration (New Relic, DataDog)
- Custom metrics
- Alert configuration

## Development Guidelines

### 1. Adding New Endpoints
1. Define types in `/types`
2. Add repository methods if needed
3. Implement service logic
4. Create route handler
5. Add tests

### 2. Error Handling
- Always use custom error classes
- Log errors with context
- Return meaningful error messages

### 3. Database Changes
- Use migrations for schema changes
- Update repository layer
- Update transformation logic

## Conclusion

This architecture provides:
- **Maintainability**: Clear separation of concerns
- **Scalability**: Ready for microservices split
- **Testability**: Each layer can be tested independently
- **Performance**: Optimized for large datasets
- **Security**: Input validation and error handling
- **Developer Experience**: Clear patterns and documentation