import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const patientRecords = {
  1001: {
    name: 'Ava Thompson',
    initials: 'AT',
    age: 42,
    dateOfBirth: 'May 14, 1984',
    patientId: '1001',
    status: 'Stable',
    careFocus: 'Hypertension monitoring',
    clinician: 'Dr. Jordan Miller',
    allergies: 'Penicillin',
    medications: ['Lisinopril 10 mg — once daily', 'Vitamin D3 1,000 IU — once daily'],
    notes:
      'Blood-pressure readings remain within the agreed target range. Continue home monitoring and review readings at the next scheduled follow-up.',
  },
  1002: {
    name: 'Noah Williams',
    initials: 'NW',
    age: 67,
    dateOfBirth: 'August 2, 1959',
    patientId: '1002',
    status: 'Needs review',
    careFocus: 'Post-discharge follow-up',
    clinician: 'Dr. Jordan Miller',
    allergies: 'No known allergies',
    medications: ['Metformin 500 mg — twice daily', 'Atorvastatin 20 mg — once daily'],
    notes:
      'Follow-up call is pending after discharge. Confirm medication access, review symptoms, and arrange the next care-coordination check-in.',
  },
  1003: {
    name: 'Mia Garcia',
    initials: 'MG',
    age: 29,
    dateOfBirth: 'November 8, 1996',
    patientId: '1003',
    status: 'Stable',
    careFocus: 'Diabetes care plan',
    clinician: 'Dr. Jordan Miller',
    allergies: 'Latex',
    medications: ['Insulin glargine — as prescribed', 'Metformin 500 mg — twice daily'],
    notes:
      'Care-plan goals were reviewed. Continue glucose monitoring and bring the next log to the scheduled appointment.',
  },
}

function PatientDetailPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const patient = patientRecords[patientId]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  if (!patient) {
    return (
      <main className="empty-page">
        <section className="empty-card">
          <p className="eyebrow">CareBridge</p>
          <h1>Patient not found</h1>
          <p className="muted">
            This demo patient record does not exist.
          </p>
          <Link className="primary-button link-button" to="/dashboard">
            Return to dashboard
          </Link>
        </section>
      </main>
    )
  }

  const statusClass =
    patient.status === 'Needs review' ? 'status-warning' : 'status-success'

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/dashboard">
          <span className="brand-mark small">CB</span>
          <span>CareBridge</span>
        </Link>

        <div className="user-actions">
          <Link className="secondary-button link-button" to="/dashboard">
            Dashboard
          </Link>
          <button className="secondary-button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <Link className="back-link" to="/dashboard">
          ← Back to patient dashboard
        </Link>

        <section className="patient-hero">
          <div className="patient-avatar">{patient.initials}</div>
          <div>
            <p className="eyebrow">Patient record</p>
            <h1>{patient.name}</h1>
            <p className="muted">
              Patient ID {patient.patientId} · Age {patient.age} · DOB{' '}
              {patient.dateOfBirth}
            </p>
          </div>
          <span className={`status-pill ${statusClass}`}>
            {patient.status}
          </span>
        </section>

        <section className="detail-grid">
          <article className="panel">
            <h2>Care summary</h2>
            <dl className="details-list">
              <div>
                <dt>Care focus</dt>
                <dd>{patient.careFocus}</dd>
              </div>
              <div>
                <dt>Primary clinician</dt>
                <dd>{patient.clinician}</dd>
              </div>
              <div>
                <dt>Allergies</dt>
                <dd>{patient.allergies}</dd>
              </div>
            </dl>
          </article>

          <article className="panel">
            <h2>Current medications</h2>
            <ul className="medication-list">
              {patient.medications.map((medication) => (
                <li key={medication}>{medication}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="panel note-panel">
          <div className="panel-heading">
            <div>
              <h2>Latest care note</h2>
              <p className="muted">Demo content — API connection comes next.</p>
            </div>
            <button className="secondary-button" type="button">
              Add note
            </button>
          </div>
          <p className="care-note">{patient.notes}</p>
        </section>
      </section>
    </main>
  )
}

export default PatientDetailPage