# ZonaVIP Platform

B2B2C platform for managing benefit plans with geolocation capabilities. Connect entities (companies/organizations) with businesses through a sophisticated discount system.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

## 🚀 Overview

ZonaVIP is a comprehensive platform that enables organizations to provide benefit plans to their members with location-based business discovery and multi-tier discount systems.

### Key Features

- 🗺️ **Geolocation-based Search** - PostGIS-powered spatial queries for finding nearby businesses
- 🎯 **Multi-tier Access Levels** - N1 (Direct), N2 (Plan), N3 (Public) discount tiers
- 📱 **Mobile-First** - React Native app for iOS and Android
- 💼 **Business Dashboard** - Next.js web app for management
- 🔐 **Secure Authentication** - JWT with OAuth2 support (Google, Facebook)
- 📊 **Real-time Analytics** - Comprehensive KPIs and reporting
- 💳 **QR Code Transactions** - Secure discount validation system
- 🔔 **Multi-channel Notifications** - Push, Email, WhatsApp

## 📋 Tech Stack

### Frontend
- **Mobile**: React Native 0.72, TypeScript, React Navigation
- **Web**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui

### Backend
- **Framework**: NestJS 10, TypeScript
- **Database**: PostgreSQL 15 + PostGIS 3.3
- **Cache**: Redis 7
- **Search**: OpenSearch 2.x
- **Queue**: Bull (Redis-based)

### Infrastructure
- **Orchestration**: Kubernetes 1.28
- **IaC**: Terraform 1.6
- **CI/CD**: GitHub Actions
- **Cloud**: AWS / GCP

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
├──────────────────┬──────────────────┬──────────────────────┤
│   Mobile App     │  Web Dashboard   │   Admin Portal       │
│  React Native    │   Next.js 14     │    Next.js 14        │
└────────┬─────────┴────────┬─────────┴──────────┬───────────┘
         │                  │                     │
         └──────────────────┼─────────────────────┘
                            ▼
         ┌──────────────────────────────────────────┐
         │         API Gateway (Kong/NGINX)         │
         └──────────────────┬───────────────────────┘
                            │
         ┌──────────────────┼───────────────────────┐
         │                  │                        │
┌────────▼────┐  ┌─────────▼────────┐  ┌───────────▼──────┐
│Auth Service │  │Catalog Service   │  │Convenios Service │
└────────┬────┘  └─────────┬────────┘  └───────────┬──────┘
         │                 │                        │
         └─────────────────┼────────────────────────┘
                           ▼
         ┌────────────────────────────────────────┐
         │     PostgreSQL + PostGIS + Redis       │
         └────────────────────────────────────────┘
```

For complete architecture details, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## 📁 Project Structure

```
zonavip-platform/
├── backend/           # NestJS microservices
│   ├── src/
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── convenios/
│   │   ├── transactions/
│   │   ├── notifications/
│   │   └── analytics/
│   └── docker-compose.yml
├── mobile/            # React Native app
│   └── src/
│       ├── screens/
│       ├── components/
│       ├── services/
│       └── navigation/
├── web/               # Next.js dashboard
│   ├── app/
│   ├── components/
│   └── lib/
├── infrastructure/    # IaC & K8s
│   ├── terraform/
│   └── k8s/
├── docs/             # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── BACKLOG.md
└── .github/          # CI/CD & templates
    ├── workflows/
    └── ISSUE_TEMPLATE/
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ LTS
- Docker & Docker Compose
- PostgreSQL 15+ with PostGIS
- Redis 7+

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
docker-compose up -d
npm run start:dev
```

Visit http://localhost:3000/api/docs for API documentation.

### Mobile Setup

```bash
cd mobile
npm install
cp .env.example .env

# iOS
npx pod-install
npm run ios

# Android
npm run android
```

### Web Setup

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Visit http://localhost:3001

## 📚 Documentation

- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture and tech stack
- **[Database](./docs/DATABASE.md)** - Complete database schema with PostGIS
- **[API](./docs/API.md)** - REST API endpoints documentation
- **[Deployment](./docs/DEPLOYMENT.md)** - Kubernetes & Terraform guides
- **[Backlog](./docs/BACKLOG.md)** - Product backlog with 34 user stories
- **[Contributing](./CONTRIBUTING.md)** - Development guidelines

## 🎯 Key Concepts

### Triple Access Level System

- **N1 (Entity Level)**: Direct entity-business agreements (highest priority)
- **N2 (Plan Level)**: Benefits through organizational plans
- **N3 (Public Level)**: General public promotions

### Discount Formula

```
descuentoFinal = MAX(descuentoNivel2, descuentoPlanEntidad)
```

The platform always applies the maximum available discount to the user.

## 📊 MVP Timeline

**Duration**: 10 weeks

| Sprint | Weeks | Focus |
|--------|-------|-------|
| 1-2 | 1-4 | Foundation, Auth, Search |
| 3-4 | 4-6 | Core Features, Discounts |
| 5-6 | 6-8 | QR Codes, Transactions, UX |
| 7-8 | 8-9 | Analytics, Notifications |
| 9-10 | 9-10 | Testing, Polish, Deployment |

## 🧪 Testing

```bash
# Backend
cd backend
npm test                 # Unit tests
npm run test:e2e        # E2E tests
npm run test:cov        # Coverage

# Mobile
cd mobile
npm test

# Web
cd web
npm test
```

**Coverage Targets**: >80% for statements, branches, functions, and lines.

## 🚢 Deployment

### Docker

```bash
# Build
docker build -t zonavip-backend:latest ./backend

# Run
docker run -p 3000:3000 zonavip-backend:latest
```

### Kubernetes

```bash
# Deploy to production
kubectl apply -k infrastructure/k8s/overlays/prod

# Check status
kubectl get pods -n zonavip-prod
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete instructions.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
```

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

## 👥 Team

- **Product Owner**: TBD
- **Scrum Master**: TBD
- **Development Team**: TBD

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/beto03052a/zonavip-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/beto03052a/zonavip-platform/discussions)

## 🙏 Acknowledgments

Built with ❤️ using:
- [NestJS](https://nestjs.com/)
- [React Native](https://reactnative.dev/)
- [Next.js](https://nextjs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [PostGIS](https://postgis.net/)

---

**ZonaVIP** - Transforming benefit plans with technology