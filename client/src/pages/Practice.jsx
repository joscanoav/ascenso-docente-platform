import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import QuestionCard from '../components/QuestionCard';
import { BLOCK_LABELS } from '../constants';

const DEFAULT_COUNT = 10;

export default function Practice() {
  const { block } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function start() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.post('/practice/start', { block, count: DEFAULT_COUNT });
        setQuestions(data.questions);
        setIndex(0);
        setSelected(null);
        setFeedback(null);
        setAnswers([]);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo iniciar la práctica.');
      } finally {
        setLoading(false);
      }
    }
    start();
  }, [block]);

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
      const { data } = await api.post('/practice/submit', { block, answers });
      navigate('/result', { state: { result: data, mode: 'practice' } });
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el intento.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p className="muted">Cargando preguntas de {BLOCK_LABELS[block]}...</p>
      </div>
    );
  }

  if (error && !questions) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p className="muted">No hay preguntas disponibles para este bloque todavía.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 720 }}>
      <div className="eyebrow">Práctica · {BLOCK_LABELS[block]}</div>
      <h1>Practica {BLOCK_LABELS[block]}</h1>

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
      {submitting && <p className="muted">Guardando tu intento...</p>}
    </div>
  );
}
