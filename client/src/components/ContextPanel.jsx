import { useState } from 'react';

// Renders the shared passage a question depends on. The caller decides
// WHETHER to render this at all (only when question.contextId exists);
// this component decides HOW to render it once mounted.
//
// Two situations both fall back to the "not available" message, even
// though only one of them is literally contextStatus === 'not_available':
//   1. contextStatus is explicitly 'not_available'.
//   2. The referenced context has no real contextText (happens for the
//      "context_source" / self-contained contexts, where the passage is
//      already inline in the question's own text - contextText is null
//      in the data for those).
export default function ContextPanel({ context, contextStatus }) {
  const [expanded, setExpanded] = useState(true);

  const hasText = Boolean(context && context.contextText && context.contextText.trim());
  const unavailable = contextStatus === 'not_available' || !hasText;

  return (
    <div className="context-panel">
      <div className="context-panel-header">
        <span className="context-panel-title">📘 CONTEXTO</span>
        {!unavailable && (
          <button
            type="button"
            className="context-panel-toggle"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? 'Ocultar contexto ▲' : 'Ver contexto ▼'}
          </button>
        )}
      </div>

      {unavailable ? (
        <p className="context-panel-fallback">📘 Contexto no disponible en los datos</p>
      ) : (
        expanded && <p className="context-panel-text">{context.contextText}</p>
      )}
    </div>
  );
}
