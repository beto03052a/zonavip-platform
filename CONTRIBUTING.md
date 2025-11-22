# Contributing to ZonaVIP

Thank you for your interest in contributing to ZonaVIP! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Development Methodology](#development-methodology)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Commit Conventions](#commit-conventions)
7. [Pull Request Process](#pull-request-process)
8. [Testing Guidelines](#testing-guidelines)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Development Methodology

We follow **SCRUM** methodology with 2-week sprints.

### Sprint Cycle

1. **Sprint Planning** (Monday)
   - Review backlog
   - Assign story points
   - Commit to sprint goals

2. **Daily Standups** (Every day, 15 min)
   - What did I do yesterday?
   - What will I do today?
   - Any blockers?

3. **Sprint Review** (Friday of week 2)
   - Demo completed work
   - Gather feedback

4. **Sprint Retrospective** (Friday of week 2)
   - What went well?
   - What can be improved?
   - Action items

### Roles

- **Product Owner**: Prioritizes backlog, defines acceptance criteria
- **Scrum Master**: Facilitates ceremonies, removes blockers
- **Development Team**: Delivers working software

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/zonavip-platform.git
cd zonavip-platform
```

### 2. Set Up Development Environment

```bash
# Backend
cd backend
npm install
cp .env.example .env
docker-compose up -d

# Mobile
cd ../mobile
npm install
cp .env.example .env

# Web
cd ../web
npm install
cp .env.example .env.local
```

### 3. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b bugfix/issue-description
```

## Development Workflow

### Branch Strategy

We use **Git Flow**:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Emergency production fixes
- `release/*`: Release preparation

### Workflow Steps

1. **Create Issue**: Create GitHub issue for your work
2. **Create Branch**: Branch from `develop`
3. **Develop**: Write code, tests, documentation
4. **Commit**: Follow commit conventions
5. **Push**: Push to your fork
6. **Pull Request**: Create PR to `develop`
7. **Code Review**: Address feedback
8. **Merge**: Squash and merge after approval

## Coding Standards

### General Principles

- **DRY** (Don't Repeat Yourself)
- **SOLID** principles
- **KISS** (Keep It Simple, Stupid)
- **YAGNI** (You Aren't Gonna Need It)

### TypeScript/JavaScript

```typescript
// Use TypeScript for type safety
interface User {
  id: string;
  email: string;
  name: string;
}

// Use arrow functions
const getUserById = async (id: string): Promise<User> => {
  // Implementation
};

// Use async/await over promises
const user = await getUserById('123');

// Use const/let, not var
const API_URL = 'https://api.zonavip.com';
let counter = 0;
```

### Naming Conventions

- **Variables/Functions**: camelCase (`getUserData`, `totalAmount`)
- **Classes/Interfaces**: PascalCase (`UserService`, `IAuthProvider`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Files**: kebab-case (`user-service.ts`, `auth-controller.ts`)
- **Components**: PascalCase (`UserProfile.tsx`, `LoginForm.tsx`)

### File Organization

```typescript
// 1. Imports (grouped)
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

// 2. Constants
const DEFAULT_PAGE_SIZE = 20;

// 3. Interfaces/Types
interface QueryOptions {
  page: number;
  limit: number;
}

// 4. Class/Component
@Injectable()
export class UserService {
  // Properties
  private readonly logger = new Logger(UserService.name);
  
  // Constructor
  constructor(private userRepository: UserRepository) {}
  
  // Methods
  async findAll(options: QueryOptions): Promise<User[]> {
    // Implementation
  }
}
```

### Code Comments

```typescript
/**
 * Calculates the final discount for a user at a business.
 * Implements the formula: MAX(descuentoNivel2, descuentoPlanEntidad)
 * 
 * @param userId - The user's unique identifier
 * @param businessId - The business's unique identifier
 * @returns The calculated discount object
 */
async calculateDiscount(userId: string, businessId: string) {
  // Complex logic gets inline comments
  // Find all applicable agreements
  const agreements = await this.findApplicableAgreements(userId, businessId);
  
  // Apply discount calculation formula
  return this.applyBestDiscount(agreements);
}
```

## Commit Conventions

We follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(auth): add Google OAuth integration"

# Bug fix
git commit -m "fix(transactions): resolve QR code expiration issue"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Breaking change
git commit -m "feat(api): migrate to v2 authentication

BREAKING CHANGE: Authentication now requires API version header"
```

### Scope

Use module names as scopes:
- `auth`, `catalog`, `convenios`, `transactions`
- `mobile`, `web`, `backend`
- `ci`, `docs`, `infra`

## Pull Request Process

### Before Submitting

1. **Run Tests**: Ensure all tests pass
   ```bash
   npm test
   npm run test:e2e
   ```

2. **Run Linter**: Fix any linting errors
   ```bash
   npm run lint
   ```

3. **Type Check**: Ensure TypeScript compiles
   ```bash
   npm run type-check
   ```

4. **Update Documentation**: Update relevant docs

### PR Template

Use the PR template to provide:
- Description of changes
- Related issues
- Testing performed
- Screenshots (if UI changes)
- Breaking changes
- Checklist completion

### Code Review

All PRs require:
- **1 approval** from a team member
- **All CI checks passing**
- **No merge conflicts**
- **Coverage threshold met** (80%+)

### Review Checklist

Reviewers should verify:
- [ ] Code follows project standards
- [ ] Tests are adequate
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations
- [ ] Accessibility (for UI)

## Testing Guidelines

### Test Pyramid

- **70%** Unit tests
- **20%** Integration tests
- **10%** E2E tests

### Unit Tests

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<UserRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    service = new UserService(repository);
  });

  it('should find user by email', async () => {
    // Arrange
    const email = 'test@example.com';
    repository.findByEmail.mockResolvedValue(mockUser);

    // Act
    const result = await service.findByEmail(email);

    // Assert
    expect(result).toEqual(mockUser);
    expect(repository.findByEmail).toHaveBeenCalledWith(email);
  });
});
```

### Integration Tests

```typescript
describe('Auth API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Coverage Requirements

- **Overall**: > 80%
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Definition of Done

A user story is complete when:

1. ✅ Code is written and follows standards
2. ✅ Unit tests written and passing (>80% coverage)
3. ✅ Integration tests passing
4. ✅ E2E tests passing (if applicable)
5. ✅ Documentation updated
6. ✅ Code reviewed and approved
7. ✅ QA tested in staging
8. ✅ Acceptance criteria met
9. ✅ No known bugs or issues
10. ✅ Deployed to staging
11. ✅ Product Owner accepted

## Getting Help

- **Documentation**: Check [docs/](./docs/) directory
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Slack**: Join our Slack workspace (team members only)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- Release notes
- Contributors list
- Annual acknowledgments

Thank you for contributing to ZonaVIP! 🎉
