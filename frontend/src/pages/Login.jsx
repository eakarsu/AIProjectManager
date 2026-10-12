import { useRef as useDemoLoginRef, useState as useDemoLoginState } from 'react';
import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const demoLoginLock = useDemoLoginRef(false);
  const [demoLoginBusy, setDemoLoginBusy] = useDemoLoginState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    const demoEmail = import.meta.env.VITE_DEMO_EMAIL || '';
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || '';
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleSubmit = async (e, demoLoginCredentials) => {
    e.preventDefault();
    await doLogin((demoLoginCredentials?.email ?? email), (demoLoginCredentials?.password ?? password));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h1>AI Project Manager</h1>
          <p>AI-powered project management platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '16px', padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginBottom: '12px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button disabled={demoLoginBusy} type="button" className="btn btn-secondary" onClick={async (event) => {
 if (demoLoginLock.current) return;
 demoLoginLock.current = true; setDemoLoginBusy(true);
 const values = {};
 const captureDemoValue = (key, value) => { values[key] = value; return value; };
 try {
  await (async () => {
    const demoEmail = import.meta.env.VITE_DEMO_EMAIL || '';
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || '';
    setEmail(captureDemoValue("email", demoEmail));
    setPassword(captureDemoValue("password", demoPassword));
  })(event);
  if (values.error || typeof values.email !== 'string' || !values.email || typeof values.password !== 'string' || !values.password) { setError(typeof values.error === 'string' ? values.error : 'Demo credentials are unavailable.'); return; }
  await handleSubmit(event, { email: values.email, password: values.password });
 } finally { demoLoginLock.current = false; setDemoLoginBusy(false); }
}} style={{ width: '100%', justifyContent: 'center' }}>
            Log In as Demo
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Use the configured local demo account.
          </p>
        </div>
      </div>
    </div>
  );
}
