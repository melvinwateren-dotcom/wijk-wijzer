const STAT_CONFIG = [
  {
    key: 'bpiTotaal',
    label: 'Aantal inwoners',
    format: (v) => v?.toLocaleString('nl-NL') ?? 'Onbekend',
    barMax: 50000,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'gemiddeldInkomen',
    label: 'Gem. inkomen',
    format: (v) => v != null ? `€ ${v.toLocaleString('nl-NL')}` : 'Onbekend',
    barMax: 60000,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" strokeLinecap="round"/>
        <path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'gemiddeldeWoningwaarde',
    label: 'Gem. WOZ-waarde',
    format: (v) => v != null ? `€ ${v.toLocaleString('nl-NL')}` : 'Onbekend',
    barMax: 600000,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'afstandSupermarkt',
    label: 'Afstand supermarkt',
    format: (v) => v != null ? `${v.toFixed(1)} km` : 'Onbekend',
    barMax: 5,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="21" r="1" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'afstandHuisarts',
    label: 'Afstand huisarts',
    format: (v) => v != null ? `${v.toFixed(1)} km` : 'Onbekend',
    barMax: 5,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'afstandSchool',
    label: 'Afstand basisschool',
    format: (v) => v != null ? `${v.toFixed(1)} km` : 'Onbekend',
    barMax: 5,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

// Simple comparison bar: shows value relative to a sensible max
function getBarWidth(stat, value) {
  if (value == null) return 0;
  const max = stat.barMax || 100;
  return Math.min((value / max) * 100, 100);
}

function NeighborhoodStats({ data }) {
  return (
    <div className="card">
      <div className="card__header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round"/>
          <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round"/>
          <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round"/>
        </svg>
        <h3 className="card__title">Buurtstatistieken</h3>
      </div>
      <div className="card__body">
        <div className="stats-list">
          {STAT_CONFIG.map((stat) => {
            const value = data[stat.key];
            const barWidth = getBarWidth(stat, value);

            return (
              <div key={stat.key} className="stats-item">
                <div className="stats-item__row">
                  <div className="stats-item__label">
                    <span className="stats-item__icon">{stat.icon}</span>
                    <span>{stat.label}</span>
                  </div>
                  <span className="stats-item__value">{stat.format(value)}</span>
                </div>
                {value != null && (
                  <div className="stats-item__bar">
                    <div
                      className="stats-item__bar-fill"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NeighborhoodStats;
