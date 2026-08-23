import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { BLOCK_LABELS } from '../constants';

export default function History() {
  const [attempts, setAttempts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/history');
        setAttempts(data.attempts);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el historial.');
      }
    }
    load();
  }, []);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="eyebrow">Tu historial</div>
      <h1>Historial de intentos</h1>

      {error && <p className="error-text">{error}</p>}
      {!attempts && !error && <p className="muted">Cargando...</p>}
      {attempts && attempts.length === 0 && (
        <p className="muted">Todavía no tienes intentos registrados. ¡Empieza a practicar!</p>
      )}

      {attempts && attempts.length > 0 && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Bloque</th>
                <th>Resultado</th>
                <th>%</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a._id}>
                  <td>{new Date(a.date).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td>{a.mode === 'mock_exam' ? 'Simulacro' : 'Práctica'}</td>
                  <td>{a.block ? BLOCK_LABELS[a.block] || a.block : 'Todos'}</td>
                  <td>{a.score} / {a.totalQuestions}</td>
                  <td>{a.percentage}%</td>
                  <td>
                    <Link to={`/history/${a._id}`} className="btn btn-ghost btn-sm">Ver detalle</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
