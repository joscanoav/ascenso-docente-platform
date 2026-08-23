import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="eyebrow">Ascenso Docente · Inglés</div>
        <h1>Crea tu cuenta</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Practica con las 300 preguntas oficiales de 2021 a 2025.
        </p>

        <form className="card" onSubmit={handleSubmit}>
          <label className="field">
            Nombre completo
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            Correo electrónico
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            Contraseña
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13.5 }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
