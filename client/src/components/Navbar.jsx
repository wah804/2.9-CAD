import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">AUTO VAULT</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {isAuthenticated ? (
          <>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>
              Welcome, <strong style={{ color: 'var(--text-light)' }}>{user?.username}</strong>
            </span>
            <Link to="/add" className="navbar-link">+ Add New Car</Link>
            <button 
              onClick={logout} 
              className="navbar-link" 
              style={{ 
                background: 'transparent', 
                border: '1px solid #ff6b6b', 
                color: '#ff6b6b', 
                cursor: 'pointer' 
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Log In</Link>
            <Link to="/register" className="navbar-link" style={{ backgroundColor: 'var(--dull-yellow)', color: 'var(--bg-dark)' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
