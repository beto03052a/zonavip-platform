# ZonaVIP Web Dashboard

Next.js web application for the ZonaVIP platform - Admin panel and business management dashboard.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Maps**: react-leaflet
- **Tables**: TanStack Table

## Prerequisites

- Node.js 18+ LTS
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your configuration
nano .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth layout group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── layout.tsx
│   │   ├── page.tsx       # Dashboard home
│   │   ├── businesses/    # Business management
│   │   ├── agreements/    # Agreement management
│   │   ├── transactions/  # Transaction history
│   │   ├── analytics/     # Analytics & reports
│   │   ├── users/         # User management
│   │   └── settings/      # Settings
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── dashboard/        # Dashboard-specific
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatsCard.tsx
│   │   └── Charts/
│   ├── business/         # Business components
│   │   ├── BusinessTable.tsx
│   │   ├── BusinessForm.tsx
│   │   └── BusinessMap.tsx
│   ├── forms/            # Form components
│   │   ├── LoginForm.tsx
│   │   └── ...
│   └── layout/           # Layout components
│       ├── Navigation.tsx
│       └── Footer.tsx
├── lib/                  # Utilities
│   ├── api/             # API clients
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── businesses.ts
│   │   ├── agreements.ts
│   │   └── analytics.ts
│   ├── utils.ts         # Utility functions
│   ├── constants.ts     # Constants
│   └── validators.ts    # Validation schemas
├── types/               # TypeScript types
│   ├── api.ts
│   └── models.ts
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useBusinesses.ts
│   └── useAnalytics.ts
├── public/              # Static assets
│   ├── images/
│   └── icons/
├── next.config.js       # Next.js configuration
├── tailwind.config.ts   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── package.json
├── tsconfig.json
└── .env.example
```

## Features

### Admin Dashboard
- Overview statistics and KPIs
- Real-time analytics charts
- User management
- Business and agreement management
- Transaction monitoring
- Report generation

### Business Dashboard
- Business profile management
- Agreement configuration
- Transaction history
- Performance analytics
- Customer insights

### Entity (Company) Dashboard
- Employee management
- Plan configuration
- Usage statistics
- Savings reports

## Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
```

## Styling

This project uses Tailwind CSS with shadcn/ui components.

### Adding shadcn/ui Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
```

### Custom Theme

Edit `tailwind.config.ts` to customize colors, fonts, and other design tokens.

## Authentication

The dashboard uses NextAuth.js for authentication with support for:
- Email/Password
- Google OAuth
- Facebook OAuth
- JWT tokens

## API Integration

All API calls use the centralized client in `lib/api/client.ts`:

```typescript
import { apiClient } from '@/lib/api/client';

// Example usage
const businesses = await apiClient.get('/catalog/businesses');
```

## Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `GOOGLE_CLIENT_ID`: Google OAuth credentials
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t zonavip-web:latest .

# Run container
docker run -p 3001:3001 zonavip-web:latest
```

### Static Export

```bash
# Build static site
npm run build

# Output in 'out' directory
```

## Performance Optimization

- Server Components by default (Next.js 14)
- Image optimization with next/image
- Font optimization with next/font
- Code splitting and lazy loading
- Static generation where possible

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../LICENSE) file.

## Support

- **API Docs**: [docs/API.md](../docs/API.md)
- **Architecture**: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)

## Related Projects

- [Backend](../backend/README.md)
- [Mobile App](../mobile/README.md)
