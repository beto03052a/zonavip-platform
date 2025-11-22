# ZonaVIP Backend

Backend services for the ZonaVIP platform built with NestJS, PostgreSQL+PostGIS, Redis, and OpenSearch.

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15 + PostGIS 3.3
- **Cache**: Redis 7
- **Search**: OpenSearch 2.x
- **ORM**: TypeORM 0.3
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 20 LTS or higher
- Docker and Docker Compose (for local development)
- PostgreSQL 15+ with PostGIS (if not using Docker)
- Redis 7+
- npm or yarn

## Getting Started

### 1. Clone and Install

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Start Development Services

Using Docker Compose (recommended):

```bash
# Start all services (PostgreSQL, Redis, OpenSearch)
docker-compose up -d

# Check services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Database Setup

```bash
# Run migrations
npm run migration:run

# Seed initial data (optional)
npm run seed
```

### 5. Start Development Server

```bash
# Development mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`

### 6. API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

## Project Structure

```
backend/
├── src/
│   ├── auth/                   # Authentication & authorization
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── strategies/
│   │   ├── guards/
│   │   └── auth.module.ts
│   ├── catalog/                # Product & business catalog
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── catalog.module.ts
│   ├── convenios/              # Agreements & plans
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── convenios.module.ts
│   ├── transactions/           # Transaction processing
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── transactions.module.ts
│   ├── notifications/          # Push, email, WhatsApp
│   │   ├── controllers/
│   │   ├── services/
│   │   └── notifications.module.ts
│   ├── analytics/              # KPIs & reporting
│   │   ├── controllers/
│   │   ├── services/
│   │   └── analytics.module.ts
│   ├── common/                 # Shared utilities
│   │   ├── dto/
│   │   ├── interfaces/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── filters/
│   │   └── utils/
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Application entry point
├── test/                       # E2E tests
├── migrations/                 # Database migrations
├── docker-compose.yml          # Local development services
├── .env.example                # Environment variables template
├── nest-cli.json              # NestJS CLI configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Microservices Architecture

The backend is organized as a modular monolith that can be split into microservices:

### Services

1. **Auth Service** (Port 3001)
   - User registration and login
   - JWT token management
   - OAuth integration (Google, Facebook)
   - Password reset flow

2. **Catalog Service** (Port 3002)
   - Product catalog management
   - Business listings
   - Geolocation-based search (PostGIS)
   - OpenSearch integration

3. **Convenios Service** (Port 3003)
   - Agreement management
   - Plan management
   - Discount calculation logic
   - Multi-tier access levels (N1, N2, N3)

4. **Transaction Service** (Port 3004)
   - Transaction creation
   - QR code generation and validation
   - Purchase history
   - Discount application

5. **Notification Service** (Port 3005)
   - Push notifications (Firebase)
   - Email notifications (SendGrid/SES)
   - WhatsApp messages (Twilio)

6. **Analytics Service** (Port 3006)
   - KPI calculation
   - Report generation
   - Dashboard data
   - Geolocation analytics

## Available Scripts

### Development
```bash
npm run start          # Start production build
npm run start:dev      # Start with hot reload
npm run start:debug    # Start in debug mode
```

### Building
```bash
npm run build          # Build for production
```

### Testing
```bash
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests
```

### Code Quality
```bash
npm run lint           # Lint code
npm run format         # Format code with Prettier
```

### Database
```bash
npm run typeorm                      # TypeORM CLI
npm run migration:generate -- -n MigrationName  # Generate migration
npm run migration:run                # Run migrations
npm run migration:revert            # Revert last migration
```

## Database Management

### Access PostgreSQL

```bash
# Via Docker
docker exec -it zonavip-postgres psql -U zonavip -d zonavip

# Via pgAdmin
# Open http://localhost:5050
# Login: admin@zonavip.com / admin123
```

### Access Redis

```bash
# Via Docker
docker exec -it zonavip-redis redis-cli -a redis123

# Via Redis Commander
# Open http://localhost:8081
```

### Access OpenSearch

```bash
# Via curl
curl -X GET "http://localhost:9200" -u admin:Admin@123

# Via OpenSearch Dashboards
# Open http://localhost:5601
# Login: admin / Admin@123
```

## PostGIS Queries

Example geolocation queries:

```sql
-- Find businesses within 5km
SELECT b.*, 
  ST_Distance(
    ST_SetSRID(ST_MakePoint(b.longitud, b.latitud), 4326)::geography,
    ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)::geography
  ) AS distance
FROM negocio b
WHERE ST_DWithin(
  ST_SetSRID(ST_MakePoint(b.longitud, b.latitud), 4326)::geography,
  ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)::geography,
  5000
)
ORDER BY distance
LIMIT 20;
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port
- `DB_*`: Database configuration
- `REDIS_*`: Redis configuration
- `OPENSEARCH_*`: OpenSearch configuration
- `JWT_SECRET`: JWT signing secret
- `GOOGLE_CLIENT_ID`: Google OAuth credentials
- `SENDGRID_API_KEY`: SendGrid API key
- `TWILIO_*`: Twilio configuration
- `FIREBASE_*`: Firebase configuration

## API Authentication

All protected endpoints require a JWT token:

```bash
# Get token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Deployment

### Docker Build

```bash
# Build image
docker build -t zonavip-backend:latest .

# Run container
docker run -p 3000:3000 \
  --env-file .env \
  zonavip-backend:latest
```

### Production Considerations

1. **Environment Variables**: Use secrets management (AWS Secrets Manager, Vault)
2. **Database**: Use managed PostgreSQL (RDS, Cloud SQL)
3. **Redis**: Use managed Redis (ElastiCache, Memory Store)
4. **Logging**: Configure Winston with external log aggregation
5. **Monitoring**: Set up Prometheus + Grafana
6. **Security**: Enable HTTPS, rate limiting, CORS

## Performance Optimization

- **Connection Pooling**: TypeORM configured with connection pooling
- **Caching**: Redis caching for frequently accessed data
- **Indexing**: Database indexes on frequently queried fields
- **Query Optimization**: Use PostGIS spatial indexes
- **Compression**: Enable gzip compression
- **Rate Limiting**: Protect against abuse

## Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection details in .env
```

**Redis connection failed**
```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker exec -it zonavip-redis redis-cli -a redis123 ping
```

**Migration errors**
```bash
# Reset database (WARNING: destroys data)
docker-compose down -v
docker-compose up -d postgres
npm run migration:run
```

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

Coverage targets:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](../LICENSE) file for details.

## Support

- **Documentation**: [docs/API.md](../docs/API.md)
- **Architecture**: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Database**: [docs/DATABASE.md](../docs/DATABASE.md)

## Related Projects

- [Mobile App](../mobile/README.md)
- [Web Dashboard](../web/README.md)
- [Infrastructure](../infrastructure/README.md)
