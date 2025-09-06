# Deployment and Operations Guide

## Deployment Overview

The Solace Advocates Platform is designed for cloud-native deployment with support for multiple hosting providers and deployment strategies. This guide covers deployment configurations, monitoring, maintenance, and operational best practices.

## Deployment Architecture

### Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CDN (CloudFlare)                   │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   Load Balancer (AWS ALB)               │
└─────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│    Next.js Instance 1    │   │    Next.js Instance 2    │
│      (AWS ECS/Fargate)   │   │      (AWS ECS/Fargate)   │
└──────────────────────────┘   └──────────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                ┌──────────────────────────┐
                │    PostgreSQL (RDS)      │
                │    Multi-AZ Deployment   │
                └──────────────────────────┘
```

## Deployment Platforms

### Vercel Deployment (Recommended)

#### Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url-production"
  },
  "functions": {
    "app/api/advocates/route.ts": {
      "maxDuration": 10
    }
  }
}
```

#### Deployment Steps
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Set environment variables
vercel env add DATABASE_URL production
```

### AWS Deployment

#### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### ECS Task Definition
```json
{
  "family": "solace-advocates",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "solace-advocates-app",
      "image": "your-ecr-repo/solace-advocates:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/solace-advocates",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Terraform Configuration
```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_ecs_cluster" "main" {
  name = "solace-advocates-cluster"
}

resource "aws_ecs_service" "app" {
  name            = "solace-advocates-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private.*.id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.app.arn
    container_name   = "solace-advocates-app"
    container_port   = 3000
  }
}

resource "aws_db_instance" "postgres" {
  identifier     = "solace-advocates-db"
  engine         = "postgres"
  engine_version = "14.7"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "solaceassignment"
  username = "postgres"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  multi_az               = true
  deletion_protection    = true
  skip_final_snapshot    = false
  
  tags = {
    Name        = "solace-advocates-db"
    Environment = "production"
  }
}
```

### Kubernetes Deployment

#### Deployment Manifest
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: solace-advocates
  labels:
    app: solace-advocates
spec:
  replicas: 3
  selector:
    matchLabels:
      app: solace-advocates
  template:
    metadata:
      labels:
        app: solace-advocates
    spec:
      containers:
      - name: app
        image: your-registry/solace-advocates:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: solace-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: solace-advocates-service
spec:
  selector:
    app: solace-advocates
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

#### Helm Chart
```yaml
# helm/values.yaml
replicaCount: 3

image:
  repository: your-registry/solace-advocates
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: api.solaceadvocates.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: solace-tls
      hosts:
        - api.solaceadvocates.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

## Environment Configuration

### Environment Variables

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXT_PUBLIC_API_URL=https://api.solaceadvocates.com
SENTRY_DSN=https://your-sentry-dsn
REDIS_URL=redis://redis:6379
LOG_LEVEL=info
```

### Secrets Management

#### AWS Secrets Manager
```bash
# Create secret
aws secretsmanager create-secret \
  --name solace-advocates/production \
  --secret-string '{"DATABASE_URL":"postgresql://..."}'

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id solace-advocates/production
```

#### Kubernetes Secrets
```bash
# Create secret
kubectl create secret generic solace-secrets \
  --from-literal=database-url='postgresql://...'

# View secret
kubectl get secret solace-secrets -o yaml
```

## Database Operations

### Migration Strategy

```bash
# Production migration workflow
#!/bin/bash

# 1. Backup current database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations in transaction
npx drizzle-kit push --config=drizzle.config.ts

# 3. Verify migration
psql $DATABASE_URL -c "SELECT version FROM migrations ORDER BY id DESC LIMIT 1;"

# 4. Rollback if needed
if [ $? -ne 0 ]; then
  psql $DATABASE_URL < backup_latest.sql
  echo "Migration failed, rolled back"
  exit 1
fi
```

### Database Scaling

#### Read Replicas
```sql
-- Create read replica in AWS RDS
CREATE DATABASE LINK read_replica
  CONNECT TO postgres
  IDENTIFIED BY 'password'
  USING 'read-replica.amazonaws.com:5432/solaceassignment';
```

#### Connection Pooling
```typescript
// db/config.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000, // Connection timeout
});

export default pool;
```

## Monitoring and Observability

### Application Monitoring

#### Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await db.select().from(advocates).limit(1);
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message,
    }, { status: 503 });
  }
}
```

#### Metrics Collection
```typescript
// lib/metrics.ts
import { StatsD } from 'node-statsd';

const metrics = new StatsD({
  host: process.env.STATSD_HOST || 'localhost',
  port: 8125,
});

export function trackApiCall(endpoint: string, duration: number) {
  metrics.timing(`api.${endpoint}.duration`, duration);
  metrics.increment(`api.${endpoint}.calls`);
}

export function trackError(endpoint: string, error: string) {
  metrics.increment(`api.${endpoint}.errors`);
  metrics.increment(`errors.${error}`);
}
```

### Logging

#### Structured Logging
```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { 
    service: 'solace-advocates',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

#### Log Aggregation
```yaml
# fluentd/fluent.conf
<source>
  @type forward
  port 24224
</source>

<filter app.**>
  @type parser
  key_name log
  <parse>
    @type json
  </parse>
</filter>

<match app.**>
  @type elasticsearch
  host elasticsearch.example.com
  port 9200
  logstash_format true
  logstash_prefix solace-advocates
  <buffer>
    @type file
    path /var/log/fluentd-buffers/app.buffer
    flush_interval 10s
  </buffer>
</match>
```

### Alerting

#### Alert Rules
```yaml
# prometheus/alerts.yml
groups:
  - name: solace-advocates
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Database connection lost
      
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: Container memory usage above 90%
```

## Performance Optimization

### Caching Strategy

#### Redis Configuration
```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

export async function cacheAdvocates(data: any, ttl = 300) {
  await redis.setex('advocates:list', ttl, JSON.stringify(data));
}

export async function getCachedAdvocates() {
  const cached = await redis.get('advocates:list');
  return cached ? JSON.parse(cached) : null;
}
```

#### CDN Configuration
```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    proxy_pass http://backend;
    proxy_cache_bypass $http_upgrade;
    add_header X-Cache-Status $upstream_cache_status;
}
```

### Database Optimization

#### Query Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_advocates_search 
ON advocates USING gin(
  to_tsvector('english', 
    first_name || ' ' || 
    last_name || ' ' || 
    city || ' ' || 
    degree
  )
);

-- Analyze query performance
EXPLAIN ANALYZE 
SELECT * FROM advocates 
WHERE specialties @> '["Cardiology"]';
```

## Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

# Daily backup script
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="s3://solace-backups"

# Database backup
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Application backup
tar -czf "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" /app

# Upload to S3
aws s3 cp "$BACKUP_DIR/db_$TIMESTAMP.sql.gz" "$S3_BUCKET/db/"
aws s3 cp "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" "$S3_BUCKET/app/"

# Clean old backups (keep 30 days)
find $BACKUP_DIR -mtime +30 -delete
```

### Recovery Procedures

```bash
#!/bin/bash
# restore.sh

# Restore from specific backup
BACKUP_DATE=$1
S3_BUCKET="s3://solace-backups"

# Download backup
aws s3 cp "$S3_BUCKET/db/db_$BACKUP_DATE.sql.gz" /tmp/

# Restore database
gunzip < /tmp/db_$BACKUP_DATE.sql.gz | psql $DATABASE_URL

# Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM advocates;"
```

## Security Operations

### Security Scanning

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'your-registry/solace-advocates:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
```

### SSL/TLS Configuration

```nginx
# nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name api.solaceadvocates.com;
    
    ssl_certificate /etc/ssl/certs/solace.crt;
    ssl_certificate_key /etc/ssl/private/solace.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

## Maintenance Operations

### Rolling Updates

```bash
#!/bin/bash
# rolling-update.sh

# ECS rolling update
aws ecs update-service \
  --cluster solace-advocates-cluster \
  --service solace-advocates-service \
  --force-new-deployment

# Kubernetes rolling update
kubectl set image deployment/solace-advocates \
  app=your-registry/solace-advocates:new-version \
  --record

# Monitor rollout
kubectl rollout status deployment/solace-advocates
```

### Scheduled Maintenance

```yaml
# k8s/cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-maintenance
spec:
  schedule: "0 2 * * SUN"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: maintenance
            image: postgres:14
            command:
            - /bin/sh
            - -c
            - |
              psql $DATABASE_URL -c "VACUUM ANALYZE advocates;"
              psql $DATABASE_URL -c "REINDEX TABLE advocates;"
          restartPolicy: OnFailure
```

## Incident Response

### Runbook Template

```markdown
## Incident: High Error Rate

### Detection
- Alert triggered by Prometheus/DataDog
- Error rate > 5% for 5 minutes

### Diagnosis
1. Check application logs: `kubectl logs -l app=solace-advocates`
2. Check database status: `psql $DATABASE_URL -c "SELECT 1"`
3. Review recent deployments: `kubectl rollout history`

### Mitigation
1. Rollback if recent deployment: `kubectl rollout undo`
2. Scale up if load issue: `kubectl scale --replicas=5`
3. Restart if memory issue: `kubectl rollout restart`

### Resolution
1. Identify root cause
2. Implement fix
3. Deploy patch
4. Monitor for 30 minutes

### Post-Mortem
1. Document timeline
2. Identify improvements
3. Update runbooks
```

## Cost Optimization

### Resource Right-Sizing

```bash
# Analyze resource usage
kubectl top pods -l app=solace-advocates

# AWS Cost Explorer
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

### Auto-Scaling Configuration

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: solace-advocates-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: solace-advocates
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Compliance and Governance

### Audit Logging

```typescript
// lib/audit.ts
export async function logAuditEvent(event: {
  action: string;
  user?: string;
  resource: string;
  result: 'success' | 'failure';
  metadata?: any;
}) {
  await db.insert(auditLogs).values({
    ...event,
    timestamp: new Date(),
    ip: request.headers.get('x-forwarded-for'),
  });
}
```

### Data Retention

```sql
-- Archive old data
CREATE TABLE advocates_archive AS 
SELECT * FROM advocates 
WHERE created_at < NOW() - INTERVAL '2 years';

-- Delete archived data from main table
DELETE FROM advocates 
WHERE created_at < NOW() - INTERVAL '2 years';
```

## Conclusion

This comprehensive deployment and operations guide provides the foundation for running the Solace Advocates Platform in production. Regular monitoring, maintenance, and optimization ensure reliable service delivery and optimal performance.