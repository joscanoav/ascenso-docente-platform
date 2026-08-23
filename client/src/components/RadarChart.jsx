const RINGS = [25, 50, 75, 100];

function wrapLabel(name) {
  if (name.length <= 14) return name;
  const parts = name.split(' ');
  return parts[0];
}

export default function RadarChart({ categories }) {
  const n = categories.length;
  if (n < 3) return null; // a radar needs at least 3 axes to be legible

  const cx = 200;
  const cy = 190;
  const R = 140;

  const point = (i, radiusPct) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const rr = R * (radiusPct / 100);
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  };

  const dataPoints = categories.map((c, i) => point(i, c.percentage).join(',')).join(' ');

  return (
    <svg viewBox="0 0 400 380" width="100%" height="340" role="img" aria-label="Radar de resultados por bloque">
      {RINGS.map((r) => (
        <polygon
          key={r}
          points={categories.map((_, i) => point(i, r).join(',')).join(' ')}
          fill="none"
          stroke="#E2E6ED"
          strokeWidth="1"
        />
      ))}

      {categories.map((c, i) => {
        const [x2, y2] = point(i, 100);
        const [lx, ly] = (() => {
          const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
          const rr = R + 34;
          return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
        })();
        return (
          <g key={c.label}>
            <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#E2E6ED" strokeWidth="1" />
            <text
              x={lx}
              y={ly}
              fontSize="10.5"
              fill="#6E7591"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {wrapLabel(c.label)}
            </text>
          </g>
        );
      })}

      <polygon points={dataPoints} fill="#E8C36A" fillOpacity="0.35" stroke="#8A6A1F" strokeWidth="2" />

      {categories.map((c, i) => {
        const [x, y] = point(i, c.percentage);
        return <circle key={c.label} cx={x} cy={y} r="3.5" fill="#8A6A1F" />;
      })}
    </svg>
  );
}
