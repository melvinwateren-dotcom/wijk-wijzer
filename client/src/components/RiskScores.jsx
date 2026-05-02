const CATEGORIES = [
  {
    key: 'veiligheid',
    label: 'Veiligheid',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'milieu',
    label: 'Milieu',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22c4-4 8-7 8-12A8 8 0 004 10c0 5 4 8 8 12z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 10v6M9 13h6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'voorzieningen',
    label: 'Voorzieningen',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round"/>
        <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'leefbaarheid',
    label: 'Leefbaarheid',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'overlast',
    label: 'Overlast',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
      </svg>
    ),
  },
];

function getScoreColor(score) {
  if (score == null) return '#9ca3af';
  if (score >= 8) return '#16a34a';
  if (score > 6.5) return '#22c55e';
  if (score >= 5) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score) {
  if (score == null) return 'Geen data';
  if (score >= 8) return 'Uitstekend';
  if (score > 6.5) return 'Goed';
  if (score >= 5) return 'Voldoende';
  return 'Onvoldoende';
}

function RiskScores({ data }) {
  const overall = data.overallScore ?? data.overall ?? null;
  const categories = data.categories || {};

  return (
    <div className="card">
      <div className="card__header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3 className="card__title">Risicoscores</h3>
      </div>
      <div className="card__body">
        {overall != null && (
          <div className="risk-overall">
            <div
              className="risk-overall__circle"
              style={{ borderColor: getScoreColor(overall) }}
            >
              <span className="risk-overall__number">{overall.toFixed(1)}</span>
              <span className="risk-overall__label">Totaal</span>
            </div>
            <p className="risk-overall__verdict" style={{ color: getScoreColor(overall) }}>
              {getScoreLabel(overall)}
            </p>
          </div>
        )}

        <div className="risk-list">
          {CATEGORIES.map((cat) => {
            const catData = categories[cat.key];
            const score = catData?.score ?? null;
            const color = getScoreColor(score);
            const pct = score != null ? (score / 10) * 100 : 0;

            return (
              <div key={cat.key} className="risk-item">
                <div className="risk-item__header">
                  <div className="risk-item__label">
                    <span className="risk-item__icon" style={{ color }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <span className="risk-item__score" style={{ color }}>
                    {score != null ? score.toFixed(1) : '-'}
                  </span>
                </div>
                <div className="risk-item__bar">
                  <div
                    className="risk-item__bar-fill"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RiskScores;
