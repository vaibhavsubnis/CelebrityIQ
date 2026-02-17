# CLAUDE.md — CelebrityIQ

This file documents the CelebrityIQ repository for AI assistants (Claude, Copilot, etc.). It covers codebase structure, development workflows, and conventions to follow when contributing.

---

## Project Overview

**CelebrityIQ** is an application centered on celebrity knowledge. Based on the repository name and context, the project likely involves one or more of:

- AI-powered celebrity trivia / quiz functionality
- A recommendation or search engine for celebrity information
- An interactive game or social platform around celebrity knowledge

> As the codebase grows, update this section with the concrete product description, tech stack decisions, and high-level architecture.

---

## Repository State

This repository was initialized without source code. When code is added, update the sections below to reflect the actual structure, commands, and conventions in use.

---

## Directory Structure (expected conventions)

```
CelebrityIQ/
├── CLAUDE.md              # This file — AI assistant guidance
├── README.md              # Human-facing project overview
├── .gitignore
├── package.json           # (if Node/JS/TS project)
├── pyproject.toml         # (if Python project)
│
├── src/                   # Application source code
│   ├── components/        # UI components (if frontend exists)
│   ├── pages/             # Route-level views / Next.js pages
│   ├── api/               # Backend API handlers or routes
│   ├── services/          # Business logic, external API clients
│   ├── models/            # Data models / database schemas
│   ├── utils/             # Shared utility functions
│   └── types/             # TypeScript type definitions
│
├── tests/                 # Test files mirroring src/ structure
│   ├── unit/
│   └── integration/
│
├── public/                # Static assets (images, fonts, icons)
├── docs/                  # Additional documentation
└── scripts/               # Build, seed, migration scripts
```

Update this tree to match the actual layout once the project structure is established.

---

## Tech Stack

> Fill in once decided. Common choices for a project like this:

| Layer | Technology |
|---|---|
| Frontend | Next.js / React / Vue |
| Backend | Node.js (Express/Fastify) / Python (FastAPI/Django) |
| Database | PostgreSQL / MongoDB / Supabase |
| Auth | NextAuth.js / Auth0 / Clerk |
| AI/ML | OpenAI API / Anthropic Claude API / HuggingFace |
| Hosting | Vercel / Railway / AWS |
| CI/CD | GitHub Actions |

---

## Development Workflow

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/vaibhavsubnis/CelebrityIQ.git
cd CelebrityIQ

# Install dependencies (adjust for your package manager)
npm install        # Node.js
# or
pip install -e .   # Python

# Copy environment variables template
cp .env.example .env
# Fill in required secrets in .env
```

### Environment Variables

Never commit secrets. Use `.env` for local development and set secrets via the hosting platform or CI/CD secrets for deployment.

Expected variables (update as the project evolves):

```
# API Keys
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# App
NODE_ENV=development
```

### Running the Project

```bash
# Development server
npm run dev         # or: python manage.py runserver

# Production build
npm run build
npm start
```

### Running Tests

```bash
# Run all tests
npm test            # or: pytest

# Run with coverage
npm run test:coverage   # or: pytest --cov

# Run specific test file
npm test src/services/celebrity.test.ts
```

### Linting and Formatting

```bash
# Lint
npm run lint        # or: ruff check .

# Format
npm run format      # or: ruff format .

# Type checking (TypeScript)
npm run typecheck   # tsc --noEmit
```

**Always run lint, format, and type checks before committing.**

---

## Git Conventions

### Branching Strategy

- `main` — production-ready code; protected branch
- `develop` — integration branch for features
- `feature/<short-description>` — individual feature work
- `fix/<short-description>` — bug fixes
- `claude/<task-id>` — branches created by AI assistants

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

Examples:
```
feat(quiz): add celebrity knowledge scoring algorithm
fix(auth): resolve token expiry on mobile sessions
docs: update API endpoint documentation
test(services): add unit tests for celebrity lookup
```

### Pull Requests

- Keep PRs focused and small (one concern per PR)
- Add a description that explains *why*, not just *what*
- Link the related GitHub Issue (`Closes #<issue-number>`)
- Ensure CI passes before requesting review
- Request review from at least one human before merging to `main`

---

## Code Conventions

### General

- Prefer clarity over cleverness; code is read more than written
- Keep functions small and single-purpose
- Avoid magic numbers/strings — use named constants
- Do not commit dead code or commented-out blocks
- Remove `console.log` / `print` debug statements before merging

### Naming

| Element | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `celebrity-service.ts` |
| Components | `PascalCase` | `CelebrityCard.tsx` |
| Functions/variables | `camelCase` | `getCelebrityById` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_QUIZ_QUESTIONS` |
| Types/Interfaces | `PascalCase` | `CelebrityProfile` |
| Database tables | `snake_case` | `celebrity_profiles` |
| CSS classes | `kebab-case` or Tailwind utility | `quiz-container` |

### TypeScript (if applicable)

- Prefer `interface` over `type` for object shapes
- Use strict mode (`"strict": true` in `tsconfig.json`)
- Avoid `any`; use `unknown` when type is truly unknown
- Export types from a central `types/` directory

### API Design

- Follow RESTful conventions or GraphQL schema conventions
- Version APIs: `/api/v1/celebrities`
- Return consistent error shapes:
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Celebrity not found" } }
  ```
- Use HTTP status codes correctly (200, 201, 400, 401, 403, 404, 500)

### Testing

- Write tests for all business logic in `services/`
- Aim for >80% coverage on critical paths
- Use descriptive test names: `it('returns 404 when celebrity does not exist')`
- Mock external API calls in unit tests; use real calls in integration tests

---

## AI Assistant Guidelines

These conventions apply specifically when Claude or another AI assistant is contributing to this repository.

### Read Before Writing

Always read relevant files before modifying them. Never guess at existing interfaces, function signatures, or data shapes — look them up first.

### Minimal Changes

Make only the changes necessary for the task at hand. Do not:
- Refactor surrounding code unless asked
- Add comments or documentation to unchanged code
- Change formatting in files you are not otherwise modifying
- Add features not requested by the issue or task description

### Security

Never introduce:
- Hardcoded secrets, tokens, or credentials
- SQL injection vulnerabilities (use parameterized queries)
- XSS vulnerabilities (sanitize user input before rendering)
- Command injection (avoid `exec`/`shell` with user input)
- Exposed internal stack traces in API responses

### External Dependencies

- Prefer existing libraries already in `package.json` / `pyproject.toml`
- Do not add new dependencies without noting them in the PR description
- Avoid dependencies with poor maintenance history or security track records

### Environment and Secrets

- Read secrets from environment variables only
- Never log secrets, tokens, or PII
- Do not add `.env` files to version control

### Commit and Push Behavior

- Branch names created by AI assistants must follow: `claude/<task-id>`
- Commit messages must follow Conventional Commits format
- Always push to the designated feature branch; never push directly to `main`

---

## Issue and Task Workflow

1. Pick up an issue from GitHub Issues
2. Create a branch: `git checkout -b feature/<description>` (or `claude/<id>` for AI tasks)
3. Implement changes with tests
4. Run lint, format, type check, and tests locally
5. Push branch and open a PR against `develop` (or `main` if no develop branch)
6. Address review feedback
7. Merge after approval and green CI

---

## CI/CD

> Document your GitHub Actions workflows here once they are added.

Expected workflows:
- `ci.yml` — runs on every PR: lint, type-check, test
- `deploy.yml` — runs on push to `main`: build and deploy to production

---

## Useful Links

- GitHub Repository: https://github.com/vaibhavsubnis/CelebrityIQ
- Issue Tracker: https://github.com/vaibhavsubnis/CelebrityIQ/issues

---

## Updating This File

Keep CLAUDE.md up to date as the project evolves. In particular, update:

- **Tech Stack** when libraries or frameworks are decided
- **Directory Structure** when the actual layout diverges from the template
- **Commands** when scripts change in `package.json` / `Makefile`
- **Conventions** when the team adopts new patterns

This file is the source of truth for AI assistants working in this codebase.
