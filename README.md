# CareBridge

A full-stack, HIPAA-aligned patient records and care coordination portal built with React, Node.js, Express.js, and PostgreSQL.

> This is a portfolio project that uses synthetic data only. It is not a certified HIPAA-compliant production system and must not be used to process real Protected Health Information (PHI).

## Features

- React frontend for secure patient-record review
- Node.js and Express REST API
- PostgreSQL persistence
- JWT-based authentication
- Role-Based Access Control (RBAC) for four roles:
  - Administrator
  - Physician
  - Nurse
  - Billing Specialist
- Time-based one-time password (TOTP) MFA
- Patient-record access controls
- AES-256-GCM field encryption for sensitive clinical notes
- TLS-ready deployment configuration
- Immutable-style audit log for patient record reads, edits, and exports
- Request validation, centralized error handling, security headers, and rate limiting

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express.js, JWT, bcrypt, Speakeasy |
| Database | PostgreSQL |
| Security | RBAC, MFA, AES-256-GCM, Helmet, rate limiting, audit logs |
| DevOps | Docker, Docker Compose, environment variables |

## Architecture

```text
React Client
    |
    | HTTPS / REST API
    v
Express API
    |
    +-- JWT authentication
    +-- RBAC authorization
    +-- MFA verification
    +-- Audit logging
    +-- AES-256-GCM encryption
    |
    v
PostgreSQL
```

## Local Setup

### Prerequisites

- Node.js 20+
- Docker Desktop
- npm

### 1. Start PostgreSQL

```bash
docker compose up -d db
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

## Demo Accounts

After running the SQL seed data, use one of the following accounts:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | admin@medsecure.local | ChangeMe123! |
| Physician | doctor@medsecure.local | ChangeMe123! |
| Nurse | nurse@medsecure.local | ChangeMe123! |
| Billing Specialist | billing@medsecure.local | ChangeMe123! |

For a real demo, avoid committing real passwords. Replace these accounts and credentials before publishing screenshots or hosting the project.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Validates credentials and begins MFA flow |
| POST | `/api/auth/mfa/verify` | Verifies TOTP code and returns JWT |
| GET | `/api/patients` | Lists records available to the authenticated user |
| GET | `/api/patients/:id` | Retrieves an authorized patient record |
| PUT | `/api/patients/:id` | Updates a patient record for authorized roles |
| GET | `/api/patients/:id/export` | Exports an authorized patient record |
| GET | `/health` | Application health check |

## Security Notes

This project implements technical controls inspired by healthcare security requirements:

- Least-privilege RBAC
- MFA for account access
- Server-side authorization checks on each protected route
- Audit logs for record access, modifications, and export events
- Password hashing with bcrypt
- JWT expiration
- AES-256-GCM encryption for selected sensitive fields
- TLS should be terminated through a reverse proxy or managed cloud load balancer in a deployed environment
- Input validation and API rate limiting

HIPAA compliance is organizational and requires administrative and physical safeguards, formal risk analysis, policies, training, incident response, vendor agreements, and ongoing review. This project demonstrates application-level technical safeguards only.

## Future Improvements

- Refresh-token rotation using secure HttpOnly cookies
- Record-level authorization based on provider-patient assignment
- Account lockout after repeated failed authentication attempts
- CI pipeline with unit and integration tests
- AWS deployment using ECS/Fargate, RDS PostgreSQL, Secrets Manager, CloudWatch, and an Application Load Balancer
- Optional AI feature: de-identified clinical-note summarization with human approval and audit logging

## Screenshots

Add screenshots here after building:
- Login and MFA screen
- Role-specific dashboard
- Patient record details
- Audit log viewer
