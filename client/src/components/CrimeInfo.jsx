function getCrimeColor(count) {
  if (count == null) return '#9ca3af';
  if (count === 0) return '#16a34a';
  if (count <= 3) return '#22c55e';
  if (count <= 10) return '#f59e0b';
  if (count <= 25) return '#f97316';
  return '#ef4444';
}

function getTrendIcon(trend) {
  if (trend == null) return null;
  if (trend > 5) return { symbol: '↑', color: '#ef4444', label: `+${trend}%` };
  if (trend < -5) return { symbol: '↓', color: '#16a34a', label: `${trend}%` };
  return { symbol: '→', color: '#9ca3af', label: `${trend > 0 ? '+' : ''}${trend}%` };
}

const ICONS = {
  '0.0.0': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '1.1.1': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '1.2.3': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  ),
  '1.2.2': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>
    </svg>
  ),
  '1.4.5': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
    </svg>
  ),
  '1.4.4': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
    </svg>
  ),
  '2.2.1': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeLinecap="round"/>
    </svg>
  ),
  '2.1.1': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="8" x2="12" y2="16" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round"/>
    </svg>
  ),
};

function CrimeInfo({ data }) {
  if (!data || data.source === 'unavailable') {
    return (
      <div className="card card--error">
        <p>Geen criminaliteitsdata beschikbaar voor deze buurt.</p>
      </div>
    );
  }

  const total = data.categories.find(c => c.key === '0.0.0');
  const details = data.categories.filter(c => c.key !== '0.0.0' && c.count != null && c.count > 0);

  return (
    <div className="card">
      <div className="card__header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="9,12 11,14 15,10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3 className="card__title">Criminaliteit</h3>
        <span className="card__subtitle">Politie {data.jaar}</span>
      </div>
      <div className="card__body">
        {total && total.count != null && (
          <div className="crime-total">
            <div className="crime-total__number" style={{ color: getCrimeColor(total.count) }}>
              {total.count}
            </div>
            <div className="crime-total__info">
              <span className="crime-total__label">geregistreerde misdrijven</span>
              {total.trend != null && (() => {
                const t = getTrendIcon(total.trend);
                return (
                  <span className="crime-total__trend" style={{ color: t.color }}>
                    {t.symbol} {t.label} t.o.v. {data.prevJaar}
                  </span>
                );
              })()}
            </div>
          </div>
        )}

        {details.length > 0 && (
          <div className="crime-list">
            {details.map(cat => {
              const color = getCrimeColor(cat.count);
              const trend = getTrendIcon(cat.trend);
              const icon = ICONS[cat.key] || ICONS['0.0.0'];

              return (
                <div key={cat.key} className="crime-item">
                  <div className="crime-item__header">
                    <div className="crime-item__label">
                      <span className="crime-item__icon" style={{ color }}>{icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    <div className="crime-item__values">
                      <span className="crime-item__count" style={{ color }}>
                        {cat.count}
                      </span>
                      {trend && (
                        <span className="crime-item__trend" style={{ color: trend.color }}>
                          {trend.symbol} {trend.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {details.length === 0 && total && total.count === 0 && (
          <p className="crime-empty">Geen geregistreerde misdrijven in deze buurt.</p>
        )}

        <div className="crime-footer">
          <span>Geregistreerde misdrijven per buurt</span>
          <span>Bron: Politie / CBS dataderden</span>
        </div>
      </div>
    </div>
  );
}

export default CrimeInfo;
