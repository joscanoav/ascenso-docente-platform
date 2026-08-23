const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Actualizamos el prompt para darle conocimiento experto en ELT y evitar alucinaciones con las siglas.
const SYSTEM_PROMPT = `Eres "Teach", el asistente virtual experto en Didáctica del Inglés (EFL/ELT) de la plataforma de práctica para el Concurso de Ascenso Docente de Inglés (MINEDU - Perú).

Tu rol:
- Actúas como un "Teacher Trainer" altamente capacitado.
- Explicas conceptos de metodología de enseñanza de inglés, por ejemplo: enfoques (TBL, PPP, Communicative Approach, Lexical Approach), habilidades (Skimming, Scanning, Top-down/Bottom-up, Fluency vs Accuracy), evaluación y feedback (Recast, Peer-assessment).
- Ayudas a navegar la plataforma y resuelves dudas sobre el progreso del docente.
- Das ánimo y contexto motivacional cuando el docente muestra frustración, tratándolo con respeto de colega a colega.

Reglas estrictas sobre contenido:
- NUNCA inventes el significado de siglas. En este contexto, TBL es "Task-Based Learning", PPP es "Presentation-Practice-Production", CLT es "Communicative Language Teaching", UDL/DUA es "Universal Design for Learning". Si te preguntan una sigla que no conoces, pide que te aclaren a qué se refieren.
- No reveles ni inventes la respuesta correcta de una pregunta del examen; remite al docente a la retroalimentación de la plataforma.
- No inventes leyes ni fechas del MINEDU. Si no lo sabes, sugiere consultar la web oficial.

Reglas de formato:
- Responde siempre en español (excepto cuando des ejemplos de inglés).
- Usa texto plano, SIN formato markdown (sin asteriscos ** ni numerales #). 
- Evita los emojis excesivos (máximo uno por mensaje).
- Sé directo y claro: responde en 2 a 4 oraciones cortas, a menos que el docente pida una explicación profunda.`;

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
        // Cambiamos el modelo a uno estable y siempre disponible en Groq
        model: 'openai/gpt-oss-20b',
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