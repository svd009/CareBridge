import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
}

function getPatientId(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return "Not available";
  }

  return metadata.patientId ?? "Not available";
}

function AuditLogsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [auditLogs, setAuditLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [patientSearch, setPatientSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const response = await api.get("/audit-logs");
        setAuditLogs(response.data.auditLogs || []);
      } catch (requestError) {
        const status = requestError.response?.status;

        if (status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (status === 403) {
          navigate("/dashboard", { replace: true });
          return;
        }

        setError(
          requestError.response?.data?.message ||
            "Unable to load audit logs."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAuditLogs();
  }, [logout, navigate]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const availableActions = useMemo(() => {
    return [...new Set(auditLogs.map((log) => log.action).filter(Boolean))];
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const searchValue = patientSearch.trim().toLowerCase();

    return auditLogs.filter((log) => {
      const matchesAction =
        actionFilter === "ALL" || log.action === actionFilter;

      const patientId = String(getPatientId(log.metadata)).toLowerCase();
      const matchesPatient =
        !searchValue || patientId.includes(searchValue);

      return matchesAction && matchesPatient;
    });
  }, [actionFilter, auditLogs, patientSearch]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/dashboard">
          <span className="brand-mark small">CB</span>
          <span>CareBridge</span>
        </Link>

        <div className="user-actions">
          <div>
            <strong>{user?.email || "Administrator"}</strong>
            <span className="user-role">{user?.role}</span>
          </div>

          <button className="secondary-button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="page-heading audit-page-heading">
          <div>
            <p className="eyebrow">Security and accountability</p>
            <h1>Audit logs</h1>
            <p className="muted">
              Review recent patient-record and security-related activity.
            </p>
          </div>

          <Link className="secondary-button back-link" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <section className="metrics-grid" aria-label="Audit log summary">
          <article className="metric-card">
            <span>Recent events</span>
            <strong>{auditLogs.length}</strong>
            <small>Most recent 100 events</small>
          </article>

          <article className="metric-card warning">
            <span>Visible events</span>
            <strong>{filteredLogs.length}</strong>
            <small>Matching current filters</small>
          </article>

          <article className="metric-card success">
            <span>Access level</span>
            <strong>Admin</strong>
            <small>Server-enforced access</small>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading audit-panel-heading">
            <div>
              <h2>Activity history</h2>
              <p className="muted">
                Events are ordered from newest to oldest.
              </p>
            </div>

            <div className="audit-filters">
              <label>
                Action
                <select
                  value={actionFilter}
                  onChange={(event) => setActionFilter(event.target.value)}
                >
                  <option value="ALL">All actions</option>
                  {availableActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Patient ID
                <input
                  className="search-input"
                  type="search"
                  inputMode="numeric"
                  placeholder="Filter by ID"
                  value={patientSearch}
                  onChange={(event) => setPatientSearch(event.target.value)}
                />
              </label>
            </div>
          </div>

          {isLoading && (
            <p className="content-message">Loading audit activity...</p>
          )}

          {error && (
            <p className="content-message form-error" role="alert">
              {error}
            </p>
          )}

          {!isLoading && !error && (
            <div className="patient-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Patient ID</th>
                    <th>IP address</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDate(log.created_at)}</td>
                      <td>
                        <span className="audit-action">{log.action}</span>
                      </td>
                      <td>{log.user_email || "System or unknown user"}</td>
                      <td>{log.user_role || "Not available"}</td>
                      <td>{getPatientId(log.metadata)}</td>
                      <td>{log.ip_address || "Not available"}</td>
                    </tr>
                  ))}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="6">No audit events match the selected filters.</td>
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

export default AuditLogsPage;