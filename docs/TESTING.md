# CareBridge Local Test Results

## Environment

- Operating system: Windows
- Database: PostgreSQL 16 in Docker Compose
- Backend: Node.js and Express
- Frontend: React and Vite

## Functional Checks

| Test | Expected outcome | Result |
|---|---|---|
| Docker database startup | PostgreSQL container is running | Pass |
| API health endpoint | `GET /api/health` returns HTTP 200 | Pass |
| Valid login | User reaches dashboard | Pass |
| Invalid login | API returns HTTP 401 and UI shows an error | Pass |
| Patient list | Protected dashboard loads patient records | Pass |
| Patient detail | Authorized record view loads | Pass |
| Patient pagination | Previous and Next controls navigate bounded results | Pass |
| Admin audit logs | Administrator can load audit activity | Pass |
| Non-admin audit logs | Backend rejects access with HTTP 403 | Pass |
| Audit logging | Patient record view produces an audit event | Pass |
| Invalid pagination | Invalid `limit` or `offset` is rejected safely | Pass |

## Notes

Testing was performed locally with seeded/demo data. This document records functional validation only and does not constitute a formal security assessment or HIPAA compliance certification.