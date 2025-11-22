# ZonaVIP Platform - Technical Architecture

## Executive Summary

ZonaVIP is a B2B2C platform for managing benefit plans with geolocation capabilities. The platform connects entities (companies/organizations) with businesses through a sophisticated discount system based on access levels and agreements.

## System Overview

### Core Concepts

1. **Triple Access Level System (N1, N2, N3)**
   - **N1 (Entity Level)**: Direct agreements between entities and businesses
   - **N2 (Plan Level)**: Agreements through benefit plans
   - **N3 (Public Level)**: General public access

2. **Discount Calculation Formula**
   ```
   descuentoFinal = MAX(descuentoNivel2, descuentoPlanEntidad)
   ```
   The system always applies the maximum discount available to the user.

3. **Geolocation-Based Discovery**
   - Uses PostGIS for spatial queries
   - Proximity-based business search
   - Location-based analytics

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├──────────────────────┬──────────────────────┬──────────────────┤
│   Mobile App         │   Web Dashboard      │   Admin Portal   │
│   React Native 0.72  │   Next.js 14         │   Next.js 14     │
└──────────┬───────────┴───────────┬──────────┴────────┬─────────┘
           │                       │                    │
           └───────────────────────┼────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────┐
│                      API Gateway (Kong/NGINX)                    │
│                    - Rate Limiting                               │
│                    - Authentication                              │
│                    - Load Balancing                              │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
┌────────▼────────┐   ┌───────────▼──────────┐   ┌─────────▼────────┐
│ Auth Service    │   │ Catalog Service      │   │ Convenios Service│
│ - Login         │   │ - Product Search     │   │ - Agreement Mgmt │
│ - JWT Tokens    │   │ - Geolocation        │   │ - Discount Calc  │
│ - User Mgmt     │   │ - OpenSearch Index   │   │ - Plan Rules     │
└────────┬────────┘   └───────────┬──────────┘   └─────────┬────────┘
         │                        │                         │
         │            ┌───────────▼──────────┐             │
         │            │ Transaction Service  │             │
         │            │ - QR Validation      │             │
         │            │ - Purchase Registry  │             │
         │            │ - Discount Apply     │             │
         │            └───────────┬──────────┘             │
         │                        │                         │
┌────────▼────────┐   ┌───────────▼──────────┐   ┌─────────▼────────┐
│ Notification    │   │ Analytics Service    │   │ Payment Service  │
│ Service         │   │ - KPI Calculation    │   │ - Processing     │
│ - Push (FCM)    │   │ - Reports            │   │ - Webhooks       │
│ - WhatsApp      │   │ - Dashboard Data     │   │ - Reconciliation │
│ - Email         │   │ - Geolocation Stats  │   │                  │
└─────────────────┘   └──────────────────────┘   └──────────────────┘
         │                        │                         │
         └────────────────────────┼─────────────────────────┘
                                  │
┌─────────────────────────────────▼──────────────────────────────┐
│                         Data Layer                              │
├─────────────────────┬──────────────────┬────────────────────────┤
│ PostgreSQL 15       │ Redis 7          │ OpenSearch 2.x         │
│ + PostGIS 3.3       │ - Sessions       │ - Product Catalog      │
│ - Main Database     │ - Caching        │ - Business Search      │
│ - Geospatial Data   │ - Rate Limiting  │ - Full-text Search     │
└─────────────────────┴──────────────────┴────────────────────────┘
```

## Technology Stack

### Frontend

#### Mobile Application
- **Framework**: React Native 0.72
- **Language**: TypeScript 5.x
- **State Management**: Redux Toolkit / Zustand
- **Navigation**: React Navigation 6.x
- **Maps**: react-native-maps (Google Maps/Apple Maps)
- **QR Code**: react-native-camera + react-native-qrcode-scanner
- **Push Notifications**: React Native Firebase (FCM)
- **HTTP Client**: Axios
- **UI Components**: React Native Paper / NativeBase

#### Web Dashboard
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts / Chart.js
- **Forms**: React Hook Form + Zod
- **State Management**: React Query (TanStack Query)
- **Maps**: react-leaflet / Google Maps API

### Backend

#### Core Framework
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS
- **API Style**: RESTful + GraphQL (for dashboard)

#### Microservices Architecture
Each service is independently deployable with:
- **Authentication**: JWT + Refresh Tokens
- **Authorization**: RBAC (Role-Based Access Control)
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Winston + ELK Stack
- **Monitoring**: Prometheus + Grafana

### Database & Storage

#### Primary Database
- **RDBMS**: PostgreSQL 15
- **Geospatial**: PostGIS 3.3
- **Connection Pooling**: PgBouncer
- **Replication**: Streaming Replication (Master-Slave)
- **Backup**: Point-in-Time Recovery (PITR)

#### Caching Layer
- **Cache**: Redis 7
- **Persistence**: RDB + AOF
- **Clustering**: Redis Sentinel (HA)
- **Use Cases**: 
  - Session storage
  - Rate limiting
  - Real-time leaderboards
  - Geospatial caching

#### Search Engine
- **Engine**: OpenSearch 2.x (ElasticSearch fork)
- **Use Cases**:
  - Full-text product search
  - Business search with filters
  - Analytics aggregations
- **Indexing**: Real-time sync from PostgreSQL

#### File Storage
- **Primary**: AWS S3 / Google Cloud Storage
- **CDN**: CloudFront / Cloud CDN
- **Use Cases**:
  - Product images
  - Business logos
  - QR codes
  - Reports (PDF)

### Infrastructure & DevOps

#### Containerization
- **Container Runtime**: Docker 24.x
- **Orchestration**: Kubernetes 1.28
- **Service Mesh**: Istio (optional, for advanced deployments)

#### Cloud Providers
- **Primary**: AWS / Google Cloud Platform
- **Multi-region**: Yes (for HA)
- **Regions**: us-east-1 (primary), us-west-2 (DR)

#### Infrastructure as Code
- **IaC Tool**: Terraform 1.6
- **Configuration**: Ansible (for server provisioning)
- **Secrets Management**: HashiCorp Vault / AWS Secrets Manager

#### CI/CD Pipeline
- **Source Control**: GitHub
- **CI**: GitHub Actions
- **CD**: ArgoCD / Flux (GitOps)
- **Artifact Registry**: GitHub Container Registry / Docker Hub
- **Quality Gates**:
  - Unit tests (Jest)
  - Integration tests
  - E2E tests (Cypress/Playwright)
  - Security scanning (Snyk/SonarQube)
  - Code coverage (>80%)

### Monitoring & Observability

#### Metrics
- **Collection**: Prometheus
- **Visualization**: Grafana
- **Alerting**: AlertManager + PagerDuty

#### Logging
- **Collection**: Fluentd / Fluent Bit
- **Aggregation**: ElasticSearch
- **Visualization**: Kibana
- **Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL

#### Tracing
- **APM**: Jaeger / Zipkin
- **Distributed Tracing**: OpenTelemetry

#### Error Tracking
- **Tool**: Sentry
- **Coverage**: Frontend + Backend

## Microservices Details

### 1. Auth Service
**Port**: 3001  
**Database**: PostgreSQL (users, sessions)  
**Cache**: Redis (sessions, tokens)

**Responsibilities**:
- User authentication (email/password, social login)
- JWT token generation and validation
- Password reset flow
- User profile management
- Role and permission management (RBAC)

**Endpoints**:
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/refresh`
- POST `/auth/logout`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`
- GET `/auth/profile`
- PUT `/auth/profile`

### 2. Catalog Service
**Port**: 3002  
**Database**: PostgreSQL (products, categories)  
**Cache**: Redis (hot products)  
**Search**: OpenSearch

**Responsibilities**:
- Product catalog management
- Business listing
- Category management
- Geolocation-based search
- Filtering and sorting

**Endpoints**:
- GET `/catalog/search` (with geolocation)
- GET `/catalog/products/:id`
- GET `/catalog/businesses/:id`
- GET `/catalog/categories`
- GET `/catalog/nearby` (PostGIS query)

### 3. Convenios Service
**Port**: 3003  
**Database**: PostgreSQL (agreements, plans)

**Responsibilities**:
- Agreement (convenio) management
- Plan management
- Discount calculation logic
- Access level validation (N1, N2, N3)
- Business-entity relationship

**Endpoints**:
- GET `/convenios`
- GET `/convenios/:id`
- POST `/convenios`
- PUT `/convenios/:id`
- DELETE `/convenios/:id`
- GET `/convenios/calculate-discount`
- GET `/plans`
- GET `/plans/:id`

### 4. Transaction Service
**Port**: 3004  
**Database**: PostgreSQL (transactions)  
**Cache**: Redis (active QR codes)

**Responsibilities**:
- Transaction creation and tracking
- QR code generation and validation
- Purchase registry
- Discount application
- Transaction history

**Endpoints**:
- POST `/transactions`
- GET `/transactions/:id`
- GET `/transactions/user/:userId`
- POST `/qr/generate`
- POST `/qr/validate`
- GET `/transactions/history`

### 5. Notification Service
**Port**: 3005  
**Database**: PostgreSQL (notification logs)  
**Queue**: Redis (job queue)

**Responsibilities**:
- Push notifications (Firebase Cloud Messaging)
- WhatsApp messages (Twilio/WhatsApp Business API)
- Email notifications (SendGrid/SES)
- Notification templates
- Delivery tracking

**Endpoints**:
- POST `/notifications/push`
- POST `/notifications/whatsapp`
- POST `/notifications/email`
- GET `/notifications/user/:userId`
- PUT `/notifications/:id/read`

### 6. Analytics Service
**Port**: 3006  
**Database**: PostgreSQL (analytics events)  
**Cache**: Redis (real-time metrics)

**Responsibilities**:
- KPI calculation and tracking
- Report generation
- Dashboard data aggregation
- Geolocation analytics
- Business intelligence

**Key Metrics**:
- **Usage Rate**: `(transactions / total_users) * 100`
- **Average Ticket**: `SUM(transaction_amount) / COUNT(transactions)`
- **Geolocalized Conversion**: `(geolocal_transactions / total_searches) * 100`
- **Active Users (DAU/MAU)**
- **Discount Utilization Rate**

**Endpoints**:
- GET `/analytics/kpis`
- GET `/analytics/reports/:type`
- GET `/analytics/dashboard`
- GET `/analytics/geolocation-stats`
- POST `/analytics/events`

## Database Architecture

### Entity-Relationship Model

The complete database schema is documented in [DATABASE.md](./DATABASE.md).

**Core Entities**:
1. Usuario (User)
2. Entidad (Entity/Company)
3. Negocio (Business)
4. Producto (Product)
5. Convenio (Agreement)
6. Plan (Plan)
7. Transaccion (Transaction)
8. Evento_Analytics (Analytics Event)

### PostGIS Integration

PostGIS enables geospatial queries:

```sql
-- Find businesses within 5km radius
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

## Deployment Topology

### Kubernetes Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Ingress Controller                      │
│                    (NGINX/Traefik)                          │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
    ┌────────▼─────────┐           ┌─────────▼──────────┐
    │   Namespace: dev  │           │ Namespace: prod    │
    │                  │           │                     │
    │  ┌─────────────┐ │           │  ┌─────────────┐   │
    │  │ API Gateway │ │           │  │ API Gateway │   │
    │  │ (3 replicas)│ │           │  │ (5 replicas)│   │
    │  └──────┬──────┘ │           │  └──────┬──────┘   │
    │         │         │           │         │          │
    │  ┌──────▼──────┐ │           │  ┌──────▼──────┐   │
    │  │ Microservices│ │           │  │Microservices│   │
    │  │ (2 replicas) │ │           │  │(3+ replicas)│   │
    │  └──────┬──────┘ │           │  └──────┬──────┘   │
    │         │         │           │         │          │
    │  ┌──────▼──────┐ │           │  ┌──────▼──────┐   │
    │  │ PostgreSQL  │ │           │  │ PostgreSQL  │   │
    │  │ StatefulSet │ │           │  │StatefulSet  │   │
    │  │ (1 replica) │ │           │  │(HA Cluster) │   │
    │  └─────────────┘ │           │  └─────────────┘   │
    │                  │           │                     │
    │  ┌─────────────┐ │           │  ┌─────────────┐   │
    │  │    Redis    │ │           │  │    Redis    │   │
    │  │ (1 replica) │ │           │  │ Sentinel HA │   │
    │  └─────────────┘ │           │  └─────────────┘   │
    └──────────────────┘           └────────────────────┘
```

### Environment Configuration

#### Development (dev)
- **Replicas**: 1-2 per service
- **Resources**: Minimal (0.5 CPU, 512MB RAM)
- **Autoscaling**: Disabled
- **Purpose**: Local development, testing

#### Staging (staging)
- **Replicas**: 2 per service
- **Resources**: Medium (1 CPU, 1GB RAM)
- **Autoscaling**: Enabled (2-4 replicas)
- **Purpose**: Pre-production testing, QA

#### Production (prod)
- **Replicas**: 3-5 per service
- **Resources**: High (2-4 CPU, 2-8GB RAM)
- **Autoscaling**: Enabled (3-10 replicas)
- **High Availability**: Multi-zone deployment
- **Purpose**: Live production workloads

## Security Architecture

### Authentication & Authorization

1. **JWT Tokens**
   - Access Token: 15 minutes TTL
   - Refresh Token: 7 days TTL
   - Token Rotation: Enabled

2. **Role-Based Access Control (RBAC)**
   - Roles: SUPER_ADMIN, ADMIN_ENTIDAD, ADMIN_NEGOCIO, USUARIO
   - Permissions: Fine-grained per resource

3. **API Security**
   - Rate Limiting: 100 req/min per IP
   - CORS: Whitelist domains
   - HTTPS Only: TLS 1.3
   - API Keys: For external integrations

### Data Security

1. **Encryption**
   - At Rest: AES-256
   - In Transit: TLS 1.3
   - Database: Transparent Data Encryption (TDE)

2. **PII Protection**
   - Sensitive data masking
   - GDPR compliance
   - Data retention policies

3. **Secret Management**
   - HashiCorp Vault / AWS Secrets Manager
   - No secrets in code or config
   - Rotation policies

### Network Security

1. **Firewall Rules**
   - Ingress: Only HTTPS (443), SSH (22) from bastion
   - Egress: Whitelist required services

2. **Service Mesh (Optional)**
   - mTLS between services
   - Traffic encryption
   - Zero-trust networking

## Scalability Strategy

### Horizontal Scaling
- **API Gateway**: Load balanced, stateless
- **Microservices**: Auto-scaled based on CPU/Memory
- **Database**: Read replicas for queries
- **Cache**: Redis Cluster for distributed caching

### Vertical Scaling
- **Database**: Increase instance size for writes
- **Compute**: Larger instance types for heavy workloads

### Database Scaling
- **Sharding**: By entity_id or geographic region
- **Partitioning**: Time-based for transactions
- **Read Replicas**: For analytics and reports

## MVP Timeline (10 Weeks)

### Week 1-2: Foundation
- Infrastructure setup (Kubernetes, databases)
- CI/CD pipeline
- Auth service

### Week 3-4: Core Services
- Catalog service with PostGIS
- Convenios service
- Basic mobile app (login, catalog)

### Week 5-6: Transactions & QR
- Transaction service
- QR code generation/validation
- Payment integration

### Week 7-8: Notifications & Analytics
- Notification service
- Analytics service
- Dashboard basics

### Week 9-10: Testing & Polish
- E2E testing
- Performance optimization
- Security audit
- Production deployment

## Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups, 30-day retention
- **Configuration**: Git-backed (GitOps)
- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 1 hour

### High Availability
- **Multi-zone**: Services across 3 availability zones
- **Multi-region**: Standby region for DR
- **Failover**: Automated with health checks

## Performance Targets

- **API Response Time**: p95 < 200ms, p99 < 500ms
- **Database Queries**: p95 < 100ms
- **Geospatial Queries**: < 50ms for 5km radius
- **Uptime**: 99.9% (SLA)
- **Concurrent Users**: 10,000+
- **Transactions/sec**: 1,000+

## References

- [Database Schema](./DATABASE.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Product Backlog](./BACKLOG.md)
