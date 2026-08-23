import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="eyebrow">Bienvenido de vuelta</div>
        <h1>Inicia sesión</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Continúa practicando para tu Ascenso Docente de Inglés.
        </p>

        <form className="card" onSubmit={handleSubmit}>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Mensaje informativo reemplazando el enlace de registro */}
        <p style={{ textAlign: 'center', fontSize: 13.5, marginTop: '20px', color: 'var(--muted)' }}>
          El acceso a la plataforma es exclusivo para alumnos matriculados.<br/>
          <strong style={{ color: 'var(--navy)' }}>Tus credenciales te serán enviadas por WhatsApp o correo.</strong>
        </p>
      </div>
    </div>
  );
}