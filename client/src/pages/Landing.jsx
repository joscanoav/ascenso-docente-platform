import { Link } from 'react-router-dom';
import jorgePhoto from '../assets/foto.png'; 

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
      <section className="container" style={{ paddingTop: '56px', paddingBottom: '64px' }}>
        <div className="hero" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div className="hero-badge">
            <span className="dot"></span> Plataforma Premium · Ascenso Docente
          </div>
          
          {/* Título más ancho y con mayor tamaño */}
          <h1 style={{ maxWidth: '800px', margin: '0 auto 16px', fontSize: '2.8rem', lineHeight: '1.2' }}>
            ¿Estás realmente preparado para tu examen de Ascenso Docente?
          </h1>
          
          {/* Copywriter nivel capacitador y contenedor más amplio */}
          <p className="lede" style={{ maxWidth: '760px', margin: '0 auto 32px', fontSize: '1.15rem' }}>
            Eleva tu nivel con práctica estratégica basada en evidencia. Diagnostica tu dominio de la especialidad y optimiza tu tiempo de estudio con 300 preguntas oficiales verificadas y retroalimentación pedagógica al instante.
          </p>
          
          <div className="badge-row" style={{ justifyContent: 'center', marginBottom: '36px' }}>
            <span className="badge">300 preguntas oficiales</span>
            <span className="badge">Feedback inmediato</span>
            <span className="badge">Control de progreso</span>
          </div>
          
          <Link to="/login" className="btn btn-primary btn-lg">
            Ingresar a la plataforma
          </Link>
        </div>

        {/* Tarjeta de Profesor ampliada a 800px */}
        <div className="prof-card" style={{ maxWidth: '800px', margin: '48px auto 0', textAlign: 'left' }}>
          <div className="prof-photo-wrap">
            <img className="prof-photo" src={jorgePhoto} alt="Jorge Oscanoa" />
          </div>
          <div className="prof-copy">
            <div className="prof-eyebrow">Tu preparación tiene un profesor detrás</div>
            <p className="prof-name">Jorge Oscanoa</p>
            <p className="prof-role">Ingeniero de Software · Docente · Especialista en EdTech e IA aplicada a la educación.</p>
          </div>
        </div>

        {/* Caja de Confianza ampliada a 800px */}
        <div className="trust-box" style={{ maxWidth: '800px', margin: '28px auto 0', textAlign: 'left' }}>
          <h2 className="serif">¿En qué se basa esta plataforma?</h2>
          <p>
            Las preguntas de esta plataforma proceden literalmente de los exámenes oficiales del Concurso de Ascenso Docente de Inglés (2021-2025), sin modificar enunciados ni alternativas. Es una herramienta diseñada para ayudarte a identificar patrones de fortaleza y áreas de mejora con total precisión.
          </p>
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

      <section className="container landing-features" style={{ paddingTop: '64px' }}>
        <h2 className="serif" style={{ textAlign: 'center', marginBottom: 32 }}>Qué encuentras dentro</h2>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="card landing-feature-card">
              <h3 className="serif">{f.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-closing" style={{ background: '#fff', borderTop: '1px solid var(--line)', padding: '64px 24px', textAlign: 'center', marginTop: '48px' }}>
        <div className="container">
          <h2 className="serif">Tu próximo intento empieza aquí</h2>
          <p className="muted" style={{ maxWidth: 480, margin: '0 auto 24px' }}>
            Accede con las credenciales proporcionadas tras tu matrícula y arranca tu primer simulacro.
          </p>
          <Link to="/login" className="btn btn-gold btn-lg">
            Ir al inicio de sesión
          </Link>
        </div>
      </section>
    </div>
  );
}