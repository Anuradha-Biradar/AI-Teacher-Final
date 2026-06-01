# AI Teacher

An AI-powered learning platform where users can enter any topic and instantly generate a complete course with lessons, modules, and interactive quizzes using Google Gemini AI. The platform also includes user authentication, allowing users to securely register, log in, and manage their learning experience.

# Features
- AI-generated courses using Google Gemini AI
- Dynamic syllabus generation
- Interactive lessons and quizzes
- Course management
- User Authentication
- User Registration
- User Login
- JWT-based Authentication
- Protected Routes
- Logout Functionality
- Responsive User Interface
- SQLite Database Integration

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | Express + Bun + Vercel AI SDK + Google Gemini |
| Database | SQLite (via `bun:sqlite`) |

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Bun](https://bun.sh/) v1.0+
- Google Generative AI API key — get one at [Google AI Studio](https://aistudio.google.com/apikey)

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd ai-teacher
```

### 2. Install dependencies

```bash
# Install both client and server dependencies
npm run install:all
```

Or install manually:

```bash
cd server && bun install
cd ../client && npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server/` directory:

```bash
cp server/.env.example server/.env
```

Then edit `server/.env` and add your API key:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
```

## Running the App

### Option A: Run both together (from project root)

```bash
npm run dev
```

This starts both the server (port 3001) and client (port 3001) concurrently.

### Option B: Run separately

Terminal 1 — Backend:
```bash
cd server
bun run dev
```

Terminal 2 — Frontend:
```bash
cd client
npm run dev
```

### Open the app

Go to [http://localhost:3001](http://localhost:3001)

## Project Structure

```
ai-teacher/
├── client/
│   ├── components/
│   │   ├── AuthPage.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Navbar.tsx
│   │   └── Icons.tsx
│   ├── store/
│   │   └── auth.ts
│   ├── services/
│   │   └── api.ts
│   ├── App.tsx
│   └── types.ts
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── course.ts
│   │   │   └── authentication.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   ├── utils/
│   │   │   └── jwt.ts
│   │   ├── db.ts
│   │   └── index.ts
│   └── package.json
│
├── README.md
├── package.json
└── package-lock.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get a single course with modules |
| POST | `/api/generate-syllabus` | Generate a new course syllabus |
| POST | `/api/stream-lesson` | Stream lesson content for a module |
| PUT | `/api/modules/:id/quiz-score` | Update quiz score and completion |
| DELETE | `/api/courses/:id` | Delete a course |

## Build for Production

```bash
# Build frontend
cd client
npm run build

# Start server
cd ../server
bun run src/index.ts
```

The built frontend is served from `client/dist/`. Configure your server or CDN to serve those static files.
