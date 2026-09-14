import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const patients = [
  {
    id: '1001',
    name: 'Ava Thompson',
    age: 42,
    condition: 'Hypertension monitoring',
    status: 'Stable',
    updated: 'Today, 10:20 AM',
  },
  {
    id: '1002',
    name: 'Noah Williams',
    age: 67,
    condition: 'Post-discharge follow-up',
    status: 'Needs review',
    updated: 'Today, 9:45 AM',
  },
  {
    id: '1003',
    name: 'Mia Garcia',
    age: 29,
    condition: 'Diabetes care plan',
    status: 'Stable',
    updated: 'Yesterday, 4:15 PM',
  },
]

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/dashboard">
          <span className="brand-mark small">CB</span>
          <span>CareBridge</span>
        </Link>

        <div className="user-actions">
          <div>
            <strong>{user.name}</strong>
            <span className="user-role">{user.role}</span>
          </div>
          <button className="secondary-button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Care coordination</p>
            <h1>Patient dashboard</h1>
            <p className="muted">
              Review active patients and identify records that need attention.
            </p>
          </div>
          <button className="primary-button" type="button">
            + Add patient
          </button>
        </div>

        <section className="metrics-grid" aria-label="Patient summary">
          <article className="metric-card">
            <span>Active patients</span>
            <strong>24</strong>
            <small>3 updated today</small>
          </article>
          <article className="metric-card warning">
            <span>Needs review</span>
            <strong>4</strong>
            <small>Follow-up requested</small>
          </article>
          <article className="metric-card success">
            <span>Care plans current</span>
            <strong>20</strong>
            <small>Updated within 30 days</small>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent patients</h2>
              <p className="muted">Demo records until the API is connected.</p>
            </div>
            <input
              className="search-input"
              type="search"
              placeholder="Search patients"
              aria-label="Search patients"
            />
          </div>

          <div className="patient-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Care focus</th>
                  <th>Status</th>
                  <th>Last updated</th>
                  <th aria-label="Open record" />
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <strong>{patient.name}</strong>
                      <span className="table-subtext">
                        Patient ID {patient.id} · Age {patient.age}
                      </span>
                    </td>
                    <td>{patient.condition}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          patient.status === 'Needs review'
                            ? 'status-warning'
                            : 'status-success'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td>{patient.updated}</td>
                    <td>
                      <Link className="text-link" to={`/patients/${patient.id}`}>
                        View record
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  )
}

export default DashboardPage