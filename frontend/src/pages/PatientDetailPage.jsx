import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatient() {
      try {
        const response = await api.get(`/patients/${patientId}`);
        setPatient(response.data.patient);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (requestError.response?.status === 404) {
          setError("Patient record not found.");
          return;
        }

        setError(
          requestError.response?.data?.message ||
            "Unable to load the patient record."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPatient();
  }, [patientId, logout, navigate]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return (
      <main className="empty-page">
        <section className="empty-card">
          <p className="eyebrow">CareBridge</p>
          <h1>Loading patient record</h1>
          <p className="muted">Retrieving the protected patient record.</p>
        </section>
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="empty-page">
        <section className="empty-card">
          <p className="eyebrow">CareBridge</p>
          <h1>Patient not found</h1>
          <p className="muted">{error || "This patient record does not exist."}</p>
          <Link className="primary-button link-button" to="/dashboard">
            Return to dashboard
          </Link>
        </section>
      </main>
    );
  }

  const initials = `${patient.first_name?.[0] || ""}${
    patient.last_name?.[0] || ""
  }`;

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/dashboard">
          <span className="brand-mark small">CB</span>
          <span>CareBridge</span>
        </Link>

        <div className="user-actions">
          <div>
            <strong>Dr. Stephen Maturin</strong>
            <span className="user-role">admin</span>
          </div>

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
          <div className="patient-avatar">{initials}</div>

          <div>
            <p className="eyebrow">Protected patient record</p>
            <h1>
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="muted">
              Patient ID {patient.id} · Date of birth{" "}
              {new Date(patient.date_of_birth).toLocaleDateString()}
            </p>
          </div>
        </section>

        <section className="detail-grid">
          <article className="panel">
            <h2>Care summary</h2>

            <dl className="details-list">
              <div>
                <dt>Diagnosis</dt>
                <dd>{patient.diagnosis || "Restricted for your role"}</dd>
              </div>

              <div>
                <dt>Last updated</dt>
                <dd>{new Date(patient.updated_at).toLocaleString()}</dd>
              </div>

              <div>
                <dt>Record access</dt>
                <dd>Server-authorized access</dd>
              </div>
            </dl>
          </article>

          <article className="panel">
            <h2>Clinical notes</h2>
            <p className="care-note">
              {patient.clinical_notes ||
                "No clinical notes are available for this record."}
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}

export default PatientDetailPage;