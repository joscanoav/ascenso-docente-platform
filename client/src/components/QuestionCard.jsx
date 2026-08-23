import { OPTION_LETTERS, BLOCK_LABELS } from '../constants';
import ExplanationView from './ExplanationView';
import ContextPanel from './ContextPanel';

export default function QuestionCard({
  question,
  index,
  total,
  selected,
  feedback,
  onSelect,
  onCheck,
  onNext,
  isLast
}) {
  const answered = feedback !== null && feedback !== undefined;

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: 10 }}>
        <span className="q-counter">Pregunta {index + 1} de {total}</span>
        <span className="badge">{BLOCK_LABELS[question.block] || question.block}</span>
      </div>

      {question.contextId && (
        <ContextPanel context={question.context} contextStatus={question.contextStatus} />
      )}

      <h3 style={{ marginBottom: 18, fontWeight: 400, lineHeight: 1.5 }}>{question.text}</h3>

      {question.options.map((opt, i) => {
        let cls = 'opt';
        if (answered) {
          cls += ' disabled';
          if (i === feedback.correctAnswer) cls += ' correct';
          else if (i === selected && !feedback.isCorrect) cls += ' incorrect';
        } else if (selected === i) {
          cls += ' selected';
        }

        return (
          <div
            key={i}
            className={cls}
            onClick={() => !answered && onSelect(i)}
          >
            <span className="opt-letter">{OPTION_LETTERS[i]}</span>
            <span className="opt-text">{opt}</span>
          </div>
        );
      })}

      {answered && (
        <>
          <div className={`feedback-box ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="fb-title">{feedback.isCorrect ? '✓ ¡Correcto!' : '✗ Incorrecto'}</div>
          </div>
          <ExplanationView text={feedback.explanation} />
        </>
      )}

      <div style={{ marginTop: 16 }}>
        {!answered ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={selected === null || selected === undefined}
            onClick={onCheck}
          >
            Comprobar respuesta
          </button>
        ) : (
          <button type="button" className="btn btn-gold" onClick={onNext}>
            {isLast ? 'Ver resultado' : 'Siguiente pregunta'}
          </button>
        )}
      </div>
    </div>
  );
}
