import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; // Reuse the same CSS file for consistency

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/signup", form);

      if (res.data.success) {
        alert("Signup successful");
        navigate("/login");
      } else {
        alert(res.data.message);
      }

    } catch (err) {
      alert("Registration failed. Please try again.");
    }
  };


  return (
    <div className="login-page">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="login-container">
        {/* Left Side: Visual Branding */}
        <div className="visual-section">
          <div className="visual-content">
            <h1>Start Your <br /><span>Journey.</span></h1>
            <p>Create an account to start organizing world-class events with real-time analytics and seamless participant management.</p>
            <div className="mini-stats">
              <div className="m-stat"><strong>Free</strong><span>Trial Period</span></div>
              <div className="m-stat"><strong>Easy</strong><span>Setup</span></div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="form-section">
          <div className="login-glass-card">
            <div className="brand">
              <span className="brand-logo">✨</span>
              <span className="brand-name">EventManager</span>
            </div>
            
            <h2>Create Account</h2>
            <p className="form-subtitle">Join our community of elite organizers</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    onChange={handleChange}
                    required
                  />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  onChange={handleChange}
                  required
                />
                <p className="input-hint">Must be at least 8 characters.</p>
              </div>

              <button type="submit" className="login-submit-btn">
                Create Account <span>→</span>
              </button>
            </form>

            <p className="signup-text">
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;