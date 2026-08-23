# Ascenso Docente — Plataforma de Práctica (Inglés)

Plataforma de práctica para el Concurso de Ascenso Docente de Inglés, con el banco oficial
**2021–2025 (300 preguntas)**, retroalimentación pedagógica estructurada visualmente,
landing page pública y asistente virtual con IA.

---

## Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB Atlas + Mongoose
- **Auth:** JWT + bcryptjs
- **IA:** Groq API (`openai/gpt-oss-20b`) — asistente virtual "Teach"
- **Despliegue:** Render (un solo servicio; Express sirve el build de React)

---

## Estructura del proyecto

```
.
├── server/                     # Backend Express
│   ├── config/db.js            # Conexión a MongoDB
│   ├── models/                 # Question, Context, User, Attempt
│   ├── middleware/auth.js      # JWT + control de roles
│   ├── routes/                 # auth, questions, practice, mockExam, history, admin, chat
│   ├── seed/
│   │   ├── data/bank.json      # Banco completo: { meta, contexts, questions }
│   │   ├── seed.js             # Seed idempotente (upsert por legacyId)
│   │   └── createAdmin.js      # Script para crear/promover un admin
│   └── index.js                # Punto de entrada del servidor
├── client/                     # Frontend React + Vite
│   └── src/
│       ├── pages/              # Landing, Login, Register, Dashboard, Practice, MockExam, Result, History, Admin
│       ├── components/         # Header, ChatWidget, QuestionCard, RadarChart, BarChart, LevelTag, ContextPanel...
│       └── styles/theme.css    # Identidad visual (navy + dorado)
├── render.yaml
├── .env.example
└── package.json
```

---

## 1. Instalación local

Requisitos: Node.js 18+, una base de datos en MongoDB Atlas (o local).

```bash
# Clona o descomprime el proyecto y entra en la carpeta
cd ascenso-docente-platform

# Instala las dependencias del backend
npm install

# Instala las dependencias del frontend
npm run client:install
```

---

## 2. Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

```
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/ascenso-docente?retryWrites=true&w=majority
JWT_SECRET=una-cadena-larga-y-aleatoria
PORT=5000
NODE_ENV=development
GROQ_API_KEY=tu-clave-de-groq
```

> **Obtén tu `GROQ_API_KEY` gratis** en [console.groq.com](https://console.groq.com). Es necesaria para activar el asistente virtual "Teach".

---

## 3. Cargar las preguntas (seed)

El seed es **idempotente**: usa `legacyId` (`"2023-Q1"`, `"2025-Q45"`, etc.) como clave de
upsert, así que puedes ejecutarlo tantas veces como quieras sin duplicar preguntas.

```bash
npm run seed
```

Si alguna vez necesitas vaciar la colección de preguntas antes de recargarla:

```bash
npm run seed:reset
```

---

## 4. Crear el usuario administrador

```bash
node server/seed/createAdmin.js "Tu Nombre" admin@ejemplo.com unaContrasenaSegura
```

Si el correo ya existe como usuario `student`, el script simplemente lo promueve a `admin`.

---

## 5. Desarrollo local

En una terminal, levanta el backend:

```bash
npm run server:dev
```

En otra terminal, levanta el frontend (con proxy automático a `/api`):

```bash
cd client
npm run dev
```

Abre `http://localhost:5173`.

---

## 6. Build de producción

```bash
npm run build
npm start
```

Esto compila el frontend (`client/dist`) y Express lo sirve como estático desde el mismo
servidor, en una sola URL.

---

## 7. Despliegue en Render

1. Sube este proyecto a un repositorio de GitHub.
2. En Render, crea un **Web Service** apuntando al repositorio (o usa el `render.yaml` incluido
   con "New +" → "Blueprint").
3. Configura las variables de entorno en el panel de Render:
   - `MONGODB_URI` (tu cadena de conexión de Atlas)
   - `JWT_SECRET` (Render puede generarlo automáticamente si usas el blueprint)
   - `NODE_ENV=production`
   - `GROQ_API_KEY` (tu clave de [console.groq.com](https://console.groq.com))
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Una vez desplegado, conéctate por SSH o usa el Shell de Render para correr una sola vez:

```bash
npm run seed
node server/seed/createAdmin.js "Tu Nombre" admin@ejemplo.com unaContrasenaSegura
```

---

## Landing page

La ruta pública `/` muestra una landing page con:

- **Hero centrado** con copy de conversión, badges de confianza y CTA principal.
- **Tarjeta del profesor** con foto, nombre y especialidad.
- **Caja de confianza** explicando la fuente de las preguntas (exámenes oficiales MINEDU).
- **Franja de estadísticas**: 300 preguntas, 5 años cubiertos, 55 pasajes de contexto, 100% feedback verificado.
- **Grid de features**: banco oficial, feedback pedagógico inmediato, simulacro cronometrado, progreso por bloque.
- **Cierre con CTA** dorado que lleva al login.

Si el usuario ya tiene sesión activa, `/` redirige automáticamente a `/dashboard`.

---

## Chat IA — "Teach"

Widget flotante (abajo-derecha) visible **solo para usuarios autenticados**.

- **Proveedor:** Groq API (`openai/gpt-oss-20b`).
- **Rol:** Teacher Trainer experto en Didáctica del Inglés (EFL/ELT). Resuelve dudas sobre metodología, orienta dentro de la plataforma y da apoyo motivacional.
- **Seguridad de contenido:**
  - Nunca revela ni inventa la respuesta correcta de una pregunta del banco.
  - No inventa leyes ni fechas del MINEDU.
  - No alucina con siglas; si desconoce una, pide aclaración.
- **Historial:** vive en el cliente (no se persiste en MongoDB). Se envían los últimos 6 turnos como contexto para mantener coherencia conversacional sin disparar costo.
- **Formato:** respuestas en español (salvo ejemplos en inglés), texto plano sin markdown, máximo 1 emoji por mensaje, 2–4 oraciones cortas por defecto.

---

## Modelo de datos y reglas de negocio

- **300 preguntas**, verificadas contra los exámenes oficiales del Concurso de Ascenso Docente de Inglés (2021–2025).
- **Anti-duplicados:** 5 pares de preguntas casi idénticas entre 2023 y 2025 (mismo audio/contexto de listening) comparten un `duplicateGroupId`. El simulacro agrupa por `{ $ifNull: ["$duplicateGroupId", "$_id"] }` antes de muestrear al azar, así nunca aparecen ambas versiones del mismo par en un mismo simulacro.
- **Feedback inmediato:** a diferencia del diagnóstico HTML original (que mostraba resultados solo al final), aquí cada respuesta se corrige al instante contra el backend, sin exponer `correctAnswer` al frontend hasta que el usuario responde.

---

## Retroalimentación pedagógica estructurada

`client/src/utils/explanationParser.js` detecta, sin modificar el texto original, la estructura de cada `explanation`:

```
La respuesta correcta es X porque...   → bloque "✅ Respuesta correcta"
X es incorrecta porque...              → bloques "❌ Por qué no las otras opciones"
TIP / RECUERDA: ...                    → tarjeta "💡 Tip / Recuerda"
```

`client/src/components/ExplanationView.jsx` renderiza esa estructura como tarjetas separadas con jerarquía visual. Si una explicación no sigue el patrón (formato antiguo o inesperado), cae automáticamente a un párrafo de texto plano — nunca rompe la interfaz.

---

## Contextos compartidos (pasajes que varias preguntas comparten)

El banco incluye una colección separada `contexts` (55 pasajes) enlazada a las preguntas mediante `contextId` (string, no `ObjectId`). Cambios:

- **Archivo de datos:** `server/seed/data/bank.json`, con la forma `{ meta, contexts, questions }` en vez de un array plano. `seed.js` hace upsert de ambas colecciones (contexts primero, luego questions), sigue siendo idempotente.
- **Modelo nuevo:** `server/models/Context.js` (`contextId`, `contextType`, `contextText`, `memberLegacyIds`).
- **Modelo actualizado:** `Question.js` agrega `contextId`, `contextRole` (`standalone` | `member` | `context_source`) y `contextStatus`, más un virtual `context` que hace `populate()` posible aunque el enlace sea por `contextId` (string) y no por `_id`.
- **Rutas con `$lookup`:** `practice.js` y `mockExam.js` usan `Question.aggregate(...)`, que no soporta `.populate()`, así que el contexto se une con una etapa `$lookup` sobre la colección `contexts` antes de proyectar el resultado.
- **Ruta con `populate` anidado:** `history.js` sí usa `Mongoose.populate()` normal (no aggregate), así que usa el virtual: `.populate({ path: 'answers.question', populate: { path: 'context' } })`.
- **Frontend:** `ContextPanel.jsx` se muestra encima de la pregunta solo si `question.contextId` existe. Si el contexto referenciado no tiene `contextText` real (pasa en 11 de los 55 contextos, los de tipo `situation_implicit_selfcontained`, donde el pasaje ya está dentro del propio enunciado) o si `contextStatus === 'not_available'`, se muestra el fallback "📘 Contexto no disponible en los datos" en vez de un panel vacío.

---

## Notas de verificación del contenido académico

Al construir el seed se verificó el contenido real de los DOCX (no solo se asumió la distribución declarada):

- Los 300 registros (60 por año) coinciden con la distribución esperada por bloque.
- Las 60 respuestas correctas de 2023 se validaron contra la tabla oficial de respuestas que aparece al final de ese documento: coinciden el 100%.
- Los 5 pares de duplicados fueron confirmados manualmente (mismo contexto/audio reutilizado).
- `2023-Q41` usa letras de alternativa en minúscula en el documento original (`a:`, `b:`, `c:`) mientras el resto usa mayúsculas; se manejó de forma insensible a mayúsculas sin alterar el contenido.
- En 15 preguntas de cloze de 2025 (bloques GRAMMAR/VOCABULARY), el documento original repite las alternativas dos veces (una vez como texto plano antes del enunciado, otra vez en la lista con viñetas). Se eliminó únicamente la repetición del texto plano en el campo `text`; las alternativas reales siguen viniendo intactas del documento en el arreglo `options`.

Ninguna pregunta, alternativa, respuesta correcta o retroalimentación fue modificada, completada o corregida en su contenido — solo se normalizó el formato/estructura para adaptarlo al modelo de datos.

> **Auditoría pendiente:** las preguntas de 2021, 2022 y 2024 vienen marcadas con `_needsReview: true` en la base de datos como recordatorio de que ese contenido no ha sido re-verificado contra una fuente primaria; ese flag se muestra como una pequeña etiqueta "⚠ En revisión" en el detalle del historial, sin afectar la funcionalidad del examen.
