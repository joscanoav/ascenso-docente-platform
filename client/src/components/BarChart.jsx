const COLORS = ['#1B2A4A', '#0F6E56', '#8A6A1F', '#993C1D', '#534AB7', '#185FA5', '#993556'];

export default function BarChart({ categories }) {
  return (
    <div>
      {categories.map((c, i) => (
        <div className="bar-row" key={c.label}>
          <div className="bar-label">{c.label}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${c.percentage}%`, background: COLORS[i % COLORS.length] }}
            />
          </div>
          <div className="bar-pct">{c.percentage}%</div>
        </div>
      ))}
    </div>
  );
}
