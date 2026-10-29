
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

// API configuration

const API_URL =
  "https://two4bcs211-student-internship-portal.onrender.com";

const internshipNames = [
  "Web Development Intern",
  "Data Science Intern",
  "Cloud Computing Intern",
  "Java Developer Intern",
];

// Home page: display all internships
function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadInternships() {
      try {
        const response = await fetch(`${API_URL}/api/internships`);

        if (!response.ok) {
          throw new Error(`Unable to load internships (${response.status}).`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        if (!cancelled) {
          setInternships(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message === "Failed to fetch"
              ? "Cannot connect to the backend. Check the API URL, backend server, and CORS settings."
              : err.message
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInternships();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">YOUR CAREER STARTS HERE</p>
        <h1>Find Your Perfect Internship</h1>
        <p>
          Explore opportunities, develop your skills, and take your next step.
        </p>
        <a className="button" href="#opportunities">
          Explore Internships
        </a>
      </section>

      <section id="opportunities">
        <h2>Available Internships</h2>

        {loading && <p>Loading internships...</p>}

        {error && (
          <div className="error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && internships.length === 0 && (
          <p>No internships are available right now.</p>
        )}

        <div className="internship-grid">
          {internships.map((item) => (
            <article className="card" key={item._id}>
              <span className="tag">
                {item.duration || "Duration not specified"}
              </span>

              <h3>{item.title}</h3>

              {item.company && (
                <p>
                  <strong>Company:</strong> {item.company}
                </p>
              )}

              {item.location && (
                <p>
                  <strong>Location:</strong> {item.location}
                </p>
              )}

              {item.stipend && (
                <p>
                  <strong>Stipend:</strong> {item.stipend}
                </p>
              )}

              <p>{item.description}</p>

              <Link
                className="button"
                to={`/internships/${item._id}`}
              >
                View Details
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

// Internship details page
function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadInternship() {
      setInternship(null);
      setError("");
      setLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/api/internships/${encodeURIComponent(id)}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Internship not found."
              : `Unable to load internship (${response.status}).`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setInternship(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message === "Failed to fetch"
              ? "Cannot connect to the backend. Check the API URL and CORS settings."
              : err.message
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInternship();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="container">
        <p>Loading internship details...</p>
      </main>
    );
  }

  if (error || !internship) {
    return (
      <main className="container">
        <p className="error">
          {error || "Internship not found."}
        </p>
        <Link to="/">Back to internships</Link>
      </main>
    );
  }

  return (
    <main className="container">
      <article className="card details-card">
        <span className="tag">
          {internship.duration || "Duration not specified"}
        </span>

        <h1>{internship.title}</h1>

        {internship.company && (
          <p>
            <strong>Company:</strong> {internship.company}
          </p>
        )}

        {internship.location && (
          <p>
            <strong>Location:</strong> {internship.location}
          </p>
        )}

        {internship.stipend && (
          <p>
            <strong>Stipend:</strong> {internship.stipend}
          </p>
        )}

        <p>{internship.description}</p>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/apply?internship=${encodeURIComponent(internship.title)}`
            )
          }
        >
          Apply Now
        </button>

        <p>
          <Link to="/">← Back to internships</Link>
        </p>
      </article>
    </main>
  );
}

// Application form
function ApplicationForm() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const selectedInternship = params.get("internship") || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNumber: "",
    internship: selectedInternship,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      internship: selectedInternship,
    }));
  }, [selectedInternship]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.rollNumber.trim() ||
      !form.internship
    ) {
      setMessageType("error");
      setMessage("Please fill in every field.");
      return;
    }

    if (form.name.trim().length < 2) {
      setMessageType("error");
      setMessage("Name must contain at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setMessageType("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          rollNumber: form.rollNumber.trim(),
          internship: form.internship,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Application submission failed (${response.status}).`
        );
      }

      setMessageType("success");
      setMessage(data.message || "Application submitted successfully!");

      setForm({
        name: "",
        email: "",
        rollNumber: "",
        internship: "",
      });
    } catch (err) {
      setMessageType("error");
      setMessage(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check the API URL, backend server, and CORS settings."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <section className="form-section">
        <p className="eyebrow">TAKE THE NEXT STEP</p>
        <h1>Internship Application</h1>
        <p>Enter your details to submit your application.</p>

        <form
          className="card application-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="name">Student Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
            placeholder="Enter your full name"
          />

          <label htmlFor="email">Email ID</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />

          <label htmlFor="rollNumber">Roll Number</label>
          <input
            id="rollNumber"
            name="rollNumber"
            value={form.rollNumber}
            onChange={handleChange}
            maxLength={30}
            required
            placeholder="Enter your roll number"
          />

          <label htmlFor="internship">Selected Internship</label>
          <select
            id="internship"
            name="internship"
            value={form.internship}
            onChange={handleChange}
            required
          >
            <option value="">Choose an internship</option>

            {internshipNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>

          {message && (
            <p className={messageType} role="status">
              {message}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

// Navigation bar
function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Internship Portal
      </Link>

      <nav>
        <Link to="/">Internships</Link>
        <Link to="/apply">Apply Now</Link>
      </nav>
    </header>
  );
}

// Unknown page
function NotFound() {
  return (
    <main className="container">
      <h1>Page Not Found</h1>
      <Link to="/">Return to home</Link>
    </main>
  );
}

// Main application
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<InternshipList />} />
        <Route path="/internships/:id" element={<InternshipDetails />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer className="footer">
        Student Internship Portal
      </footer>
    </BrowserRouter>
  );
}
