import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'Banco oficial 2021–2025',
    body: '300 preguntas verificadas contra los exámenes reales del Concurso de Ascenso Docente, con 55 pasajes de contexto compartido.'
  },
  {
    title: 'Feedback pedagógico inmediato',
    body: 'Cada respuesta se corrige al instante con retroalimentación estructurada: por qué es correcta, por qué no las otras y un tip para recordar.'
  },
  {
    title: 'Simulacro cronometrado',
    body: 'Practica en condiciones reales de examen y evita repetir preguntas casi idénticas gracias al control de duplicados por año.'
  },
  {
    title: 'Progreso por bloque',
    body: 'Historial y panel de resultados por bloque y subtema, para saber exactamente dónde reforzar antes del examen.'
  }
];

export default function Landing() {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="container landing-hero-inner">
          <div className="eyebrow">Concurso de Ascenso Docente · Inglés</div>
          <h1 className="landing-h1">
            Practica con el examen real,<br />no con adivinanzas.
          </h1>
          <p className="landing-lede">
            300 preguntas oficiales verificadas, retroalimentación pedagógica al instante y un
            panel de progreso que te dice exactamente qué reforzar antes del examen.
          </p>
          <div className="landing-cta-row">
            <Link to="/login" className="btn btn-primary btn-lg">
              Ingresa a la plataforma
            </Link>
            <Link to="/register" className="btn btn-ghost btn-lg">
              Crear una cuenta
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-stats">
        <div className="container landing-stats-inner">
          <div className="landing-stat">
            <div className="landing-stat-num">300</div>
            <div className="landing-stat-label">Preguntas oficiales</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-num">2021–25</div>
            <div className="landing-stat-label">Bancos cubiertos</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-num">55</div>
            <div className="landing-stat-label">Pasajes de contexto</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-num">100%</div>
            <div className="landing-stat-label">Feedback verificado</div>
          </div>
        </div>
      </section>

      <section className="container landing-features">
        <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Qué encuentras dentro</h2>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="card landing-feature-card">
              <h3>{f.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-closing">
        <div className="container landing-closing-inner">
          <h2>Tu próximo intento empieza aquí</h2>
          <p className="muted" style={{ maxWidth: 480, margin: '0 auto 22px' }}>
            Crea tu cuenta gratis y arranca tu primer simulacro en menos de dos minutos.
          </p>
          <Link to="/register" className="btn btn-gold btn-lg">
            Empezar ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
