import React, { useState } from "react";

function LoginPage({ onLogin, onSignup, message }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  function handleSubmit() {
    if (!email || !password) return;
	  
    const creds = {username: email, password};

    if (isSignUp) {
      onSignup(creds);
    } else {
      onLogin(creds);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-logo">Bytez</h1>
        <p className="login-motto">
          Log in or sign up to decrypt your cravings
        </p>

        <div className="login-toggle">
          <button
            className={
              !isSignUp ? "toggle-btn active" : "toggle-btn"
            }
            onClick={() => setIsSignUp(false)}>
            Log In
          </button>
          <button
            className={
              isSignUp ? "toggle-btn active" : "toggle-btn"
            }
            onClick={() => setIsSignUp(true)}>
            Sign Up
          </button>
        </div>

        {isSignUp && (
          <input
            className="login-input"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          className="login-input"
          type="text"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-submit" onClick={handleSubmit}>
          {isSignUp ? "Create Account" : "Log In"}
        </button>

        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
