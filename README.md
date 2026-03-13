# 🌾 AgriCore — Authentication & Authorization System

A production-ready, full-stack authentication and authorization platform built with **Next.js (App Router)**, **PostgreSQL (Prisma ORM)**, **JWT (HttpOnly cookies)**, **bcrypt**, **Google OAuth 2.0**, and **Role-Based Access Control (RBAC)** — deployed as a **single Next.js app** where the API lives under `app/api`.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [Google OAuth Setup](#google-oauth-setup)
- [Frontend Route Protection](#frontend-route-protection)
- [Security Features](#security-features)

---

## Architecture Overview

```
┌─────────────────────┐       HTTPS / Cookie       ┌──────────────────────────┐
│     Next.js App     │ ◄──────────────────────────► │   Route Handlers (API)   │
│   (App Router)      │                              │   under /api/*           │
│   Port 3000         │                              │                          │
│                     │   JWT in HttpOnly Cookie     │   ┌──────────────────┐   │
│  ┌───────────────┐  │ ◄─── Set on Login ──────────► │   │  PostgreSQL DB   │   │
│  │  middleware.ts│  │                              │   │  (via Prisma)    │   │
│  │  JWT verify   │  │                              │   └──────────────────┘   │
│  │  (Edge RT)    │  │                              │                          │
│  └───────────────┘  │                              │   ┌──────────────────┐   │
│                     │      Google OAuth 2.0        │   │  Passport.js     │   │
│  ┌───────────────┐  │ ─── Redirect ──────────────► │   │  Google Strategy │   │
│  │  AuthContext  │  │ ◄── redirect + cookie ─────  │   └──────────────────┘   │
│  │  (React)      │  │                              │                          │
│  └───────────────┘  │                              └──────────────────────────┘
└─────────────────────┘
```

---

## Tech Stack

| Layer       | Technology                                                            |
|-------------|-----------------------------------------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript, Tailwind CSS, react-hook-form, Zod, jose |
| Backend     | Next.js Route Handlers (`app/api`), TypeScript                         |
| Database    | PostgreSQL with Prisma ORM                                            |
| Auth        | JWT (HttpOnly cookies), bcryptjs (12 rounds), Google OAuth 2.0        |
| Validation  | Zod (frontend + API routes)                                           |
| Security    | Next.js middleware route protection                                   |

---

## Database Schema

```sql
-- Roles table
CREATE TABLE roles (
  id        SERIAL PRIMARY KEY,
  role_name VARCHAR UNIQUE NOT NULL   -- 'Admin' | 'Customer'
);

-- Users table
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR       NOT NULL,
  email      VARCHAR UNIQUE NOT NULL,
  password   VARCHAR,                  -- nullable for OAuth-only accounts
  google_id  VARCHAR UNIQUE,           -- Google OAuth sub-ID
  avatar     VARCHAR,
  role_id    INTEGER REFERENCES roles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Default Seeded Accounts

| Role     | Email                    | Password         |
|----------|--------------------------|------------------|
| Admin    | admin@agricore.com       | Admin@123456     |
| Customer | customer@agricore.com    | Customer@123456  |

---

## Project Structure

```
Agricore/
├── app/
│   ├── (auth)/                    # Public auth pages group
│   │   ├── layout.tsx             # Centered card layout
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (protected)/               # Authenticated pages group
│   │   ├── layout.tsx             # Sidebar + Navbar shell
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   └── admin/page.tsx         # Admin-only
│   ├── api/                       # Backend API (Route Handlers)
│   ├── globals.css
│   ├── layout.tsx                 # Root layout with AuthProvider
│   └── page.tsx                   # Landing page
├── components/
│   ├── forms/                     # LoginForm, SignupForm
│   ├── layout/                    # Navbar, Sidebar
│   └── ui/                        # Button, Input
├── contexts/AuthContext.tsx       # Global auth state + hooks
├── hooks/useAuth.ts               # Re-export
├── lib/
│   ├── api.ts                     # Axios instance with credentials (baseURL=/api)
│   ├── prisma.ts                  # Prisma client singleton (adapter-pg)
│   ├── auth-jwt.ts                # jose sign/verify
│   ├── auth-server.ts             # cookie auth helpers
│   └── validators.ts              # Zod schemas
├── middleware.ts                  # Next.js Edge middleware (JWT verify + RBAC)
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Initial data (roles + users)
├── prisma.config.ts               # Prisma v7 config (datasource + migrations)
├── types/index.ts
├── .env.local.example
├── postman/
│   └── AgriCore.postman_collection.json
└── README.md
```

---

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

| Variable               | Description |
|------------------------|-------------|
| `DATABASE_URL`         | Neon/Postgres connection string |
| `JWT_SECRET`           | Min 32 chars — keep secret |
| `JWT_EXPIRES_IN`       | Token TTL e.g. `7d` (optional) |
| `GOOGLE_CLIENT_ID`     | From Google Cloud Console (optional) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console (optional) |
| `GOOGLE_CALLBACK_URL`  | `http://localhost:3000/api/auth/google/callback` (local) |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm or yarn

### 1. Clone & Install

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local — set DATABASE_URL, JWT_SECRET, and optional Google OAuth keys
```

### 3. Set Up the Database

```bash
# Create the database schema
npm run db:push          # or: npm run db:migrate

# Seed roles and default users
npm run db:seed
```

### 4. Run the Applications

```bash
npm run dev
# App running at http://localhost:3000
```

### 5. Test the Setup

| URL                              | Description              |
|----------------------------------|--------------------------|
| `http://localhost:3000`          | Landing page             |
| `http://localhost:3000/login`    | Login page               |
| `http://localhost:3000/signup`   | Signup page              |
| `http://localhost:3000/dashboard`| Customer dashboard       |
| `http://localhost:3000/admin`    | Admin panel              |

---

## API Documentation

### Base URL
`/api` (same-origin)

All protected endpoints require the `agricore_token` HttpOnly cookie (set automatically on login).

---

### Authentication Endpoints

#### `POST /auth/register`
Register a new Customer account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": { "id": 3, "name": "John Doe", "email": "john@example.com", "role": "Customer" }
  }
}
```

---

#### `POST /auth/login`
Login with email and password.

**Request Body:**
```json
{ "email": "admin@agricore.com", "password": "Admin@123456" }
```

**Response `200`:** Sets `agricore_token` HttpOnly cookie + returns user object.

---

#### `POST /auth/logout`
Clear the authentication cookie.

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully." }
```

---

#### `GET /auth/me` 🔒
Get the current authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "data": { "user": { "id": 1, "name": "AgriCore Admin", "role": "Admin", ... } }
}
```

---

#### `GET /auth/google`
Initiate Google OAuth (open in browser).

#### `GET /auth/google/callback`
Google OAuth callback (handled automatically by Passport).

---

### User Endpoints (🔒 requires auth)

| Method | Endpoint          | Description           |
|--------|-------------------|-----------------------|
| GET    | `/users/profile`  | Get own profile       |
| PUT    | `/users/profile`  | Update name / email   |

---

### Admin Endpoints (🔒🛡️ requires Admin role)

| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| GET    | `/admin/users`       | List all users           |
| GET    | `/admin/users/:id`   | Get user by ID           |
| DELETE | `/admin/users/:id`   | Delete user              |

---

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" }
  ]
}
```

| Status | Meaning                                    |
|--------|--------------------------------------------|
| 400    | Validation failed                          |
| 401    | Not authenticated / expired token          |
| 403    | Authenticated but insufficient role        |
| 404    | Resource not found                         |
| 409    | Conflict (duplicate email)                 |
| 429    | Rate limit exceeded                        |
| 500    | Internal server error                      |

---

## Authentication Flow

### Email/Password Login

```
Browser          Frontend          Backend           Database
  │                  │                 │                 │
  │──── POST /login ─►────────────────►│                 │
  │                  │                 │── findUser ────►│
  │                  │                 │◄── user data ───│
  │                  │                 │                 │
  │                  │                 │ bcrypt.compare  │
  │                  │                 │ jwt.sign()      │
  │                  │                 │                 │
  │◄─ Set-Cookie: agricore_token (HttpOnly) ────────────│
  │◄─────── 200 + user object ──────────────────────────│
  │                  │                 │                 │
  │── GET /dashboard ►                 │                 │
  │   (middleware.ts verifies cookie)  │                 │
  │◄── 200 Dashboard ─────────────────│                 │
```

### Google OAuth Flow

```
Browser              Backend                 Google
  │                     │                      │
  │── GET /auth/google ─►                       │
  │◄── 302 Redirect ────►── GET accounts.google.com/o/oauth2/v2/auth ──►│
  │                     │                      │── Login prompt
  │◄──────────── 302 callback ───────────────────────────────────────────│
  │                     │◄─ authorization code ─│
  │                     │── Exchange for tokens ►│
  │                     │◄─ profile data ────────│
  │                     │                        │
  │                     │ Find/create user in DB  │
  │                     │ jwt.sign()              │
  │◄─ Set-Cookie + redirect to /dashboard ────────│
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized redirect URI: `http://localhost:3000/api/auth/google/callback` (local) and `https://<your-domain>/api/auth/google/callback` (Vercel)
7. Copy **Client ID** and **Client Secret** to `.env.local`

---

## Frontend Route Protection

### Next.js Middleware (`frontend/middleware.ts`)

The middleware runs on the **Edge Runtime** before each request:

1. Reads `agricore_token` from cookies
2. Verifies signature with `jose` (Edge-compatible JWT library)
3. Checks `roleName` for admin-only routes
4. Redirects unauthenticated users to `/login?redirect=<path>`
5. Redirects already-authenticated users away from login/signup

```
Request → middleware.ts → Route Handler (or redirect)
              │
              ├── /dashboard, /profile, /admin
              │     └── No token? → /login
              │     └── Invalid token? → /login
              │     └── /admin + not Admin? → /dashboard
              │     └── Valid → Next()
              │
              └── /login, /signup
                    └── Valid token present? → /dashboard
                    └── No/invalid token? → Next()
```

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcryptjs with 12 salt rounds |
| JWT storage | HttpOnly cookie (immune to XSS) |
| JWT expiry | 7-day TTL with server-side invalidation on logout |
| CORS | Restricted to frontend origin (`FRONTEND_URL`) |
| Rate limiting | 15 requests / 15 min on auth endpoints |
| Security headers | Helmet.js (X-Frame-Options, CSP, HSTS, etc.) |
| Input validation | Joi (backend) + Zod (frontend) |
| Role enforcement | Both middleware (backend) and Next.js middleware (frontend) |
| SQL injection | Prevented by Prisma parameterised queries |
| User enumeration | Generic "Invalid email or password" on failed login |

---

## Postman Collection

Import `postman/AgriCore.postman_collection.json` into Postman.

The collection contains:
- **Health** — server health check
- **Authentication** — register, login (admin + customer), logout, /me, Google OAuth
- **User** — get/update profile
- **Admin** — list users, get by ID, delete
- **Error Cases** — 400, 401, 403, 409 scenarios

> **Tip:** Enable "Send cookies" in Postman settings. After logging in, the `agricore_token` cookie is stored automatically and sent on subsequent requests.
