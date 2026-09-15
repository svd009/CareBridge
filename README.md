# CareBridge

CareBridge is a secure care-coordination platform that enables healthcare staff to access patient records according to their job responsibilities while improving protection, accountability, and operational reliability for sensitive patient information.

## Problem

Healthcare organizations need clinicians and support staff to access patient information quickly, but unrestricted access can expose protected health information and make it difficult to review who accessed a record and why.

## Solution

CareBridge provides a role-aware patient-record workflow with secure authentication, access controls, audit logging, encrypted clinical notes, bounded API responses, and a dedicated administrator audit-log interface.

## Features

- JWT authentication with short-lived access tokens
- TOTP multi-factor authentication
- Role-based access control for Administrator, Physician, Nurse, and Billing Specialist roles
- AES-256-GCM field-level encryption for clinical notes
- Audit logging for implemented authentication, patient-record, and administrative access events
- Administrator-only audit-log dashboard with action and patient-ID filters
- Request validation and centralized API error handling
- Login rate limiting with HTTP 429 responses after repeated attempts
- Pagination for patient and audit-log endpoints
- Dockerized PostgreSQL database
- Responsive purple-and-white CareBridge interface

## Architecture

```text
React frontend
      |
      | HTTPS-style API requests during local development
      v
Express.js API
      |
      | JWT verification, RBAC, validation, rate limiting, audit events
      v
PostgreSQL in Docker
```

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, React Router, Axios, CSS |
| Backend | Node.js, Express.js, Zod |
| Authentication | JWT, bcryptjs, TOTP MFA |
| Authorization | Role-based access control |
| Security | Helmet, express-rate-limit, AES-256-GCM encryption |
| Database | PostgreSQL 16 |
| Infrastructure | Docker Compose |

## Local Setup

### Prerequisites

- Node.js
- Docker Desktop and Docker Compose

### 1. Start PostgreSQL

```bash
docker compose up -d
```

Verify that the database container is running:

```bash
docker compose ps
```

### 2. Configure environment variables

Create a backend `.env` file using your local development values. Do not commit this file.

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME
JWT_SECRET=replace-with-a-long-random-development-secret
JWT_EXPIRES_IN=15m
```

Add encryption and TOTP variables only if your implementation requires them.

### 3. Run the backend

```bash
cd backend
npm install
npm run dev
```

### 4. Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, typically `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Service health check |
| POST | `/api/auth/login` | Public, rate-limited | Authenticate a user |
| GET | `/api/patients?limit=10&offset=0` | Authenticated role | Retrieve a bounded patient page |
| GET | `/api/patients/:id` | Authenticated role | Retrieve an authorized patient record |
| GET | `/api/audit-logs?limit=10&offset=0` | Administrator | Retrieve a bounded audit-log page |

## Security Design

- The API validates JWTs and applies role checks server-side.
- Patient queries use explicit field selection rather than `SELECT *`.
- Encrypted clinical-note storage is excluded from standard patient-list responses.
- Login requests are rate-limited to reduce repeated password-guessing attempts.
- Request bodies and pagination inputs are validated before database queries.
- Audit events capture implemented actions and related metadata.
- Administrator audit-log access is protected on the backend, not only hidden in the frontend.

## Validation Performed

- Verified Dockerized PostgreSQL connectivity through `localhost:5432`.
- Verified patient queries against the actual PostgreSQL schema.
- Verified patient-list and audit-log pagination with bounded `limit` and `offset` values.
- Verified administrator access to audit logs.
- Verified non-administrator audit-log access is rejected by the server.
- Verified the patient dashboard, patient detail workflow, and audit-log workflow load without missing-column errors.

## Screenshots

Add screenshots here after redacting personal information, credentials, tokens, and any real patient data.

- Sign-in page
- Patient dashboard
- Patient-detail page
- Administrator audit-log page
- Pagination controls

## Disclaimer

CareBridge is a portfolio and educational project. It is not represented as a production healthcare system or as HIPAA compliant. Production use would require formal risk assessment, legal and compliance review, secure deployment, TLS configuration, secrets management, monitoring, backup and recovery procedures, incident-response processes, and additional access-control testing.