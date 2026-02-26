import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  // health holds the JSON response from the backend
  const [health, setHealth] = useState(null);

  // error holds any error message if the request fails
  const [error, setError] = useState(null);

  useEffect(() => {
    // useEffect runs after the component renders.
    // The empty [] means "run only once on page load".
    fetch("http://localhost:5000/health")
      .then((res) => {
        // res is the raw HTTP response object.
        // res.json() converts the response body into a JS object.
        return res.json();
      })
      .then((data) => {
        // data is the parsed JSON from the backend.
        // Saving it into state triggers a re-render.
        setHealth(data);
      })
      .catch((err) => {
        // If the network request fails (backend down, CORS blocked, etc.)
        setError(String(err));
      });
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Internship Tracking</h1>

      <h2>Backend health check</h2>

      {/* If there is an error, show it */}
      {error && <pre style={{ color: "crimson" }}>{error}</pre>}

      {/* If no error and health not loaded yet, show loading */}
      {!error && !health && <p>Loading...</p>}

      {/* If health is loaded, show it formatted */}
      {health && <pre>{JSON.stringify(health, null, 2)}</pre>}
    </div>
  );
}