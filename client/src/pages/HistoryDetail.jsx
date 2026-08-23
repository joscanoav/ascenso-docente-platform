import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { OPTION_LETTERS, BLOCK_LABELS } from '../constants';
import ExplanationView from '../components/ExplanationView';
import ContextPanel from '../components/ContextPanel';

export default function HistoryDetail() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/history/${id}`);
        setAttempt(data.attempt);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el detalle.');
      }
    }
    load();
  }, [id]);

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p className="muted">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 760 }}>
      <Link to="/history" className="muted" style={{ fontSize: 13.5 }}>← Volver al historial</Link>
      <div className="eyebrow" style={{ marginTop: 14 }}>
        {attempt.mode === 'mock_exam' ? 'Simulacro' : `Práctica · ${BLOCK_LABELS[attempt.block] || attempt.block}`}
      </div>
      <h1>{attempt.score} / {attempt.totalQuestions} correctas ({attempt.percentage}%)</h1>
      <p className="muted">{new Date(attempt.date).toLocaleString('es-PE')}</p>

      {attempt.answers.map((a, i) => {
        const q = a.question;
        if (!q) return null;
        return (
          <div className="card" key={i}>
            <div className="flex-between" style={{ marginBottom: 10 }}>
              <span className="q-counter">Pregunta {i + 1}</span>
              <span style={{ display: 'flex', gap: 6 }}>
                {q._needsReview && (
                  <span className="badge" title="Contenido pendiente de revisión editorial">
                    ⚠ En revisión
                  </span>
                )}
                <span className="badge">{BLOCK_LABELS[q.block] || q.block}</span>
              </span>
            </div>
            {q.contextId && (
              <ContextPanel context={q.context} contextStatus={q.contextStatus} />
            )}

            <h3 style={{ fontWeight: 400, marginBottom: 16 }}>{q.text}</h3>

            {q.options.map((opt, oi) => {
              let cls = 'opt disabled';
              if (oi === a.correctAnswer) cls += ' correct';
              else if (oi === a.selected) cls += ' incorrect';
              return (
                <div className={cls} key={oi}>
                  <span className="opt-letter">{OPTION_LETTERS[oi]}</span>
                  <span className="opt-text">{opt}</span>
                </div>
              );
            })}

            <div className={`feedback-box ${a.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="fb-title">{a.isCorrect ? '✓ Respondiste correctamente' : '✗ Respuesta incorrecta'}</div>
            </div>
            <ExplanationView text={q.explanation} />
            <p className="q-source">Fuente: {q.legacyId}</p>
          </div>
        );
      })}
    </div>
  );
}
