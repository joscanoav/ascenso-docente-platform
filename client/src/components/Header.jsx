import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to={user ? '/dashboard' : '/'} style={{ textDecoration: 'none' }}>
          <div className="brand-mark">
            <span className="brand-dot" />
            <div className="brand-text">
              <div className="b1">ASCENSO DOCENTE</div>
              <div className="b2">Plataforma de práctica · Inglés</div>
            </div>
          </div>
        </Link>

        {user && (
          <nav className="header-nav">
            <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            <Link to="/mock-exam" className="btn btn-ghost btn-sm">Simulacro</Link>
            <Link to="/history" className="btn btn-ghost btn-sm">Historial</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>
            )}
            <button type="button" className="btn btn-primary btn-sm" onClick={handleLogout}>
              Salir
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
