import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

// Paleta extraída de tu diseño HTML para diferenciar visualmente los bloques
const BLOCK_COLORS = ['#1B2A4A', '#0F6E56', '#8A6A1F', '#534AB7', '#185FA5', '#993556'];

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
          {/* Tarjeta de Progreso General */}
          <div className="card" style={{ border: '1px solid #ecd8a3', background: '#fbfaf5' }}>
            <div className="flex-between" style={{ marginBottom: 10 }}>
              <h2 style={{ margin: 0, color: 'var(--navy)' }}>Progreso general</h2>
              <span className="badge" style={{ background: '#fff', borderColor: '#ecd8a3' }}>
                {stats.totalAttempts} intentos registrados
              </span>
            </div>
            <div className="progress-bar" style={{ background: 'rgba(232, 195, 106, 0.2)' }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${stats.overallProgress}%`, 
                  background: 'linear-gradient(90deg, var(--gold-dk), var(--gold))' 
                }} 
              />
            </div>
            <p className="muted" style={{ marginTop: 8, marginBottom: 0, fontWeight: 500 }}>
              <span style={{ color: 'var(--gold-dk)', fontWeight: 700 }}>{stats.overallProgress}%</span> de desempeño promedio en tus intentos.
            </p>
          </div>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>Práctica por bloque</h2>
          <div className="block-grid">
            {stats.blocks.map((b, index) => {
              // Asignamos un color único a cada tarjeta de la cuadrícula
              const themeColor = BLOCK_COLORS[index % BLOCK_COLORS.length];
              
              // Lógica de semaforización para el mejor puntaje
              let scoreColor = 'var(--navy)';
              if (b.best >= 75) scoreColor = 'var(--good)';
              else if (b.best >= 50) scoreColor = 'var(--warn)';
              else if (b.best > 0) scoreColor = 'var(--bad)';

              return (
                <div 
                  className="block-card" 
                  key={b.block} 
                  style={{ borderTop: `4px solid ${themeColor}` }}
                >
                  <h3 style={{ color: themeColor }}>{b.label}</h3>
                  <div className="progress-bar" style={{ height: '8px', marginBottom: '8px' }}>
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${b.progress}%`, background: themeColor }} 
                    />
                  </div>
                  
                  <div className="block-stat-row">
                    <span>Intentos</span>
                    <b>{b.attempts}</b>
                  </div>
                  <div className="block-stat-row">
                    <span>Mejor resultado</span>
                    <b style={{ color: scoreColor, fontSize: '14px' }}>{b.best}%</b>
                  </div>
                  <div className="block-stat-row">
                    <span>Promedio</span>
                    <b>{b.average}%</b>
                  </div>
                  
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 12, borderColor: themeColor, color: themeColor }}
                    onClick={() => navigate(`/practice/${b.block}`)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = themeColor;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = themeColor;
                    }}
                  >
                    Practicar bloque
                  </button>
                </div>
              );
            })}
          </div>

          {/* Tarjeta CTA Simulacro */}
          <div className="card" style={{ marginTop: 36, background: 'var(--navy)', color: '#fff', border: 'none' }}>
            <div className="flex-between">
              <div>
                <h2 style={{ margin: 0, color: '#fff' }}>¿Listo para un simulacro completo?</h2>
                <p style={{ color: '#c7cde0', marginBottom: 0, marginTop: '6px', fontSize: '14px' }}>
                  Selección aleatoria de los 6 bloques académicos, con resultado global y desglose.
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-gold" 
                style={{ flexShrink: 0 }}
                onClick={() => navigate('/mock-exam')}
              >
                🔥 Iniciar simulacro
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}