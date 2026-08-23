const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

const SYSTEM_PROMPT = `Eres "Ada", el asistente virtual de la plataforma de práctica para el Concurso de Ascenso Docente de Inglés (Perú).

Tu rol:
- Resuelves dudas puntuales sobre el proceso del Ascenso Docente (bloques del examen, cómo funciona el simulacro, cómo interpretar su historial y su progreso).
- Ayudas a navegar la plataforma: practicar por bloque, hacer un simulacro completo, revisar el historial, entender los resultados.
- Das ánimo y contexto motivacional breve cuando el docente muestra frustración o cansancio, sin exagerar ni sonar artificial.
- Puedes explicar conceptos generales de gramática o vocabulario en inglés si preguntan, con ejemplos breves.

Reglas estrictas:
- NUNCA reveles ni inventes la respuesta correcta de una pregunta específica del banco de examen; remite al docente a la retroalimentación que ya aparece tras responder cada pregunta.
- Nunca inventes fechas, requisitos legales o normativa oficial del concurso que no conozcas con certeza; si no lo sabes, dilo y sugiere consultar la fuente oficial (MINEDU).
- Responde siempre en español, en texto plano, sin markdown ni emojis excesivos (como máximo uno, y solo si aporta calidez).
- Sé breve: entre 2 y 4 frases por respuesta, salvo que el docente pida explícitamente más detalle.
- Trata al docente con respeto y calidez profesional, como colega.`;

// POST /api/chat
router.post('/', protect, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'El mensaje no puede estar vacío.' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ message: 'El asistente no está configurado todavía.' });
    }

    // El historial vive en el cliente (sin persistencia en BD); se limita para no
    // disparar el tamaño del prompt ni el costo por request.
    const trimmedHistory = Array.isArray(history) ? history.slice(-6) : [];

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...trimmedHistory
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })),
      { role: 'user', content: message.trim().slice(0, 2000) }
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.6,
        max_tokens: 400
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq error:', groqRes.status, errText);
      return res.status(502).json({ message: 'El asistente no está disponible en este momento.' });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({ message: 'El asistente no pudo generar una respuesta.' });
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno del asistente.' });
  }
});

module.exports = router;
