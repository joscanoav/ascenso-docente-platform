import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/history/stats/dashboard');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudieron cargar tus estadísticas.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="eyebrow">Panel del profesor</div>
      <h1>Hola, {user?.name?.split(' ')[0]}</h1>
      <p className="muted" style={{ marginBottom: 28 }}>
        Aquí está tu progreso general de preparación para el Ascenso Docente de Inglés.
      </p>

      {loading && <p className="muted">Cargando tu progreso...</p>}
      {error && <p className="error-text">{error}</p>}

      {stats && (
        <>
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>Progreso general</h2>
              <span className="badge">{stats.totalAttempts} intentos registrados</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${stats.overallProgress}%` }} />
            </div>
            <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
              {stats.overallProgress}% de desempeño promedio en tus intentos.
            </p>
          </div>

          <h2 style={{ marginTop: 30 }}>Práctica por bloque</h2>
          <div className="block-grid">
            {stats.blocks.map((b) => (
              <div className="block-card" key={b.block}>
                <h3>{b.label}</h3>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${b.progress}%` }} />
                </div>
                <div className="block-stat-row">
                  <span>Intentos</span>
                  <b>{b.attempts}</b>
                </div>
                <div className="block-stat-row">
                  <span>Mejor resultado</span>
                  <b>{b.best}%</b>
                </div>
                <div className="block-stat-row">
                  <span>Promedio</span>
                  <b>{b.average}%</b>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 8 }}
                  onClick={() => navigate(`/practice/${b.block}`)}
                >
                  Practicar
                </button>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 30 }}>
            <div className="flex-between">
              <div>
                <h2 style={{ margin: 0 }}>¿Listo para un simulacro completo?</h2>
                <p className="muted" style={{ marginBottom: 0 }}>
                  Selección aleatoria de los 6 bloques académicos, con resultado global y desglose.
                </p>
              </div>
              <button type="button" className="btn btn-gold" onClick={() => navigate('/mock-exam')}>
                Iniciar simulacro
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
