import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ justifyContent: 'center' }}>
        <h1 className="page-title">Access the Vault</h1>
      </div>

      <div className="form-container">
        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid #ff6b6b',
            color: '#ff6b6b',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. driver@autovault.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-actions" style={{ flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary btn-submit"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Don't have a vault account?{' '}
              <Link to="/register" style={{ color: 'var(--dull-yellow)', fontWeight: '600', textDecoration: 'none' }}>
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
