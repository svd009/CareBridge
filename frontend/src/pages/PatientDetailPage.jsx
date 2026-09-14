import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PatientDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatient() {
      try {
        const { data } = await client.get(`/patients/${id}`);
        setPatient(data.patient);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load patient record.");
      }
    }

    loadPatient();
  }, [id]);

  if (error) return <main><p role="alert">{error}</p></main>;
  if (!patient) return <main><p>Loading patient record...</p></main>;

  return (
    <main>
      <Link to="/">Back to records</Link>
      <h1>{patient.first_name} {patient.last_name}</h1>

      <section>
        <p><strong>Date of Birth:</strong> {patient.date_of_birth}</p>
        <p><strong>Diagnosis:</strong> {patient.diagnosis || "Restricted for this role"}</p>
        <p><strong>Clinical Notes:</strong> {patient.clinical_notes || "Restricted for this role"}</p>
        <p><strong>Last Updated:</strong> {patient.updated_at}</p>
      </section>

      {(user.role === "admin" || user.role === "physician") && (
        <button onClick={() => window.open(`${import.meta.env.VITE_API_URL}/patients/${id}/export`, "_blank")}>
          Export record
        </button>
      )}
    </main>
  );
}