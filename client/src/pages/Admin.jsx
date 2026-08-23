import { useEffect, useState, Fragment } from 'react';
import api from '../api/client';

export default function Admin() {
  const [teachers, setTeachers] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/admin/teachers');
        setTeachers(data.teachers);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar la actividad de los profesores.');
      }
    }
    load();
  }, []);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="eyebrow">Panel de administración</div>
      <h1>Actividad de los profesores</h1>

      {error && <p className="error-text">{error}</p>}
      {!teachers && !error && <p className="muted">Cargando...</p>}
      {teachers && teachers.length === 0 && <p className="muted">Todavía no hay profesores registrados.</p>}

      {teachers && teachers.length > 0 && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Profesor</th>
                <th>Correo</th>
                <th>Intentos</th>
                <th>Promedio general</th>
                <th>Última actividad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <Fragment key={t.id}>
                  <tr>
                    <td>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{t.totalAttempts}</td>
                    <td>{t.overallAverage}%</td>
                    <td>{t.lastActivity ? new Date(t.lastActivity).toLocaleDateString('es-PE') : '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                      >
                        {expanded === t.id ? 'Ocultar' : 'Ver bloques'}
                      </button>
                    </td>
                  </tr>
                  {expanded === t.id && (
                    <tr>
                      <td colSpan={6} style={{ background: 'var(--bg)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, padding: '8px 0' }}>
                          {t.blocks.map((b) => (
                            <div key={b.block} style={{ fontSize: 13 }}>
                              <b>{b.label}</b>
                              <div className="muted">Intentos: {b.attempts}</div>
                              <div className="muted">Promedio: {b.average}%</div>
                              <div className="muted">Mejor: {b.best}%</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
