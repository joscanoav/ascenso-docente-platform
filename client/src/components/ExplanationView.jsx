import { parseExplanation } from '../utils/explanationParser';

// Strips the leading "La respuesta correcta es X porque" / "X es incorrecta
// porque" lead-in so we can show the letter as its own badge instead of
// repeating it inline. Never touches anything after that lead-in.
function stripLeadIn(text, re) {
  const m = re.exec(text);
  if (!m) return text;
  return text.slice(m.index + m[0].length).trim();
}

const CORRECT_LEADIN_RE = /La respuesta correcta es\s+[A-D]\s+porque/i;
const INCORRECT_LEADIN_RE = /^[A-D]\s+es incorrecta porque/i;

export default function ExplanationView({ text }) {
  const parsed = parseExplanation(text);

  if (!parsed.ok) {
    // Safe fallback: old-format or unexpected explanations are shown as
    // plain text, with line breaks preserved, never breaking the layout.
    return (
      <div className="explanation-box">
        <p className="explanation-fallback">{parsed.raw}</p>
      </div>
    );
  }

  const correctBody = stripLeadIn(parsed.correctBlock, CORRECT_LEADIN_RE);

  return (
    <div className="explanation-box">
      <section className="exp-section exp-correct">
        <div className="exp-heading">
          <span className="exp-icon">✅</span>
          <span>Respuesta correcta: <b>{parsed.correctLetter}</b></span>
        </div>
        <p className="exp-body">{correctBody}</p>
      </section>

      {parsed.incorrectBlocks.length > 0 && (
        <section className="exp-section exp-incorrect">
          <div className="exp-heading">
            <span className="exp-icon">❌</span>
            <span>Por qué no las otras opciones</span>
          </div>
          <ul className="exp-incorrect-list">
            {parsed.incorrectBlocks.map((b) => (
              <li key={b.letter}>
                <span className="exp-letter-badge">{b.letter}</span>
                <span>{stripLeadIn(b.text, INCORRECT_LEADIN_RE)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {parsed.tip && (
        <section className="exp-section exp-tip">
          <div className="exp-heading">
            <span className="exp-icon">💡</span>
            <span>Tip / Recuerda</span>
          </div>
          <p className="exp-body">{parsed.tip}</p>
        </section>
      )}

      {parsed.passage && (
        <section className="exp-section exp-passage">
          <div className="exp-heading">
            <span className="exp-icon">📘</span>
            <span>Contexto de la pregunta</span>
          </div>
          <p className="exp-body exp-passage-text">{parsed.passage}</p>
        </section>
      )}
    </div>
  );
}
