import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">AUTO VAULT</Link>
      <div>
        <Link to="/add" className="navbar-link">+ Add New Car</Link>
      </div>
    </nav>
  );
}
