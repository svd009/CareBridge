# CareBridge

CareBridge is a secure care-coordination platform that helps healthcare staff access patient records according to their job responsibilities while improving protection, accountability, and operational reliability for sensitive patient information.

> Portfolio and educational project. CareBridge is designed with HIPAA-aligned technical safeguards, but it is not represented as a production HIPAA-compliant healthcare system.

## Problem

Healthcare teams need timely access to patient information, but unrestricted access can expose protected health information, increase the risk of unauthorized disclosure, and make it difficult to determine who accessed a record.

## Solution

CareBridge provides a role-aware patient-record workflow with secure authentication, server-side authorization, audit logging, encrypted clinical-note storage, validation, login rate limiting, and paginated APIs.

## Key Features

- JWT-based authentication with bcrypt password verification
- TOTP multi-factor authentication, if enabled in the local environment
- Role-based access control for Administrator, Physician, Nurse, and Billing Specialist roles
- AES-256-GCM field-level encryption for clinical notes
- Patient-record access audit logging
- Administrator-only audit-log dashboard
- Request validation with Zod
- Centralized Express error handling
- Helmet security headers
- Login rate limiting with HTTP 429 responses after repeated attempts
- Paginated patient and audit-log API responses
- PostgreSQL 16 running through Docker Compose
- Responsive React interface with a consistent purple-and-white design

## Architecture

```text
React frontend
      |
      | HTTP requests during local development
      v
Express.js API
      |
      | JWT validation, RBAC, input validation,
      | rate limiting, audit-event creation
      v
PostgreSQL 16 in Docker Compose
```

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, React Router, Axios, CSS |
| Backend | Node.js, Express.js, Zod |
| Authentication | JWT, bcryptjs, TOTP MFA |
| Authorization | Role-based access control |
| Security | Helmet, express-rate-limit, AES-256-GCM |
| Database | PostgreSQL 16 |
| Local infrastructure | Docker Compose |

## Local Setup

### Prerequisites

- Node.js
- Docker Desktop
- Docker Compose

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose up -d
```

Confirm that the database container is running:

```bash
docker compose ps
```

### 2. Configure backend environment variables

Create `backend/.env` with your local development values.

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME
JWT_SECRET=replace-with-a-long-random-development-secret
JWT_EXPIRES_IN=15m
```

If your implementation uses them, also configure the required encryption-key and TOTP-secret variables. Do not commit `.env` files.

### 3. Start the backend

```bash
cd backend
npm install
npm run dev
```

The API should start on port 5000.

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API health check |
| POST | `/api/auth/login` | Public, rate-limited | Authenticate a user |
| GET | `/api/patients?limit=10&offset=0` | Authenticated role | Retrieve a bounded patient page |
| GET | `/api/patients/:id` | Authenticated role | Retrieve a patient record |
| GET | `/api/audit-logs?limit=10&offset=0` | Administrator | Retrieve a bounded audit-log page |

## Security Design

- JWTs are verified server-side before protected routes are served.
- RBAC middleware restricts patient and administrator functions by role.
- Patient queries use explicit database fields rather than `SELECT *`.
- Encrypted clinical-note storage is excluded from standard patient-list responses.
- Login attempts are rate-limited to reduce automated password-guessing attempts.
- Request bodies and pagination parameters are validated before database queries run.
- Audit events record implemented authentication, record-access, and administrative-access actions.
- The audit-log endpoint is protected on the backend, not merely hidden in the frontend.
- The frontend receives only the data required for the active view.

## Validation Performed

- Verified Dockerized PostgreSQL availability through `localhost:5432`.
- Verified patient API queries against the actual PostgreSQL `patients` schema.
- Verified patient-list and audit-log pagination with bounded `limit` and `offset` values.
- Verified the dashboard and patient-detail workflows load without missing-column errors.
- Verified administrator access to audit logs.
- Verified non-administrator audit-log requests are rejected by the backend.
- Verified login, patient access, audit-log access, and UI workflows locally.

## Screenshots

Screenshots use local seeded/demo data only.

| Screen | Preview |
|---|---|
| Secure sign-in | Add `docs/screenshots/login.png` |
| Patient dashboard | Add `docs/screenshots/dashboard.png` |
| Patient detail | Add `docs/screenshots/patient-detail.png` |
| Admin audit logs | Add `docs/screenshots/audit-logs.png` |

## PHI and HIPAA Scope

CareBridge is designed to demonstrate HIPAA-aligned technical safeguards, including access control, authentication, audit controls, validation, encryption-oriented data handling, and minimum-necessary response design.

CareBridge is not represented as HIPAA compliant. Production healthcare deployment would require formal risk analysis, organizational policies, workforce training, physical safeguards, TLS and encrypted database connections, secure key management, backup and recovery procedures, incident-response processes, access reviews, vendor assessment, and legal/compliance validation.

## Repository Safety

Never commit:

- `.env` files
- Database URLs, passwords, JWT secrets, encryption keys, or TOTP secrets
- `node_modules`
- Docker database volumes
- Real patient data or exported audit-log data
