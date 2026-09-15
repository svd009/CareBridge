import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await api.get("/patients");
        setPatients(response.data.patients);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        setError(
          requestError.response?.data?.message ||
            "Unable to load patient records."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPatients();
  }, [logout, navigate]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();

    return (
      fullName.includes(search.toLowerCase()) ||
      patient.diagnosis?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/dashboard">
          <span className="brand-mark small">CB</span>
          <span>CareBridge</span>
        </Link>

        <div className="user-actions">
          <div>
            <strong>{user?.email || "CareBridge user"}</strong>
            <span className="user-role">{user?.role}</span>
          </div>

          {user?.role === "ADMIN" && (
            <Link className="secondary-button" to="/audit-logs">
              Audit logs
            </Link>
          )}

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
              Review patient records and care information.
            </p>
          </div>
        </div>

        <section className="metrics-grid" aria-label="Patient summary">
          <article className="metric-card">
            <span>Patient records</span>
            <strong>{patients.length}</strong>
            <small>Available to your role</small>
          </article>

          <article className="metric-card warning">
            <span>Access level</span>
            <strong>{user.role}</strong>
            <small>Server-enforced role permissions</small>
          </article>

          <article className="metric-card success">
            <span>API status</span>
            <strong>Live</strong>
            <small>Connected to PostgreSQL</small>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Patient records</h2>
              <p className="muted">
                Records are loaded through the protected CareBridge API.
              </p>
            </div>

            <input
              className="search-input"
              type="search"
              placeholder="Search patient records"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoading && <p className="content-message">Loading patients...</p>}

          {error && <p className="content-message form-error">{error}</p>}

          {!isLoading && !error && (
            <div className="patient-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Diagnosis</th>
                    <th>Date of birth</th>
                    <th>Last updated</th>
                    <th aria-label="Open record" />
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <strong>
                          {patient.first_name} {patient.last_name}
                        </strong>
                        <span className="table-subtext">
                          Patient ID {patient.id}
                        </span>
                      </td>

                      <td>{patient.diagnosis || "Restricted"}</td>

                      <td>
                        {new Date(patient.date_of_birth).toLocaleDateString()}
                      </td>

                      <td>
                        {new Date(patient.updated_at).toLocaleString()}
                      </td>

                      <td>
                        <Link
                          className="text-link"
                          to={`/patients/${patient.id}`}
                        >
                          View record
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan="5">No patient records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default DashboardPage;