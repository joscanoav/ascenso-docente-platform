import { useEffect, useRef, useState } from 'react';
import api from '../api/client';

const GREETING = {
  role: 'assistant',
  content:
    '¡Hola! Soy Ada, tu asistente de la plataforma. Puedo ayudarte con dudas sobre el examen, orientarte dentro de la plataforma o darte un empujón de ánimo si lo necesitas. ¿En qué te ayudo?'
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError('');
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    try {
      // Se envían solo los últimos turnos como contexto; el historial no se persiste.
      const history = nextMessages.slice(-7, -1).map(({ role, content }) => ({ role, content }));
      const { data } = await api.post('/chat', { message: text, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo contactar al asistente.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div className="chat-avatar">A</div>
            <div>
              <div className="chat-panel-title">Ada</div>
              <div className="chat-panel-subtitle">Asistente de la plataforma</div>
            </div>
            <button
              type="button"
              className="chat-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="chat-bubble chat-bubble-assistant chat-bubble-typing">
                Ada está escribiendo…
              </div>
            )}
          </div>

          {error && <p className="error-text" style={{ padding: '0 14px' }}>{error}</p>}

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Escribe tu pregunta…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              maxLength={2000}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !input.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}
