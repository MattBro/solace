# Next.js to Nest.js API Migration Plan

## Overview

This document outlines the comprehensive migration plan from the current Next.js API routes to a standalone Nest.js backend application. This migration will provide better separation of concerns, improved scalability, and enhanced API features.

## Current Architecture Analysis

### Existing Next.js API Structure
```
src/app/api/
├── advocates/
│   ├── route.ts (GET /api/advocates)
│   ├── services/
│   │   └── advocate.service.ts
│   ├── repositories/
│   │   └── advocate.repository.ts
│   ├── types/
│   │   └── advocate.types.ts
│   └── utils/
│       ├── api-error.ts
│       └── logger.ts
├── db/
│   ├── client.ts
│   ├── schema/
│   │   ├── advocates.ts
│   │   └── index.ts
│   ├── migrations/
│   └── seed/
└── seed/
    └── route.ts
```

### Current Features
- **Advocates API**: Search, pagination, filtering by specialties
- **Database**: PostgreSQL with Drizzle ORM
- **Search**: Full-text search with PostgreSQL
- **Caching**: Basic HTTP cache headers
- **Error Handling**: Custom error handling utilities
- **Logging**: Basic logging functionality

### Dependencies Analysis
- **Database**: `drizzle-orm`, `postgres`
- **Framework**: Next.js API routes
- **Development**: TypeScript, ESLint

## Target Nest.js Architecture

### Project Structure
```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── utils/
│   ├── database/
│   │   ├── database.module.ts
│   │   ├── schemas/
│   │   ├── migrations/
│   │   └── seeds/
│   └── advocates/
│       ├── advocates.module.ts
│       ├── advocates.controller.ts
│       ├── advocates.service.ts
│       ├── advocates.repository.ts
│       ├── dto/
│       ├── entities/
│       └── interfaces/
├── test/
├── package.json
├── nest-cli.json
├── tsconfig.json
└── drizzle.config.ts
```

## Migration Strategy

### Phase 1: Setup and Infrastructure (2-3 days)

#### 1.1 Initialize Nest.js Project
- Create new `backend/` directory alongside existing project
- Initialize Nest.js project with CLI
- Set up TypeScript configuration matching current project
- Configure ESLint and Prettier to match existing standards

#### 1.2 Database Setup
- Copy database schema files from current project (no DB changes needed)
- Set up Drizzle ORM in Nest.js context (same connection, same data)
- Create database configuration module
- Copy existing seed files and scripts
- Verify database connectivity with existing PostgreSQL instance

#### 1.3 Core Infrastructure
- Set up configuration management (@nestjs/config)
- Implement global error handling
- Set up logging service (Winston or built-in Logger)
- Configure validation pipes
- Set up health check endpoint

### Phase 2: API Migration (3-4 days)

#### 2.1 Advocates Module Implementation
- Create advocates module, controller, and service
- Migrate advocate.repository.ts to Nest.js context
- Convert advocate.service.ts to Nest.js service
- Create DTOs for request/response validation
- Implement entity/interface definitions

#### 2.2 API Endpoints Migration
- **GET /api/advocates** - Search and list advocates
  - Query parameter validation with class-validator
  - Pagination support
  - Search functionality
  - Specialty filtering
- Implement proper HTTP status codes and responses
- Add API documentation with Swagger

#### 2.3 Data Validation and Transformation
- Implement DTOs with class-validator decorators
- Set up response transformation interceptors
- Migrate existing validation logic
- Ensure consistent error responses

### Phase 3: Advanced Features (2-3 days)

#### 3.1 Caching
- Implement Redis caching for frequently accessed data
- Cache search results and advocate data
- Set up cache invalidation strategies
- Performance optimization

#### 3.2 API Documentation
- Set up Swagger/OpenAPI documentation
- Document all endpoints with proper schemas
- Add example requests and responses
- Generate API documentation

#### 3.3 Testing
- Set up unit tests for services and controllers
- Integration tests for API endpoints
- Database testing with test containers
- Performance testing

### Phase 4: Frontend Integration (1-2 days)

#### 4.1 Frontend Updates
- Update API base URL configuration
- Modify useAdvocates hook to use new backend
- Update environment variables
- Test all existing functionality

#### 4.2 CORS Configuration
- Configure CORS for frontend application
- Set up proper headers and origins
- Handle preflight requests

### Phase 5: Environment Setup (1 day)

#### 5.1 Environment Configuration
- Separate environment variables for backend (.env.backend)
- Database connection configuration (reuse existing)
- Port configuration (backend: 4000, frontend: 3000)
- Update package.json scripts for concurrent development

## Detailed Implementation Plan

### New Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/swagger": "^7.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "drizzle-orm": "^0.44.5",
    "postgres": "^3.4.4",
    "redis": "^4.6.0",
    "@nestjs/cache-manager": "^2.0.0",
    "cache-manager-redis-store": "^3.0.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/supertest": "^6.0.0",
    "supertest": "^6.3.0",
    "jest": "^29.5.0"
  }
}
```

### Key Files to Create

#### 1. main.ts
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  const config = new DocumentBuilder()
    .setTitle('Solace Advocates API')
    .setDescription('API for managing and searching advocates')
    .setVersion('1.0')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
```

#### 2. advocates.controller.ts
```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdvocatesService } from './advocates.service';
import { SearchAdvocatesDto } from './dto/search-advocates.dto';

@ApiTags('advocates')
@Controller('api/advocates')
export class AdvocatesController {
  constructor(private readonly advocatesService: AdvocatesService) {}

  @Get()
  @ApiOperation({ summary: 'Search and retrieve advocates' })
  async searchAdvocates(@Query() query: SearchAdvocatesDto) {
    return this.advocatesService.searchAdvocates(query);
  }
}
```

#### 3. search-advocates.dto.ts
```typescript
import { IsOptional, IsString, IsNumber, IsArray, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchAdvocatesDto {
  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Specialties to filter by' })
  @IsOptional()
  @Transform(({ value }) => value.split(',').map(s => s.trim()))
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Results per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: 'relevance' | 'name' | 'experience' | 'city' = 'relevance';

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

## Migration Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 2-3 days | Nest.js setup, database migration, core infrastructure |
| Phase 2 | 3-4 days | API migration, validation, error handling |
| Phase 3 | 2-3 days | Caching, documentation, testing |
| Phase 4 | 1-2 days | Frontend integration, CORS setup |
| Phase 5 | 1 day | Environment setup, concurrent development |
| **Total** | **8-12 days** | Complete migration with testing |

## Benefits of Migration

### Technical Benefits
- **Better Architecture**: Proper separation of concerns with modules
- **Scalability**: Dedicated backend server independent of frontend
- **Documentation**: Automatic API documentation with Swagger
- **Validation**: Robust request/response validation
- **Caching**: Advanced caching strategies with Redis
- **Testing**: Better testing infrastructure

### Development Benefits
- **Type Safety**: Enhanced TypeScript support with decorators
- **Code Organization**: Modular architecture with clear boundaries
- **Developer Experience**: Better debugging and development tools
- **Maintainability**: Easier to maintain and extend

### Operational Benefits
- **Independent Deployment**: Backend and frontend can be deployed separately
- **Horizontal Scaling**: Backend can be scaled independently
- **Monitoring**: Better observability and monitoring capabilities
- **Performance**: Dedicated server resources for API operations

## Risks and Mitigation

### Risks
1. **Data Migration Issues**: Database schema or data inconsistencies
2. **API Breaking Changes**: Frontend integration issues
3. **Performance Regression**: New architecture performance impact
4. **Development Time**: Longer than estimated migration time

### Mitigation Strategies
1. **Thorough Testing**: Comprehensive testing at each phase
2. **Gradual Migration**: Phase-by-phase implementation with rollback plans
3. **Parallel Development**: Keep existing API running during migration
4. **Performance Monitoring**: Continuous performance monitoring

## Success Criteria

- [ ] All existing API functionality preserved
- [ ] Frontend integration works seamlessly
- [ ] Performance maintained or improved
- [ ] Comprehensive API documentation available
- [ ] Test coverage > 80%
- [ ] Production deployment successful
- [ ] Zero downtime migration

## Next Steps

1. **Review and Approval**: Get stakeholder approval for migration plan
2. **Environment Setup**: Prepare development and staging environments
3. **Phase 1 Execution**: Begin with Nest.js setup and infrastructure
4. **Continuous Integration**: Set up CI/CD pipeline for new backend
5. **Documentation**: Maintain detailed progress and change documentation

---

*This migration plan provides a comprehensive roadmap for transitioning from Next.js API routes to a standalone Nest.js backend while maintaining all existing functionality and improving overall system architecture.*