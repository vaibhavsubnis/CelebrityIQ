# Celebrity IQ

A daily celebrity guessing game. Each day a new celebrity photo is revealed one tile at a time — guess early for more points!

## How It Works

1. A celebrity image is divided into **6 tiles**, with only one revealed initially
2. Guess the celebrity correctly to earn **5 points**
3. Wrong guess? Another tile is revealed, but the available points drop by 1
4. Keep guessing until you get it right, or all tiles are revealed (0 points)

| Tiles Revealed | Points Available |
|:-:|:-:|
| 1 | 5 |
| 2 | 4 |
| 3 | 3 |
| 4 | 2 |
| 5 | 1 |
| 6 | 0 (game over) |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native (Expo) — iOS, Android, Web |
| Backend | C# / ASP.NET Core 8 Web API |
| Database | MongoDB |
| API Docs | Swagger / OpenAPI |

## Project Structure

```
CelebrityIQ/
├── backend/
│   └── CelebrityIQ.API/        # ASP.NET Core Web API
│       ├── Controllers/         # API endpoints
│       ├── Models/              # Data models
│       ├── Services/            # Business logic + MongoDB access
│       └── Settings/            # Configuration classes
├── frontend/
│   ├── App.tsx                  # Entry point
│   └── src/
│       ├── components/          # TileGrid, GuessInput, ScoreDisplay
│       ├── navigation/          # Tab + stack navigation
│       ├── screens/             # GameScreen, AdminListScreen, AdminEditScreen
│       ├── services/            # API client
│       └── types/               # TypeScript interfaces
├── CLAUDE.md                    # AI assistant guidance
└── README.md
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) (running on `localhost:27017`)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)

## Getting Started

### 1. Start MongoDB

Make sure MongoDB is running locally on port 27017 (default).

### 2. Run the Backend

```bash
cd backend/CelebrityIQ.API
dotnet restore
dotnet run
```

The API starts at `http://localhost:5000` with Swagger UI at `http://localhost:5000/swagger`.

### 3. Run the Frontend

```bash
cd frontend
npm install
npx expo start
```

Then press:
- `w` for web browser
- `i` for iOS simulator
- `a` for Android emulator

## API Endpoints

### Celebrities (Admin CRUD)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/celebrities` | List all celebrities |
| GET | `/api/celebrities/{id}` | Get celebrity by ID |
| POST | `/api/celebrities` | Create a celebrity |
| PUT | `/api/celebrities/{id}` | Update a celebrity |
| DELETE | `/api/celebrities/{id}` | Delete a celebrity |

### Daily Challenge (Game)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dailychallenge` | Get today's challenge |
| POST | `/api/dailychallenge/guess` | Submit a guess |

### Celebrity Data Model

```json
{
  "name": "Tom Hanks",
  "dateOfBirth": "1956-07-09T00:00:00Z",
  "nationality": "American",
  "fieldOfExpertise": "Acting",
  "imageUrl": "https://example.com/tom-hanks.jpg"
}
```

## Admin Panel

The app includes built-in admin pages accessible via the **Admin** tab. From there you can:

- View all celebrities
- Add new celebrities (name, date of birth, nationality, field of expertise, image URL)
- Edit existing celebrity records
- Delete celebrities

## Development

### Backend

```bash
cd backend/CelebrityIQ.API
dotnet watch run    # Hot-reload during development
```

### Frontend

```bash
cd frontend
npx expo start      # Starts Expo dev server with hot-reload
```
