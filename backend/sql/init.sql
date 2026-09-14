CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'physician', 'nurse', 'billing')),
  mfa_secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(60) NOT NULL,
  last_name VARCHAR(60) NOT NULL,
  date_of_birth DATE NOT NULL,
  diagnosis TEXT NOT NULL,
  encrypted_clinical_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  patient_id INTEGER REFERENCES patients(id),
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(64),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_patient_id ON audit_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

INSERT INTO users (email, password_hash, role, mfa_secret)
VALUES
  ('admin@medsecure.local', '$2a$10$Uor9FhfO.JjM4hMnYaAfIeSbYT5zvCcDSUPOJPjs9tNwoNiKd6/2m', 'admin', 'JBSWY3DPEHPK3PXP'),
  ('doctor@medsecure.local', '$2a$10$Uor9FhfO.JjM4hMnYaAfIeSbYT5zvCcDSUPOJPjs9tNwoNiKd6/2m', 'physician', 'JBSWY3DPEHPK3PXP'),
  ('nurse@medsecure.local', '$2a$10$Uor9FhfO.JjM4hMnYaAfIeSbYT5zvCcDSUPOJPjs9tNwoNiKd6/2m', 'nurse', 'JBSWY3DPEHPK3PXP'),
  ('billing@medsecure.local', '$2a$10$Uor9FhfO.JjM4hMnYaAfIeSbYT5zvCcDSUPOJPjs9tNwoNiKd6/2m', 'billing', 'JBSWY3DPEHPK3PXP')
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (first_name, last_name, date_of_birth, diagnosis, encrypted_clinical_notes)
VALUES
  ('Avery', 'Morgan', '1988-04-12', 'Type 2 Diabetes', NULL),
  ('Jordan', 'Lee', '1979-11-03', 'Hypertension', NULL),
  ('Taylor', 'Patel', '1993-07-21', 'Asthma', NULL)
ON CONFLICT DO NOTHING;