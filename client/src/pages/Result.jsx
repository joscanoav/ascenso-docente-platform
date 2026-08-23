import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import RadarChart from '../components/RadarChart';
import BarChart from '../components/BarChart';
import LevelTag from '../components/LevelTag';
import { BLOCK_LABELS } from '../constants';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [viz, setViz] = useState('radar');

  const { result, mode } = location.state || {};

  if (!result) {
    return <Navigate to="/dashboard" replace />;
  }

  const isMockExam = mode === 'mock_exam';
  const categories = isMockExam
    ? result.blockBreakdown.map((b) => ({ label: BLOCK_LABELS[b.block] || b.block, percentage: b.percentage }))
    : [];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 720 }}>
      <div className="result-hero">
        <div className="eyebrow">{isMockExam ? 'Resultado del simulacro' : 'Resultado de la práctica'}</div>
        <div className="score-wrap">
          <span className="score-num">{result.score}</span>
          <span className="score-den">/ {result.totalQuestions}</span>
        </div>
        <div className="score-pct">{result.percentage}% de respuestas correctas</div>
        <LevelTag percentage={result.percentage} />
      </div>

      {isMockExam && categories.length > 0 && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Desglose por bloque</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`btn btn-sm ${viz === 'radar' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViz('radar')}
              >
                Radar
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viz === 'bars' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViz('bars')}
              >
                Barras
              </button>
            </div>
          </div>

          {viz === 'radar' ? <RadarChart categories={categories} /> : <BarChart categories={categories} />}
        </div>
      )}

      <div className="flex-between" style={{ marginTop: 24 }}>
        <Link to="/history" className="btn btn-ghost">Ver historial completo</Link>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Volver al dashboard
        </button>
      </div>
    </div>
  );
}
