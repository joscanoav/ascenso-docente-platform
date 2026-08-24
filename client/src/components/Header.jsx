import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Estado para controlar si el menú móvil está abierto
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogout() {
    setIsMenuOpen(false); // Cierra el menú al salir
    logout();
    navigate('/login');
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to={user ? '/dashboard' : '/'} style={{ textDecoration: 'none' }} onClick={closeMenu}>
          <div className="brand-mark">
            <span className="brand-dot" />
            <div className="brand-text">
              <div className="b1">ASCENSO DOCENTE</div>
              <div className="b2">Plataforma de práctica · Inglés</div>
            </div>
          </div>
        </Link>

        {user && (
          <>
            {/* Botón de Hamburguesa (Solo visible en móviles por CSS) */}
            <button 
              className="hamburger-btn" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>

            {/* Agregamos la clase "open" dinámicamente según el estado */}
            <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
              <Link to="/dashboard" className="btn btn-ghost btn-sm" onClick={closeMenu}>Dashboard</Link>
              <Link to="/mock-exam" className="btn btn-ghost btn-sm" onClick={closeMenu}>Simulacro</Link>
              <Link to="/history" className="btn btn-ghost btn-sm" onClick={closeMenu}>Historial</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-ghost btn-sm" onClick={closeMenu}>Admin</Link>
              )}
              <button type="button" className="btn btn-primary btn-sm" onClick={handleLogout}>
                Salir
              </button>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}