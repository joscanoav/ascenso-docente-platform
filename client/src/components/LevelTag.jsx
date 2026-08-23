// Same 4-tier scale used in the reference diagnostico HTML (LEVELS constant).
const LEVELS = [
  { max: 39, label: 'Necesitas reforzar tu preparación', color: '#A32D2D', bg: '#FCEBEB' },
  { max: 59, label: 'Tienes una base, pero existen áreas importantes por reforzar', color: '#854F0B', bg: '#FAEEDA' },
  { max: 79, label: 'Buen punto de partida, pero todavía existen áreas críticas', color: '#854F0B', bg: '#FAEEDA' },
  { max: 100, label: 'Muy buen nivel de preparación', color: '#0F6E56', bg: '#EAF6F1' }
];

export function getLevel(pct) {
  return LEVELS.find((l) => pct <= l.max) || LEVELS[LEVELS.length - 1];
}

export default function LevelTag({ percentage }) {
  const level = getLevel(percentage);
  return (
    <span className="level-tag" style={{ color: level.color, background: level.bg }}>
      {level.label}
    </span>
  );
}
