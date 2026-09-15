# CareBridge

CareBridge is a secure care-coordination platform designed to help healthcare staff access patient information according to their job responsibilities while protecting sensitive clinical data.

## Problem

Healthcare workflows require multiple staff roles to access patient records, but unrestricted access can expose protected health information and make it difficult to determine who accessed sensitive data.

## Solution

CareBridge provides authenticated, role-based access to patient records with multi-factor authentication, encrypted clinical notes, audit logging, request validation, and centralized API error handling.

## Key Features

- JWT-based authentication
- TOTP multi-factor authentication
- Role-based access control for Administrator, Physician, Nurse, and Billing Specialist roles
- AES-256-GCM field-level encryption for clinical notes
- Patient-record access logging
- Request validation and centralized error handling
- PostgreSQL database running through Docker Compose

## Architecture

Frontend -> Express API -> PostgreSQL

Security flow:
1. User authenticates with credentials.
2. User completes TOTP MFA.
3. API issues or validates a JWT.
4. RBAC middleware checks permitted roles.
5. Authorized requests retrieve only the necessary patient fields.
6. Patient-record activity is logged for accountability.

## Local Setup

### Prerequisites

- Node.js
- Docker Desktop
- Docker Compose

### Start PostgreSQL

```bash
docker compose up -d
```

### Start the backend

```bash
cd backend
npm install
npm run dev
```

### Start the frontend

```bash
cd frontend
npm install
npm run dev
```

## Validation Performed

- Confirmed PostgreSQL container availability on localhost:5432.
- Confirmed patient-list data loads after aligning API queries with the database schema.
- Confirmed missing-column errors were removed by using explicit database fields.
- Tested authentication, role access, patient retrieval, and audit events where implemented.

## Security Notes

CareBridge is a portfolio or educational project and is not represented as a production HIPAA-compliant healthcare system. Production deployment would require formal risk assessment, operational safeguards, secrets management, monitoring, backup and recovery procedures, access reviews, and compliance validation.