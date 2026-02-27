# Product Requirements Document — Celebrity IQ

**Version:** 1.0
**Date:** 2026-02-27
**Status:** Draft
**Owner:** Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Audience](#3-target-audience)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
   - 5.1 [Game Mechanics](#51-game-mechanics)
   - 5.2 [Celebrity Data Management (Admin)](#52-celebrity-data-management-admin)
   - 5.3 [Daily Challenge Scheduling](#53-daily-challenge-scheduling)
   - 5.4 [Navigation & Screens](#54-navigation--screens)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
   - 7.1 [Frontend](#71-frontend)
   - 7.2 [Backend](#72-backend)
   - 7.3 [Database](#73-database)
   - 7.4 [Integration Layer](#74-integration-layer)
8. [Data Models](#8-data-models)
9. [API Specification](#9-api-specification)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [Admin Panel Requirements](#11-admin-panel-requirements)
12. [Testing Requirements](#12-testing-requirements)
    - 12.1 [Frontend Unit Tests](#121-frontend-unit-tests)
    - 12.2 [Backend Unit Tests](#122-backend-unit-tests)
    - 12.3 [Functional / Integration Tests](#123-functional--integration-tests)
    - 12.4 [End-to-End Tests](#124-end-to-end-tests)
    - 12.5 [Coverage Targets](#125-coverage-targets)
13. [Security Requirements](#13-security-requirements)
14. [Performance Requirements](#14-performance-requirements)
15. [Deployment & Environment Requirements](#15-deployment--environment-requirements)
16. [Accessibility Requirements](#16-accessibility-requirements)
17. [Success Metrics & KPIs](#17-success-metrics--kpis)
18. [Out of Scope](#18-out-of-scope)
19. [Open Questions & Dependencies](#19-open-questions--dependencies)
20. [Glossary](#20-glossary)

---

## 1. Executive Summary

**Celebrity IQ** is a daily, single-player celebrity-guessing game available on iOS, Android, and desktop web browsers. Each day a new celebrity photograph is published. The image is divided into six equal tiles; only one tile is initially visible. Players earn points by correctly identifying the celebrity. The fewer tiles needed, the higher the score. The game resets to a new celebrity the following day.

The product consists of:

- A **React Native (Expo)** frontend targeting iOS, Android, and web.
- A **C# / ASP.NET Core 8** REST API backend.
- A **MongoDB** database storing celebrity records and daily-challenge schedules.
- An **Admin Panel** embedded in the frontend application to manage celebrity content.
- A comprehensive **test suite** covering unit, integration, and end-to-end scenarios.

---

## 2. Product Vision & Goals

### Vision

Deliver a lightweight, habit-forming daily game that tests and grows players' knowledge of celebrities across all fields — entertainment, sports, politics, science, and beyond.

### Goals

| Priority | Goal |
|---|---|
| P0 | A playable daily challenge that resets every 24 hours |
| P0 | Cross-platform availability: iOS, Android, desktop web |
| P0 | Content management via an Admin Panel |
| P1 | Smooth, responsive tile-reveal animation |
| P1 | Clear, intuitive scoring feedback |
| P2 | Shareable results (e.g., "I got today's celebrity in 2 tiles!") |
| P2 | Leaderboard / streak tracking (future phase) |

---

## 3. Target Audience

| Segment | Description |
|---|---|
| Casual Gamers | Users who enjoy short daily puzzle games (Wordle, Quordle, etc.) |
| Pop-Culture Enthusiasts | Fans who follow celebrities across entertainment, sport, and media |
| Mobile-First Users | Players primarily on iPhone or Android |
| Desktop Users | Players who prefer playing in a browser at a desk |

**Age Range:** 16–55
**Frequency:** Daily sessions averaging 2–5 minutes

---

## 4. User Stories

### Player

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | Player | See one tile of a celebrity photo on launch | I can attempt an early guess for maximum points |
| US-02 | Player | Type a celebrity name and submit a guess | I can test my knowledge |
| US-03 | Player | See a new tile revealed after a wrong guess | I have more visual information to try again |
| US-04 | Player | See my current score / points remaining | I understand the cost of each wrong guess |
| US-05 | Player | See all tiles revealed when I guess correctly | I get full satisfaction and confirmation |
| US-06 | Player | See celebrity details (name, DOB, nationality, field) after the game ends | I learn about the celebrity |
| US-07 | Player | Have only one challenge available per day | I have a reason to return tomorrow |
| US-08 | Player | Play the same game whether on my phone or desktop browser | I am not limited by device |
| US-09 | Player | See an autocomplete suggestion list as I type | I can guess correctly without exact spelling |

### Admin

| ID | As an… | I want to… | So that… |
|---|---|---|---|
| US-10 | Admin | Add a new celebrity with name, DOB, nationality, field of expertise, and image URL | New content is available for scheduling |
| US-11 | Admin | Edit an existing celebrity record | I can correct mistakes or update information |
| US-12 | Admin | Delete a celebrity record | Outdated or incorrect entries are removed |
| US-13 | Admin | View a paginated list of all celebrities | I can browse and manage the content library |
| US-14 | Admin | Schedule a celebrity as a specific day's challenge | Daily content is planned in advance |
| US-15 | Admin | Preview the celebrity image and tile layout before publishing | I can verify image quality and tile positioning |

---

## 5. Functional Requirements

### 5.1 Game Mechanics

#### FR-GM-01: Daily Challenge Load

- On app launch, the game fetches the current day's challenge from the backend.
- The challenge is determined by the server date (UTC), not the client's local time.
- If no challenge is scheduled for today, display a friendly "No challenge today — check back soon!" message.

#### FR-GM-02: Tile Grid Display

- The celebrity image is divided into **6 equal tiles** arranged in a **3-column × 2-row grid**.
- Each tile is identified by a zero-indexed position (0–5).
- At game start, exactly **one tile** is revealed; the remaining five are covered.
- The initially revealed tile is determined by a **deterministic algorithm** (e.g., seeded by the challenge date) so all players see the same tile.
- Covered tiles display a neutral, uniform placeholder colour or pattern.

#### FR-GM-03: Guessing

- The player types a celebrity name into a text input field.
- The input supports **autocomplete** against the celebrity name list fetched from the API.
- The player submits a guess by pressing Enter or tapping the Submit button.
- Names are compared **case-insensitively** and **trimmed of leading/trailing whitespace** on the backend.
- Partial matches are **not** accepted; the full name must match.

#### FR-GM-04: Correct Guess Outcome

- All remaining tiles are revealed with an animation.
- The player's earned points are displayed prominently.
- A **result card** appears showing:
  - Celebrity name
  - Date of birth
  - Nationality
  - Field of expertise
  - A short congratulatory message
- The input and submit button are disabled.

#### FR-GM-05: Incorrect Guess Outcome

- One additional tile is revealed (total revealed tiles increases by 1).
- Available points decrease by 1 (from the previous value).
- The input is cleared and focused so the player can try again immediately.
- A brief, non-intrusive error indicator ("Try again!") is shown.

#### FR-GM-06: Game-Over Condition

- The game ends when:
  - The player guesses correctly (**win**), **or**
  - All 6 tiles are open and the available points reach 0 (**lose**).
- On loss, all tiles reveal and the celebrity result card shows without congratulations ("Better luck tomorrow!").

#### FR-GM-07: Scoring Summary

| Round | Tiles Open Before Guess | Points on Correct Guess |
|:-----:|:-----------------------:|:-----------------------:|
| 1     | 1                       | 5                       |
| 2     | 2                       | 4                       |
| 3     | 3                       | 3                       |
| 4     | 4                       | 2                       |
| 5     | 5                       | 1                       |
| 6     | 6                       | 0 (game over — no guess accepted) |

- At the start of Round 6, no more guesses are accepted; the game immediately ends with 0 points.

#### FR-GM-08: Replay Lock

- Once a player has completed today's challenge (win or lose), the game screen shows a **summary/lock state** for the remainder of the day.
- State is persisted in **device local storage** (e.g., AsyncStorage on mobile, localStorage on web).
- Players cannot replay the same daily challenge.

#### FR-GM-09: Share Result

- After game completion, a **Share** button generates a text summary such as:
  ```
  Celebrity IQ — 2026-02-27
  🟩🟩⬜⬜⬜⬜ — 4 points!
  Play at: https://celebrityiq.app
  ```
- Uses the platform share sheet on mobile; copies to clipboard on web.

---

### 5.2 Celebrity Data Management (Admin)

#### FR-AD-01: Create Celebrity

- Admin can create a celebrity record with the following **required** fields:
  - `name` (string, max 120 characters)
  - `dateOfBirth` (date, ISO 8601)
  - `nationality` (string, max 80 characters)
  - `fieldOfExpertise` (string, max 80 characters)
  - `imageUrl` (valid URL string, max 500 characters)
- On successful creation the record is stored in MongoDB and the list view refreshes.

#### FR-AD-02: Read / List Celebrities

- A scrollable, paginated list shows all celebrities.
- Default sort: alphabetical by name (A → Z).
- Each list item displays: name, field of expertise, and a thumbnail of the image.
- A search bar filters by name (client-side or server-side, minimum 2 characters).

#### FR-AD-03: Update Celebrity

- Admin can edit any field of an existing celebrity record.
- A preview of the updated image is shown when the URL changes.
- On save, the record is updated in-place in MongoDB.

#### FR-AD-04: Delete Celebrity

- Admin taps Delete and sees a **confirmation dialog** before the record is removed.
- If the celebrity is scheduled as a future daily challenge, deletion must be **blocked** with an appropriate error message.

#### FR-AD-05: Schedule Daily Challenge

- Admin can assign a celebrity to a future calendar date from the admin list screen.
- The same date cannot have more than one celebrity assigned.
- Past dates cannot be reassigned.

---

### 5.3 Daily Challenge Scheduling

#### FR-SC-01: Challenge Resolution

- The backend exposes `GET /api/dailychallenge` which returns the challenge for **today's UTC date**.
- The backend resolves this by querying the `daily_challenges` collection for a document matching today's date.
- The response includes the celebrity image URL and the index of the initial revealed tile.

#### FR-SC-02: Deterministic Tile Selection

- The index of the initially revealed tile is computed server-side as:
  ```
  initialTileIndex = dayOfYear(todayUtc) % TOTAL_TILES
  ```
  where `TOTAL_TILES = 6`. This ensures all clients see the same first tile.

---

### 5.4 Navigation & Screens

| Screen | Route / Tab | Description |
|---|---|---|
| Game Screen | `Game` tab (default) | Main daily challenge gameplay |
| Admin List | `Admin` tab → List | View, search, and manage celebrities |
| Admin Edit/Create | Admin stack → Edit | Form to create or update a celebrity |

---

## 6. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | API responses must return in < 300 ms (p95) under normal load |
| NFR-02 | Performance | The app must load and display the initial tile within 2 seconds on a 4G connection |
| NFR-03 | Availability | Backend API target uptime: 99.5% monthly |
| NFR-04 | Scalability | Backend must support 10,000 concurrent daily active users without degradation |
| NFR-05 | Cross-Platform | App must be pixel-perfect equivalent across iOS 16+, Android 12+, and modern desktop browsers (Chrome, Firefox, Safari, Edge) |
| NFR-06 | Responsiveness | Web layout must be usable on screens from 375 px (mobile) to 1920 px (desktop) |
| NFR-07 | Offline | When offline, show cached today's challenge if previously fetched; gracefully handle network errors |
| NFR-08 | Accessibility | Minimum WCAG 2.1 AA compliance on web |
| NFR-09 | Security | All API traffic served over HTTPS in production |
| NFR-10 | Security | Admin endpoints protected by authentication (JWT) |
| NFR-11 | Maintainability | Code test coverage ≥ 80% for business logic |
| NFR-12 | Internationalisation | Initial release: English only; architecture must support i18n in future |

---

## 7. Technical Architecture

### 7.1 Frontend

| Aspect | Choice | Rationale |
|---|---|---|
| Framework | React Native (Expo SDK 51+) | Single codebase for iOS, Android, and web |
| Language | TypeScript (strict mode) | Type safety, IDE support, fewer runtime errors |
| Navigation | React Navigation 6 (Bottom Tabs + Native Stack) | Industry standard; supports web |
| State Management | React Context + `useReducer` | Sufficient for this scope; avoids over-engineering |
| Local Storage | `@react-native-async-storage/async-storage` | Cross-platform; used to persist daily-play state |
| HTTP Client | `fetch` (native) / `axios` | Axios preferred for its interceptor and timeout support |
| Testing | Jest + React Native Testing Library | Standard Expo testing stack |

**Key screens and components:**

```
src/
├── components/
│   ├── TileGrid.tsx          # 3×2 image tile grid with reveal/cover animations
│   ├── GuessInput.tsx        # Autocomplete text input + submit button
│   ├── ScoreDisplay.tsx      # Current score, tiles revealed, guesses remaining
│   └── ResultCard.tsx        # Post-game celebrity info card
├── navigation/
│   └── AppNavigator.tsx      # Bottom tabs (Game, Admin) + admin stack
├── screens/
│   ├── GameScreen.tsx        # Daily challenge gameplay
│   ├── AdminListScreen.tsx   # Celebrity list with search and actions
│   └── AdminEditScreen.tsx   # Create/edit celebrity form
├── services/
│   └── api.ts                # Typed HTTP client (axios instance)
├── context/
│   └── GameContext.tsx       # Game state (tiles, guesses, score, lock)
└── types/
    └── index.ts              # Shared TypeScript interfaces
```

### 7.2 Backend

| Aspect | Choice | Rationale |
|---|---|---|
| Framework | ASP.NET Core 8 Web API | Mature, high-performance, cross-platform |
| Language | C# 12 | Latest language features; nullable references |
| ORM / Driver | MongoDB.Driver 2.x | Official .NET driver; async-first |
| Auth | JWT Bearer tokens | Stateless; works across mobile and web clients |
| API Docs | Swashbuckle / Swagger UI | Auto-generated; useful during development |
| Testing | xUnit + Moq + WebApplicationFactory | Standard .NET testing stack |

**Project layout:**

```
backend/CelebrityIQ.API/
├── Controllers/
│   ├── CelebritiesController.cs       # CRUD: /api/celebrities
│   ├── DailyChallengeController.cs    # Game: /api/dailychallenge
│   └── AuthController.cs             # JWT: /api/auth/token
├── Models/
│   ├── Celebrity.cs
│   ├── DailyChallenge.cs
│   └── GuessRequest.cs / GuessResponse.cs
├── Services/
│   ├── CelebrityService.cs
│   ├── DailyChallengeService.cs
│   └── AuthService.cs
├── Settings/
│   └── MongoDbSettings.cs
├── Middleware/
│   └── ErrorHandlingMiddleware.cs
└── Program.cs
```

### 7.3 Database

**MongoDB Collections:**

| Collection | Purpose |
|---|---|
| `celebrities` | All celebrity records |
| `daily_challenges` | Date → celebrity mapping |
| `admin_users` | Admin credentials (hashed passwords) |

**Indexes:**

| Collection | Index | Type |
|---|---|---|
| `celebrities` | `name` (text index) | Text (for search) |
| `daily_challenges` | `challengeDate` | Unique ascending |

### 7.4 Integration Layer

```
[React Native App]
      │  HTTPS REST JSON
      ▼
[ASP.NET Core API]  ──→  [MongoDB Atlas / Local]
      │
      └──→  [JWT Auth Middleware]
```

---

## 8. Data Models

### 8.1 Celebrity

```typescript
// Frontend TypeScript
interface Celebrity {
  id: string;                  // MongoDB ObjectId as string
  name: string;                // Full display name
  dateOfBirth: string;         // ISO 8601 date string (e.g. "1990-06-15")
  nationality: string;         // e.g. "American", "British"
  fieldOfExpertise: string;    // e.g. "Acting", "Music", "Sports"
  imageUrl: string;            // Publicly accessible image URL
  createdAt: string;           // ISO 8601 timestamp
  updatedAt: string;           // ISO 8601 timestamp
}
```

```csharp
// Backend C# Model
public class Celebrity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("dateOfBirth")]
    public DateTime DateOfBirth { get; set; }

    [BsonElement("nationality")]
    public string Nationality { get; set; } = null!;

    [BsonElement("fieldOfExpertise")]
    public string FieldOfExpertise { get; set; } = null!;

    [BsonElement("imageUrl")]
    public string ImageUrl { get; set; } = null!;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

### 8.2 DailyChallenge

```csharp
public class DailyChallenge
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("challengeDate")]
    public DateTime ChallengeDate { get; set; }   // Stored as UTC midnight

    [BsonElement("celebrityId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CelebrityId { get; set; } = null!;

    [BsonElement("initialTileIndex")]
    public int InitialTileIndex { get; set; }
}
```

### 8.3 Request / Response DTOs

```csharp
// POST /api/dailychallenge/guess
public record GuessRequest(string CelebrityId, string Guess, int TilesRevealed);

public record GuessResponse(
    bool IsCorrect,
    int PointsEarned,       // 0 if incorrect
    int TilesRevealed,      // updated count
    bool GameOver,
    Celebrity? CelebrityInfo // populated on correct guess or game over
);

// GET /api/dailychallenge
public record DailyChallengeResponse(
    string CelebrityId,
    string ImageUrl,
    int InitialTileIndex,
    string ChallengeDate     // ISO 8601 date
);
```

---

## 9. API Specification

### Base URL

`https://api.celebrityiq.app/api` (production)
`http://localhost:5000/api` (development)

### Authentication

Admin endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/token`.

---

### 9.1 Auth Endpoints

#### POST `/api/auth/token`

**Request:**
```json
{ "username": "admin", "password": "secret" }
```

**Response 200:**
```json
{ "token": "<jwt>", "expiresAt": "2026-02-28T00:00:00Z" }
```

**Response 401:**
```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "Username or password incorrect" } }
```

---

### 9.2 Celebrity Endpoints (Admin — JWT required)

#### GET `/api/celebrities`

**Query Params:** `page` (int, default 1), `pageSize` (int, default 20), `search` (string, optional)

**Response 200:**
```json
{
  "data": [ { /* Celebrity */ } ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 150
}
```

#### GET `/api/celebrities/{id}`

**Response 200:** `Celebrity` object
**Response 404:** `{ "error": { "code": "NOT_FOUND", "message": "Celebrity not found" } }`

#### POST `/api/celebrities`

**Request body:** `Celebrity` (without `id`, `createdAt`, `updatedAt`)
**Response 201:** Created `Celebrity` with `Location` header

#### PUT `/api/celebrities/{id}`

**Request body:** Full `Celebrity` object
**Response 200:** Updated `Celebrity`
**Response 404:** Not found error

#### DELETE `/api/celebrities/{id}`

**Response 204:** No content
**Response 404:** Not found error
**Response 409:** `{ "error": { "code": "CONFLICT", "message": "Celebrity is scheduled for a future challenge" } }`

---

### 9.3 Daily Challenge Endpoints (Public)

#### GET `/api/dailychallenge`

Returns today's challenge.

**Response 200:**
```json
{
  "celebrityId": "64abc123...",
  "imageUrl": "https://cdn.example.com/celebrities/tom-hanks.jpg",
  "initialTileIndex": 3,
  "challengeDate": "2026-02-27"
}
```

**Response 404:** No challenge scheduled for today.

#### POST `/api/dailychallenge/guess`

**Request:**
```json
{
  "celebrityId": "64abc123...",
  "guess": "Tom Hanks",
  "tilesRevealed": 2
}
```

**Response 200 (correct):**
```json
{
  "isCorrect": true,
  "pointsEarned": 4,
  "tilesRevealed": 2,
  "gameOver": true,
  "celebrityInfo": {
    "name": "Tom Hanks",
    "dateOfBirth": "1956-07-09",
    "nationality": "American",
    "fieldOfExpertise": "Acting"
  }
}
```

**Response 200 (incorrect):**
```json
{
  "isCorrect": false,
  "pointsEarned": 0,
  "tilesRevealed": 3,
  "gameOver": false,
  "celebrityInfo": null
}
```

**Response 200 (game over — 6 tiles revealed):**
```json
{
  "isCorrect": false,
  "pointsEarned": 0,
  "tilesRevealed": 6,
  "gameOver": true,
  "celebrityInfo": { /* full celebrity data */ }
}
```

---

## 10. UI/UX Requirements

### 10.1 Layout

- **Mobile (< 768 px):** Single-column layout. Tile grid takes full width. Score display above, input below.
- **Tablet / Desktop (≥ 768 px):** Centred card layout, max-width 640 px, with padding.
- **Bottom navigation tabs** visible on all breakpoints.

### 10.2 Tile Grid

- Grid: 3 columns × 2 rows, equal-sized tiles.
- Each tile is a clipped portion of the celebrity image (use `overflow: hidden` + `Image` positioned).
- Covered tiles: solid background colour using the app's primary palette.
- **Reveal animation:** tiles flip or fade in over 300–500 ms when uncovered.
- Image loads with a placeholder shimmer until the network response arrives.

### 10.3 Guess Input

- Placeholder text: "Who is this celebrity?"
- Autocomplete dropdown shows up to 5 matching names.
- Submit button labelled "Guess" — disabled when input is empty.
- On mobile, the keyboard should not obscure the tile grid (use `KeyboardAvoidingView`).

### 10.4 Score Display

- Shows: "Points available: X" prominently.
- Shows: "Tiles revealed: Y / 6".
- Updates immediately after each guess.

### 10.5 Result Card

- Displayed in a modal/bottom sheet after game end.
- Celebrity name in large, bold font.
- Date of birth, nationality, and field of expertise listed below.
- Score earned displayed with a celebratory style (win) or muted style (loss).
- Share button and "Come back tomorrow" message.

### 10.6 Colour & Theming

| State | Suggested Visual |
|---|---|
| Correct guess | Green accent (#4CAF50) |
| Incorrect guess | Red/orange accent (#F44336) |
| Covered tile | Dark grey (#424242) |
| Revealed tile | Shows image content |
| Score | Amber/gold (#FFC107) |

- Support both **light** and **dark** system themes (via React Native `useColorScheme`).

### 10.7 Typography

- Display font for score/celebrity name: bold, ≥ 24 sp.
- Body font: system default; readable at 14–16 sp.
- Minimum touch target size: 44 × 44 dp (Apple HIG / Material guidelines).

---

## 11. Admin Panel Requirements

### 11.1 Access Control

- Admin section is behind a **login screen**.
- JWT stored securely (Keychain on iOS, Keystore on Android, sessionStorage on web).
- Session expires after 8 hours; auto-redirect to login.

### 11.2 Celebrity List Screen

- Paginated list, 20 items per page.
- Each row: thumbnail (50 × 50), name, field of expertise, Edit and Delete action buttons.
- Floating "Add Celebrity" button (bottom-right FAB).
- Search bar (debounced 300 ms) at the top.

### 11.3 Celebrity Edit/Create Screen

| Field | Input Type | Validation |
|---|---|---|
| Name | Text | Required; max 120 chars |
| Date of Birth | Date picker | Required; cannot be future date |
| Nationality | Text / dropdown | Required; max 80 chars |
| Field of Expertise | Text / dropdown | Required; max 80 chars |
| Image URL | Text | Required; must be a valid URL; live preview shown |

- "Save" and "Cancel" buttons in the header.
- Unsaved changes prompt a discard confirmation.

### 11.4 Schedule Challenge Screen

- Calendar view showing scheduled and unscheduled future dates.
- Admin selects a date → picks a celebrity from a searchable list → confirms scheduling.
- Scheduled dates shown in green; today in blue; past dates greyed out.

---

## 12. Testing Requirements

### 12.1 Frontend Unit Tests

Framework: **Jest** + **React Native Testing Library**

| Test File | Scenarios to Cover |
|---|---|
| `TileGrid.test.tsx` | Renders 6 tiles; correct tile(s) revealed; covered tiles show placeholder; reveal animation triggered on prop change |
| `GuessInput.test.tsx` | Renders input; submit disabled when empty; autocomplete list renders on input; submit triggers callback with correct value |
| `ScoreDisplay.test.tsx` | Renders correct points value; updates on re-render; correct tiles-revealed count |
| `ResultCard.test.tsx` | Renders celebrity info fields; shows win message on correct; shows loss message on incorrect |
| `GameScreen.test.tsx` | Loads challenge on mount; displays spinner while fetching; handles API error state; correct guess updates score and shows result; incorrect guess reveals new tile; game-over state renders correctly |
| `AdminListScreen.test.tsx` | Renders list of celebrities; search filters results; delete button triggers confirmation; edit navigates to edit screen |
| `AdminEditScreen.test.tsx` | Create mode: empty form, submit calls POST; edit mode: pre-populated form, submit calls PUT; validation errors shown on invalid input |
| `api.test.ts` | `getDailyChallenge()` calls correct endpoint; `submitGuess()` sends correct body; error responses throw typed errors |
| `GameContext.test.tsx` | Initial state correct; `GUESS_CORRECT` action updates score and sets gameOver; `GUESS_INCORRECT` action reveals next tile; `LOAD_CHALLENGE` action sets challenge data |

### 12.2 Backend Unit Tests

Framework: **xUnit** + **Moq**

| Test Class | Scenarios to Cover |
|---|---|
| `CelebrityServiceTests` | `GetAllAsync` returns paged list; `GetByIdAsync` returns celebrity; `GetByIdAsync` returns null for unknown id; `CreateAsync` inserts and returns celebrity; `UpdateAsync` calls replace; `DeleteAsync` calls delete |
| `DailyChallengeServiceTests` | `GetTodaysChallengeAsync` returns correct challenge for today's date; returns null when no challenge scheduled; `SubmitGuessAsync` returns `isCorrect=true` on matching name (case-insensitive); returns `isCorrect=false` on non-matching name; `pointsEarned` decrements correctly per `tilesRevealed`; game-over returned when `tilesRevealed=6` |
| `AuthServiceTests` | Valid credentials return JWT; invalid credentials throw `UnauthorizedException`; token contains correct claims |
| `GuessValidationTests` | Trims whitespace before comparison; handles empty guess string; handles special characters |
| `TileSelectionTests` | `initialTileIndex` is deterministic for a given date; values always 0–5 |

### 12.3 Functional / Integration Tests

Framework: **xUnit** + **WebApplicationFactory** (in-memory test server) + **Mongo2Go** (embedded MongoDB)

| Test Class | Scenarios to Cover |
|---|---|
| `CelebritiesControllerIntegrationTests` | `GET /api/celebrities` returns 200 with list; `POST /api/celebrities` without auth returns 401; `POST /api/celebrities` with auth returns 201; `PUT` updates record; `DELETE` removes record; `DELETE` returns 409 when celebrity has future challenge |
| `DailyChallengeControllerIntegrationTests` | `GET /api/dailychallenge` returns 200 with valid challenge data; returns 404 when no challenge; `POST /api/dailychallenge/guess` correct guess returns isCorrect=true and pointsEarned; incorrect guess returns isCorrect=false; guess after 6 tiles returns gameOver=true |
| `AuthControllerIntegrationTests` | Valid credentials return 200 with token; invalid credentials return 401 |

### 12.4 End-to-End Tests

Framework: **Detox** (mobile) or **Playwright** (web)

| Test Scenario | Steps |
|---|---|
| Full game — win on round 1 | Launch app → see 1 tile → type correct celebrity name → submit → verify 5 points and result card |
| Full game — win on round 3 | Launch → wrong guess × 2 → correct guess → verify 3 points |
| Full game — loss | Launch → wrong guess × 5 → verify all tiles revealed, 0 points, result card |
| Admin CRUD flow | Log in as admin → add celebrity → verify in list → edit → verify update → delete → verify removed |
| Schedule challenge | Log in → navigate to schedule → select future date → assign celebrity → verify calendar shows entry |
| Cross-platform | Run game screen E2E on iOS simulator, Android emulator, and Chrome browser — verify identical tile reveal behaviour |

### 12.5 Coverage Targets

| Layer | Minimum Coverage |
|---|---|
| Frontend (unit) | 80% statements, 75% branches |
| Backend (unit) | 85% statements, 80% branches |
| Integration | All API endpoints covered by at least one integration test |
| E2E | Happy path + one failure path per major user flow |

---

## 13. Security Requirements

| ID | Requirement |
|---|---|
| SEC-01 | All production traffic served over HTTPS/TLS 1.2+ |
| SEC-02 | Admin API routes protected with JWT authentication; tokens signed with HS256 minimum |
| SEC-03 | JWT tokens expire after 8 hours; no refresh token endpoint in v1 |
| SEC-04 | Passwords stored as bcrypt hashes (cost factor ≥ 12) |
| SEC-05 | MongoDB connection string stored as environment variable; never committed |
| SEC-06 | API responses do not expose stack traces or internal MongoDB error details |
| SEC-07 | Celebrity image URLs validated on the backend (must be a valid URL format) |
| SEC-08 | Input sanitised and validated server-side (name max length, date range, URL format) |
| SEC-09 | CORS configured to allow only known frontend origins in production |
| SEC-10 | Rate limiting applied to the guess endpoint (max 60 requests/min per IP) |
| SEC-11 | Dependency vulnerability scanning in CI pipeline (OWASP Dependency-Check / npm audit) |

---

## 14. Performance Requirements

| Scenario | Target |
|---|---|
| `GET /api/dailychallenge` cold response | < 200 ms |
| `POST /api/dailychallenge/guess` | < 150 ms |
| `GET /api/celebrities` (20 items) | < 300 ms |
| App initial load (web, cable) | Time to interactive < 3 s |
| App initial load (mobile, 4G) | Time to interactive < 4 s |
| Celebrity image load | Progressive / lazy load with shimmer; full load < 2 s on 4G |
| Tile reveal animation | 60 fps, no jank |

---

## 15. Deployment & Environment Requirements

### 15.1 Environments

| Environment | Purpose |
|---|---|
| Development | Local developer machines; `localhost:5000` API, local MongoDB |
| Staging | Mirrors production; used for QA and integration testing |
| Production | Live user-facing environment |

### 15.2 Backend Hosting

- Containerised via **Docker** (Dockerfile included in backend).
- Deployable to any container platform (Azure App Service, AWS ECS, DigitalOcean App Platform).
- Health check endpoint: `GET /health` returns 200.

### 15.3 Database

- **Development/Staging:** Local MongoDB or MongoDB Atlas free tier.
- **Production:** MongoDB Atlas (M10 or higher for production workloads).
- Automated daily backups enabled.

### 15.4 Frontend Hosting

- **Web:** Expo export (`npx expo export --platform web`) deployed as a static site (Vercel, Netlify, or Azure Static Web Apps).
- **iOS:** Distributed via Apple App Store (Expo EAS Build).
- **Android:** Distributed via Google Play Store (Expo EAS Build).

### 15.5 Environment Variables

| Variable | Description |
|---|---|
| `MongoDbSettings__ConnectionString` | MongoDB connection URI |
| `MongoDbSettings__DatabaseName` | Target database name |
| `Jwt__SecretKey` | JWT signing secret (min 32 characters) |
| `Jwt__Issuer` | Token issuer string |
| `Jwt__Audience` | Token audience string |
| `EXPO_PUBLIC_API_URL` | Frontend API base URL |

### 15.6 CI/CD

- **Trigger:** Push to `main` branch or PR to `main`.
- **Pipeline steps:**
  1. Restore dependencies (npm + dotnet)
  2. Build frontend (TypeScript compile, Expo export)
  3. Build backend (`dotnet build`)
  4. Run all unit and integration tests
  5. Publish code coverage report
  6. Run security scanning
  7. Deploy to staging (on `main` push)
  8. Smoke test staging
  9. Deploy to production (manual approval gate)

---

## 16. Accessibility Requirements

| Requirement | Detail |
|---|---|
| WCAG 2.1 AA | All web UI must comply |
| Colour contrast | Text/background contrast ratio ≥ 4.5:1 |
| Screen reader | Covered tiles have `aria-label="Covered tile X"` on web; `accessibilityLabel` on native |
| Keyboard navigation | All interactive elements focusable and operable via keyboard on web |
| Touch targets | Minimum 44 × 44 dp for all interactive elements |
| Dynamic text | UI must remain usable at system text size 200% |
| Focus management | After submitting a guess, focus moves to the input field automatically |

---

## 17. Success Metrics & KPIs

| Metric | Target (Month 3) |
|---|---|
| Daily Active Users (DAU) | 1,000 |
| Day-7 Retention Rate | ≥ 30% |
| Average Session Duration | 3–6 minutes |
| Daily Challenge Completion Rate | ≥ 70% of sessions result in game completion |
| Crash-Free Session Rate | ≥ 99.5% |
| API Error Rate (5xx) | < 0.1% |
| Share Feature Usage | ≥ 20% of completions use share |
| App Store Rating | ≥ 4.0 stars |

---

## 18. Out of Scope

The following features are explicitly **out of scope** for v1:

- User accounts, login, or profile pages (players remain anonymous).
- Leaderboards or social features.
- Push notifications.
- Localization / multi-language support.
- Hint system beyond tile reveals.
- Celebrity categories or filtered game modes.
- In-app purchases or monetization.
- Analytics SDK integration (beyond basic usage metrics).
- Offline-first architecture (only graceful degradation).

---

## 19. Open Questions & Dependencies

| # | Question | Owner | Target Resolution |
|---|---|---|---|
| OQ-01 | What is the source for celebrity images? Must they be licensed/owned? | Product | Before backend build |
| OQ-02 | Should the guess endpoint accept close variants (e.g., "Tom" matching "Tom Hanks")? | Product | Before game logic implementation |
| OQ-03 | Is the Admin Panel accessible to all staff or a restricted set? How are admin accounts created? | Product + Engineering | Before auth implementation |
| OQ-04 | Should celebrity records be soft-deleted or hard-deleted? | Engineering | Before service layer implementation |
| OQ-05 | Do we need analytics or logging beyond server logs? (e.g., Mixpanel, Amplitude) | Product | Before CI/CD setup |
| OQ-06 | What CDN strategy is used for celebrity images? Does the backend proxy them or serve raw URLs? | Engineering | Before frontend image loading implementation |
| OQ-07 | Time zone policy: Is the daily reset at UTC midnight or a configurable time? | Engineering | Before daily challenge scheduling implementation |
| OQ-08 | Detox (mobile E2E) vs Playwright (web E2E) — which is priority for v1? | QA | Before E2E test sprint |

---

## 20. Glossary

| Term | Definition |
|---|---|
| Daily Challenge | The single celebrity puzzle available for a given UTC calendar day |
| Tile | One of the six equal rectangular sections covering the celebrity photograph |
| Tile Reveal | Removing the cover from a tile so the underlying image section is visible |
| Round | One attempt by the player consisting of a single guess submission |
| Points Available | The score a player would earn for a correct guess at the current round |
| Game Over | The state when either a correct guess is made or all 6 tiles are revealed |
| Admin Panel | The protected section of the app used to manage celebrity data and scheduling |
| JWT | JSON Web Token — used for authenticating admin API requests |
| Expo | A framework and toolchain built on React Native for building cross-platform apps |
| EAS | Expo Application Services — cloud service for building and submitting native apps |
| CRUD | Create, Read, Update, Delete — standard data operations |
| DTO | Data Transfer Object — lightweight object used for API request/response shapes |

---

*Document maintained by the CelebrityIQ engineering team. Changes to requirements must be reviewed by Product and Engineering leads before implementation begins.*
