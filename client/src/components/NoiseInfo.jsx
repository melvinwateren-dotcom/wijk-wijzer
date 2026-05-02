function getNoiseColor(pct) {
  if (pct == null) return '#9ca3af';
  if (pct <= 3) return '#16a34a';
  if (pct <= 6) return '#22c55e';
  if (pct <= 10) return '#f59e0b';
  if (pct <= 15) return '#f97316';
  return '#ef4444';
}

function getNoiseBarWidth(pct) {
  if (pct == null) return 0;
  return Math.min((pct / 30) * 100, 100);
}

const NOISE_SOURCES = [
  {
    key: 'wegverkeer',
    label: 'Wegverkeer',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17l-1 3m16-3l1 3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="7.5" cy="17" r="1.5"/>
        <circle cx="16.5" cy="17" r="1.5"/>
      </svg>
    ),
  },
  {
    key: 'trein',
    label: 'Treinverkeer',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 11V4a2 2 0 012-2h12a2 2 0 012 2v7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 15v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="4" y1="11" x2="20" y2="11" strokeLinecap="round"/>
        <line x1="4" y1="15" x2="20" y2="15" strokeLinecap="round"/>
        <line x1="8" y1="19" x2="6" y2="22" strokeLinecap="round"/>
        <line x1="16" y1="19" x2="18" y2="22" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'vliegtuig',
    label: 'Vliegverkeer',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'buren',
    label: 'Burengeluid',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

function NoiseInfo({ data }) {
  if (!data || data.source === 'unavailable') {
    return (
      <div className="card card--error">
        <p>Geen geluiddata beschikbaar voor deze buurt.</p>
      </div>
    );
  }

  const sources = [
    { ...NOISE_SOURCES[0], pct: data.wegverkeer?.geluidhinder, sleepPct: data.slaapverstoring?.wegverkeer },
    { ...NOISE_SOURCES[1], pct: data.trein?.geluidhinder, sleepPct: data.slaapverstoring?.trein },
    { ...NOISE_SOURCES[2], pct: data.vliegtuig?.geluidhinder, sleepPct: data.slaapverstoring?.vliegtuig },
    { ...NOISE_SOURCES[3], pct: data.buren?.geluidhinder, sleepPct: data.slaapverstoring?.buren },
  ];

  return (
    <div className="card">
      <div className="card__header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3 className="card__title">Geluidhinder</h3>
        {data.buurtnaam && <span className="card__subtitle">{data.buurtnaam}</span>}
      </div>
      <div className="card__body">
        <p className="noise__intro">
          Percentage bewoners met geluidhinder (RIVM {data.jaar || 2024})
        </p>

        <div className="noise-list">
          {sources.map((s) => {
            const color = getNoiseColor(s.pct);
            const barWidth = getNoiseBarWidth(s.pct);

            return (
              <div key={s.key} className="noise-item">
                <div className="noise-item__header">
                  <div className="noise-item__label">
                    <span className="noise-item__icon" style={{ color }}>{s.icon}</span>
                    <span>{s.label}</span>
                  </div>
                  <span className="noise-item__value" style={{ color }}>
                    {s.pct != null ? `${s.pct}%` : '-'}
                  </span>
                </div>
                <div className="noise-item__bar">
                  <div
                    className="noise-item__bar-fill"
                    style={{ width: `${barWidth}%`, backgroundColor: color }}
                  />
                </div>
                {s.sleepPct != null && s.sleepPct > 0 && (
                  <div className="noise-item__sleep">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Slaapverstoring: {s.sleepPct}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {data.tevredenheid?.woning != null && (
          <div className="noise__extra">
            <div className="noise__extra-row">
              <span>Tevredenheid woning</span>
              <span className="noise__extra-val">{data.tevredenheid.woning}%</span>
            </div>
            {data.tevredenheid.woonomgeving != null && (
              <div className="noise__extra-row">
                <span>Tevredenheid woonomgeving</span>
                <span className="noise__extra-val">{data.tevredenheid.woonomgeving}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoiseInfo;
