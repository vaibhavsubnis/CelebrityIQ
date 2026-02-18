# CLAUDE.md — CelebrityIQ

This file documents the CelebrityIQ repository for AI assistants (Claude, Copilot, etc.). It covers codebase structure, development workflows, and conventions to follow when contributing.

---

## Project Overview

**Celebrity IQ** is a daily celebrity guessing game that runs on iOS, Android, and the web. Each day a new celebrity photo is published, divided into 6 tiles. One tile is revealed initially and the player guesses who it is. A correct guess earns points (max 5); a wrong guess reveals another tile and reduces the available points by 1. The game ends on a correct guess or when all 6 tiles are open (0 points).

**Architecture:** React Native (Expo) frontend calling a C# ASP.NET Core Web API backed by MongoDB.

---

## Directory Structure

```
CelebrityIQ/
├── CLAUDE.md                           # AI assistant guidance (this file)
├── README.md                           # Human-facing project overview
├── .gitignore
│
├── backend/
│   ├── CelebrityIQ.API.sln            # .NET solution file
│   └── CelebrityIQ.API/
│       ├── CelebrityIQ.API.csproj      # Project file (.NET 8, MongoDB.Driver, Swashbuckle)
│       ├── Program.cs                  # App entry point, DI, CORS, Swagger
│       ├── appsettings.json            # Production config
│       ├── appsettings.Development.json
│       ├── Controllers/
│       │   ├── CelebritiesController.cs    # CRUD for celebrity records (admin)
│       │   └── DailyChallengeController.cs # Daily game endpoints
│       ├── Models/
│       │   ├── Celebrity.cs                # Celebrity entity (Name, DOB, Nationality, FieldOfExpertise, ImageUrl)
│       │   ├── DailyChallenge.cs           # Daily challenge scheduling entity
│       │   └── GuessRequest.cs             # Request/response DTOs for game API
│       ├── Services/
│       │   ├── CelebrityService.cs         # MongoDB CRUD operations for celebrities
│       │   └── DailyChallengeService.cs    # Daily challenge logic + guess validation
│       └── Settings/
│           └── MongoDbSettings.cs          # Typed config for MongoDB connection
│
└── frontend/
    ├── App.tsx                         # Root component with NavigationContainer
    ├── app.json                        # Expo config (iOS, Android, Web)
    ├── babel.config.js
    ├── index.js                        # registerRootComponent entry
    ├── package.json                    # Dependencies (Expo, React Navigation)
    ├── tsconfig.json                   # TypeScript strict mode
    └── src/
        ├── components/
        │   ├── TileGrid.tsx            # 3x2 image grid with reveal/cover logic
        │   ├── GuessInput.tsx          # Text input + submit button
        │   └── ScoreDisplay.tsx        # Points, tiles revealed, guesses used
        ├── navigation/
        │   └── AppNavigator.tsx        # Bottom tabs (Game, Admin) + admin stack
        ├── screens/
        │   ├── GameScreen.tsx          # Main game play screen
        │   ├── AdminListScreen.tsx     # Celebrity list with edit/delete
        │   └── AdminEditScreen.tsx     # Add/edit celebrity form
        ├── services/
        │   └── api.ts                  # HTTP client for backend API
        └── types/
            └── index.ts               # Shared TypeScript interfaces
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native (Expo) — iOS, Android, Web |
| Backend | C# / ASP.NET Core 8 Web API |
| Database | MongoDB |
| API Docs | Swagger / OpenAPI (Swashbuckle) |
| Navigation | React Navigation (bottom tabs + native stack) |

---

## Development Workflow

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) running on `localhost:27017`

### Backend

```bash
cd backend/CelebrityIQ.API
dotnet restore
dotnet run              # http://localhost:5000
dotnet watch run        # with hot-reload
```

Swagger UI available at `http://localhost:5000/swagger` in development mode.

### Frontend

```bash
cd frontend
npm install
npx expo start          # then press w (web), i (iOS), a (Android)
```

### Environment Variables

MongoDB connection string is configured in `appsettings.json` / `appsettings.Development.json`. Never commit secrets — use environment variables or user secrets for production credentials:

```bash
# Override MongoDB connection via env var
MongoDbSettings__ConnectionString=mongodb+srv://user:pass@cluster.mongodb.net
```

---

## API Endpoints

### Celebrities (Admin CRUD)

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/celebrities` | List all celebrities |
| `GET` | `/api/celebrities/{id}` | Get one by ID |
| `POST` | `/api/celebrities` | Create a celebrity |
| `PUT` | `/api/celebrities/{id}` | Update a celebrity |
| `DELETE` | `/api/celebrities/{id}` | Delete a celebrity |

### Daily Challenge (Game)

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/dailychallenge` | Get today's challenge (image URL, initial tile) |
| `POST` | `/api/dailychallenge/guess` | Submit a guess (`{ celebrityId, guess, tilesRevealed }`) |

### Error Response Shape

```json
{ "error": { "code": "NOT_FOUND", "message": "Celebrity not found" } }
```

---

## Game Mechanics

1. **6 tiles** in a 3x2 grid cover the celebrity image
2. **1 tile** revealed initially (randomly selected, deterministic per day)
3. Scoring per round:

| Round | Tiles Open | Points on Correct Guess |
|:-:|:-:|:-:|
| 1 | 1 | 5 |
| 2 | 2 | 4 |
| 3 | 3 | 3 |
| 4 | 4 | 2 |
| 5 | 5 | 1 |
| 6 | 6 | 0 (game over) |

4. On correct guess or game over, all tiles reveal and celebrity info is shown

---

## Git Conventions

### Branching

- `main` — production-ready; protected
- `feature/<description>` — feature work
- `fix/<description>` — bug fixes
- `claude/<task-id>` — AI assistant branches

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Scopes:** `game`, `admin`, `api`, `models`, `nav`, `ui`

---

## Code Conventions

### General

- Prefer clarity over cleverness
- Keep functions small and single-purpose
- No magic numbers/strings — use named constants
- No dead code or commented-out blocks
- No `console.log` / debug statements in committed code

### Naming

| Element | Convention | Example |
|---|---|---|
| C# files/classes | `PascalCase` | `CelebrityService.cs` |
| C# methods | `PascalCase` | `GetAllAsync()` |
| TS/TSX files | `PascalCase` | `GameScreen.tsx` |
| TS functions/variables | `camelCase` | `handleGuess` |
| TS interfaces | `PascalCase` | `GuessResponse` |
| Constants | `UPPER_SNAKE_CASE` | `TOTAL_TILES` |
| MongoDB collections | `snake_case` | `daily_challenges` |

### TypeScript

- Strict mode enabled (`"strict": true` in tsconfig)
- Use `interface` for object shapes
- Avoid `any`; use `unknown` when type is truly unknown
- Shared types live in `src/types/index.ts`

### C# / ASP.NET

- Async everywhere — all service methods return `Task<T>`
- Services registered as singletons (MongoDB driver is thread-safe)
- Configuration via `IOptions<MongoDbSettings>` pattern
- Controllers use consistent error response shape

---

## AI Assistant Guidelines

### Read Before Writing

Always read relevant files before modifying them. Check existing interfaces, models, and service methods — do not guess.

### Minimal Changes

Make only the changes necessary for the task. Do not refactor surrounding code, add comments to unchanged code, or add unrequested features.

### Security

- No hardcoded secrets, tokens, or credentials
- Use parameterized queries (MongoDB driver handles this)
- Validate user input on the backend
- Do not expose stack traces in API responses

### Dependencies

- Prefer libraries already in `package.json` / `.csproj`
- Note any new dependencies in the PR description

### Key Files to Understand

| To modify... | Read first... |
|---|---|
| Game logic | `GameScreen.tsx`, `DailyChallengeService.cs`, `DailyChallengeController.cs` |
| Celebrity data | `Celebrity.cs`, `CelebrityService.cs`, `CelebritiesController.cs` |
| API client | `src/services/api.ts`, `src/types/index.ts` |
| Navigation | `AppNavigator.tsx`, `src/types/index.ts` (param lists) |
| Tile rendering | `TileGrid.tsx` |

---

## Useful Links

- GitHub Repository: https://github.com/vaibhavsubnis/CelebrityIQ
- Issue Tracker: https://github.com/vaibhavsubnis/CelebrityIQ/issues
- Expo Docs: https://docs.expo.dev/
- ASP.NET Core Docs: https://learn.microsoft.com/en-us/aspnet/core/
- MongoDB .NET Driver: https://www.mongodb.com/docs/drivers/csharp/current/
