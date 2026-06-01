import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const DEMO = { id: 'riya98012@gmail.com', pin: 'riya98012' };

export default function Login() {
  const [email, setEmail] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const fillDemo = () => {
    setEmail(DEMO.id);
    setSecret(DEMO.pin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password: secret });
      setToken(res.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In</h2>
        <p className="auth-subtitle">Welcome back — enter your details below</p>

        {/* Demo credentials banner */}
        <div className="demo-banner">
          <div className="demo-info">
            <span className="demo-label">🧪 Test Account</span>
            <span className="demo-cred">{DEMO.id}</span>
            <span className="demo-cred">{DEMO.pin}</span>
          </div>
          <button type="button" className="demo-fill-btn" onClick={fillDemo}>
            Autofill
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Access key"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
