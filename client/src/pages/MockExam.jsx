import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import QuestionCard from '../components/QuestionCard';

export default function MockExam() {
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(20);
  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleStart() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/mock-exam/start', { count });
      setQuestions(data.questions);
      setIndex(0);
      setSelected(null);
      setFeedback(null);
      setAnswers([]);
      setStarted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo iniciar el simulacro.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheck() {
    const question = questions[index];
    try {
      const { data } = await api.post(`/questions/${question._id}/check`, { selected });
      setFeedback(data);
      setAnswers((prev) => [...prev, { questionId: question._id, selected }]);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo verificar la respuesta.');
    }
  }

  async function handleNext() {
    const isLast = index === questions.length - 1;
    if (!isLast) {
      setIndex((i) => i + 1);
      setSelected(null);
      setFeedback(null);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/mock-exam/submit', { answers });
      navigate('/result', { state: { result: data, mode: 'mock_exam' } });
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el simulacro.');
      setSubmitting(false);
    }
  }

  if (!started) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 640 }}>
        <div className="eyebrow">Simulacro completo</div>
        <h1>Simulacro de Ascenso Docente</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Selección aleatoria entre los 6 bloques académicos. Las preguntas con pares duplicados
          entre convocatorias nunca aparecen juntas en el mismo simulacro.
        </p>

        <div className="card">
          <label className="field">
            Número de preguntas
            <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
              <option value={20}>20 preguntas (rápido)</option>
              <option value={60}>60 preguntas (simulacro completo)</option>
            </select>
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="button" className="btn btn-primary btn-block" onClick={handleStart} disabled={loading}>
            {loading ? 'Preparando simulacro...' : 'Comenzar simulacro'}
          </button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p className="muted">No hay preguntas disponibles para armar el simulacro.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 720 }}>
      <div className="eyebrow">Simulacro en curso</div>
      <h1>Simulacro de Ascenso Docente</h1>

      <QuestionCard
        question={questions[index]}
        index={index}
        total={questions.length}
        selected={selected}
        feedback={feedback}
        onSelect={setSelected}
        onCheck={handleCheck}
        onNext={handleNext}
        isLast={index === questions.length - 1}
      />

      {error && <p className="error-text">{error}</p>}
      {submitting && <p className="muted">Calculando tu resultado...</p>}
    </div>
  );
}
