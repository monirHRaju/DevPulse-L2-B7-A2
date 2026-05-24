# DevPulse
## Live : https://devpulse-issue-tracker.onrender.com
## GitHub: https://github.com/monirHRaju/DevPulse-L2-B7-A2.git
Internal Tech Issue & Feature Tracker — a small Node.js / TypeScript / Express backend backed by PostgreSQL. Users can register, log in, report bugs or feature requests, and (if they are maintainers) move issues through a simple workflow.

## Tech Stack

- **Node.js** (LTS 24.x+)
- **TypeScript** (strict mode, ESM)
- **Express.js** v5
- **PostgreSQL** via the native `pg` driver (raw SQL only — no ORM, no query builder, no JOINs)
- **bcrypt** for password hashing
- **jsonwebtoken** for auth tokens
- **express-validator** for request validation
- **http-status-codes** for consistent status codes

## Project Structure

```
src/
  app.ts                     # Express app factory
  server.ts                  # Boots the app
  config/
    index.ts                 # Loads + validates environment variables
  database/
    index.ts                 # pg Pool singleton
    schema.ts                # SQL schema + applySchema() (runnable)
    seed.ts                  # Sample users + issues (runnable)
  middleware/
    auth.ts                  # authenticate + authorize
    globalErrorHandler.ts    # notFoundHandler + globalErrorHandler
    logger.ts                # request logger
  utility/
    AppError.ts              # Custom error class
    jwt.ts                   # signToken / verifyToken
    sendResponse.ts          # sendSuccess / sendError helpers
  types/
    index.ts                 # Shared TypeScript types
    express.d.ts             # Augments Express.Request with `user`
  api/
    controllers/
      auth.controller.ts
      issue.controller.ts
    services/
      auth.service.ts
      issue.service.ts
    routes/
      auth.routes.ts
      issue.routes.ts
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Postgres database**
   Use Neon, Supabase, or a local Postgres instance. Copy the connection string.

3. **Create `.env`** from the template:
   ```bash
   cp .env.example .env
   ```
   Then fill in real values:
   ```
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
   JWT_SECRET=some-long-random-string
   JWT_EXPIRES_IN=7d
   BCRYPT_ROUNDS=10
   ```
   `BCRYPT_ROUNDS` must be between 8 and 12 (per assignment spec).

4. **Run the schema migration**
   ```bash
   npm run migrate
   ```

5. **(Optional) Seed sample data**
   ```bash
   npm run seed
   ```

6. **Start the dev server**
   ```bash
   npm run dev
   ```
   Server listens on `http://localhost:3000`.

## Available Scripts

| Script           | What it does                              |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Start server with watch mode (tsx)        |
| `npm run build`  | Compile TypeScript to `dist/`             |
| `npm start`      | Run compiled output                       |
| `npm run migrate`| Apply database schema                     |
| `npm run seed`   | Insert sample users + issues              |

## API Endpoints

All requests/responses are JSON. Success and error envelopes are uniform:

```jsonc
// success
{ "success": true, "message": "...", "data": ... }

// error
{ "success": false, "message": "...", "errors": ... }
```

### Auth

| Method | Path                | Access   | Body                                  |
| ------ | ------------------- | -------- | ------------------------------------- |
| POST   | `/api/auth/signup`  | Public   | `{ name, email, password, role? }`    |
| POST   | `/api/auth/login`   | Public   | `{ email, password }`                 |

### Issues

| Method | Path               | Access                                  | Notes                                                            |
| ------ | ------------------ | --------------------------------------- | ---------------------------------------------------------------- |
| POST   | `/api/issues`      | Authenticated                           | `reporter_id` taken from the JWT, not the body                   |
| GET    | `/api/issues`      | Public                                  | Query params: `sort=newest\|oldest`, `type`, `status`            |
| GET    | `/api/issues/:id`  | Public                                  | Includes nested `reporter { id, name, role }`                    |
| PATCH  | `/api/issues/:id`  | Maintainer (any) / Contributor (own + status=open) | Update title / description / type                      |
| DELETE | `/api/issues/:id`  | Maintainer only                         | Permanent delete                                                 |

### Auth Header

Send the JWT exactly as returned, with no `Bearer ` prefix:

```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

## Sample Requests

```bash
# Register
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@devpulse.com","password":"secret123","role":"contributor"}'

# Login (capture token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@devpulse.com","password":"secret123"}'

# Create issue
curl -X POST http://localhost:3000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: <PASTE_TOKEN_HERE>" \
  -d '{"title":"Pool exhaustion","description":"Connections run out under load over 50 concurrent users.","type":"bug"}'

# List issues
curl "http://localhost:3000/api/issues?sort=newest&type=bug"
```

## Notes

- All SQL is parameterized via `pool.query(text, values)` — no string interpolation of user input.
- Reporter data on `GET /api/issues` is fetched in a **second query** (`WHERE id IN (...)`) per assignment rules.
- Passwords are never returned in any response.
