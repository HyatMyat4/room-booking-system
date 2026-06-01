# Room Booking System — Server

NestJS + Prisma + PostgreSQL backend for the Meeting Room Booking System assignment.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a hosted instance)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in your database URL
cp .env.example .env
# Edit DATABASE_URL in .env

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Seed the database with sample data
npx prisma db seed

# 5. Start the server (port 3000)
npm run start:dev
```

## Authentication

The API uses JWT Bearer token authentication.

1. **Login** via `POST /api/auth/login` with `{ "userId": <number>, "password": "<string>" }`
2. The response contains `accessToken` (15 min) and `refreshToken` (7 days).
3. Send the access token on every protected request:

```
Authorization: Bearer <accessToken>
```

4. **Refresh** a new access token via `POST /api/auth/refresh` with `{ "refreshToken": "<token>" }`.
5. **Logout** via `POST /api/auth/logout` (requires valid access token) — invalidates all tokens.

Only `GET /api/users` and auth endpoints are public (no token required).
All other endpoints require a valid `Authorization: Bearer` header.

## API Endpoints

### Users
| Method | Path | Role required | Description |
|--------|------|---------------|-------------|
| GET | /users | any | List all users |
| POST | /users | admin | Create user |
| DELETE | /users/:id | admin | Delete user (cascades bookings) |
| PATCH | /users/:id/role | admin | Change user role |

### Rooms
| Method | Path | Role required | Description |
|--------|------|---------------|-------------|
| GET | /rooms | any | List all rooms |
| POST | /rooms | admin | Create room |
| PUT | /rooms/:id | admin | Update room |
| DELETE | /rooms/:id | admin | Delete room (cascades bookings) |

### Bookings
| Method | Path | Role required | Description |
|--------|------|---------------|-------------|
| GET | /bookings | any | List all bookings |
| POST | /bookings | any | Create booking |
| DELETE | /bookings/:id | owner/admin/creator | Delete booking |

### Summary
| Method | Path | Role required | Description |
|--------|------|---------------|-------------|
| GET | /summary | owner, admin | Booking stats per user and room |

## Booking Rules

- `startTime` must be before `endTime` (ISO 8601 format, UTC)
- Bookings in the same room must not overlap
- Back-to-back bookings are **allowed** (e.g. 09:00–10:00 and 10:00–11:00)
- Overlap detection handles: identical ranges, partial overlaps, fully-contained ranges

## Cascade Behavior

- Deleting a **user** also deletes all their bookings
- Deleting a **room** also deletes all bookings for that room

## Seed Data

6 users (1 admin, 2 owners, 3 users), 8 rooms, 10 sample bookings.
