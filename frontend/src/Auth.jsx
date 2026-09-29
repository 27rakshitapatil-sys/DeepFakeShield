import { useState } from "react";
import axios from "axios";

function Auth({ onLogin, initialMode = "login", onBackToHome }) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    if (mode === "register") {
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "register"
          ? "http://127.0.0.1:8000/api/auth/register/"
          : "http://127.0.0.1:8000/api/auth/login/";

      const payload =
        mode === "register"
          ? {
              username: username.trim(),
              email: email.trim(),
              password,
            }
          : {
              username: username.trim(),
              password,
            };

      const response = await axios.post(endpoint, payload, {
        withCredentials: true,
      });

      setMessage(
        mode === "register"
          ? "Registration successful. Opening your dashboard..."
          : "Login successful. Opening your dashboard..."
      );

      if (response.data.user) {
        onLogin(response.data.user);
      }
    } catch (err) {
      const serverError =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message;

      setError(serverError || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {onBackToHome && (
          <button
            type="button"
            className="auth-home-button"
            onClick={onBackToHome}
          >
            ← Back to Home
          </button>
        )}

        <div className="auth-brand">
          <div className="auth-logo">DS</div>

          <h1>DeepFakeShield</h1>

          <p>AI-powered digital authenticity analysis</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={
              mode === "login"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => switchMode("login")}
          >
            Login
          </button>

          <button
            type="button"
            className={
              mode === "register"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => switchMode("register")}
          >
            Register
          </button>
        </div>

        <div className="auth-heading">
          <h2>
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p>
            {mode === "login"
              ? "Sign in to continue to DeepFakeShield."
              : "Create an account to use DeepFakeShield."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="auth-field">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          {mode === "register" && (
            <div className="auth-field">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
            />
          </div>

          {mode === "register" && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
              >
                Login
              </button>
            </>
          )}
        </div>

        <div className="auth-footer">
          Your account helps keep your DeepFakeShield
          workspace separate.
        </div>
      </div>
    </div>
  );
}

export default Auth;