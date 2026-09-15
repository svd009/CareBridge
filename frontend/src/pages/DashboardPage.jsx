import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const PAGE_SIZE = 10;

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatients() {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get("/patients", {
          params: {
            limit: PAGE_SIZE,
            offset,
          },
        });

        setPatients(response.data.patients || []);
        setTotal(response.data.total || 0);
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
  }, [logout, navigate, offset]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const filteredPatients = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return patients;
    }

    return patients.filter((patient) => {
      const fullName =
        `${patient.first_name} ${patient.last_name}`.toLowerCase();

      return (
        fullName.includes(searchValue) ||
        patient.diagnosis?.toLowerCase().includes(searchValue)
      );
    });
  }, [patients, search]);

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstRecord = total === 0 ? 0 : offset + 1;
  const lastRecord = Math.min(offset + patients.length, total);

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
            <strong>{total}</strong>
            <small>Available to your role</small>
          </article>

          <article className="metric-card warning">
            <span>Access level</span>
            <strong>{user?.role}</strong>
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
              placeholder="Search this page"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoading && <p className="content-message">Loading patients...</p>}

          {error && (
            <p className="content-message form-error" role="alert">
              {error}
            </p>
          )}

          {!isLoading && !error && (
            <>
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
                          {new Date(
                            patient.date_of_birth
                          ).toLocaleDateString()}
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

              <div className="pagination-controls">
                <p className="pagination-summary">
                  Showing {firstRecord} to {lastRecord} of {total} records
                </p>

                <div className="pagination-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() =>
                      setOffset((currentOffset) =>
                        Math.max(0, currentOffset - PAGE_SIZE)
                      )
                    }
                    disabled={offset === 0}
                  >
                    Previous
                  </button>

                  <span className="pagination-page">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() =>
                      setOffset((currentOffset) => currentOffset + PAGE_SIZE)
                    }
                    disabled={offset + PAGE_SIZE >= total}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

export default DashboardPage;