import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/login", form);

      if (res.data.token) {

        // Save data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);

        // Redirect
        navigate("/dashboard");

      } else {
        alert(res.data.message);
      }

    } catch (err) {
      alert("Login failed. Please check your credentials.");
    }
  };


  return (
    <div className="login-page">
      {/* Background decorative blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="login-container">
        {/* Left Side: Form */}
        <div className="form-section">
          <div className="login-glass-card">
            <div className="brand">
              <span className="brand-logo">✨</span>
              <span className="brand-name">EventManager</span>
            </div>
            
            <h2>Login</h2>
            <p className="form-subtitle">Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email / Username</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label>Password</label>
                  <a href="#" className="forgot-pass">Forgot?</a>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="login-submit-btn">
                Sign In <span>→</span>
              </button>
            </form>

            <p className="signup-text">
              Don’t have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>

        {/* Right Side: Visual/Branding */}
        <div className="visual-section">
          <div className="visual-content">
            <h1>Elevate Your <br /><span>Events.</span></h1>
            <p>Join 2,000+ organizers managing conferences and festivals worldwide with our all-in-one suite.</p>
            <div className="mini-stats">
              <div className="m-stat"><strong>12k+</strong><span>Attendees</span></div>
              <div className="m-stat"><strong>99%</strong><span>Success</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;