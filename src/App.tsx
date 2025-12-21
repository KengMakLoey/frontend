import { useEffect, useState } from "react";

function App() {
  const [apiStatus, setApiStatus] = useState<string>("loading...");
  const [dbStatus, setDbStatus] = useState<string>("loading...");

  useEffect(() => {
  fetch("http://localhost:3000/health")
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "ok") {
        setApiStatus("✅ Backend connected");
      } else {
        setApiStatus("❌ Backend error");
      }
    })
    .catch(() => setApiStatus("❌ Backend not reachable"));

  fetch("http://localhost:3000/health/db")
    .then((res) => res.json())
    .then((data) => {
      if (data.ok === true) {
        setDbStatus("✅ Database connected");
      } else {
        setDbStatus("❌ Database error");
      }
    })
    .catch(() => setDbStatus("❌ DB not reachable"));
}, []);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Nakornping Q – Connection Test</h1>

      <h2>Backend</h2>
      <pre>{apiStatus}</pre>

      <h2>Database</h2>
      <pre>{dbStatus}</pre>
    </div>
  );
}

export default App;
