import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const { user, logout } = useAuth();

  useEffect(() => {
    async function loadPatients() {
      try {
        const { data } = await client.get("/patients");
        setPatients(data.patients);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load records.");
      }
    }

    loadPatients();
  }, []);

  return (
    <main>
      <header>
        <div>
          <h1>Patient Records</h1>
          <p>Signed in as {user.email} ({user.role})</p>
        </div>
        <button onClick={logout}>Sign out</button>
      </header>

      {error && <p role="alert">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Date of Birth</th>
            <th>Diagnosis</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.first_name} {patient.last_name}</td>
              <td>{patient.date_of_birth}</td>
              <td>{patient.diagnosis}</td>
              <td>
                <Link to={`/patients/${patient.id}`}>View record</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}