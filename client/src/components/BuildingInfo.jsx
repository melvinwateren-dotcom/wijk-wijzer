function BuildingInfo({ data }) {
  const fields = [
    {
      label: 'Bouwjaar',
      value: data.bouwjaar || 'Onbekend',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Oppervlakte',
      value: data.oppervlakte ? `${data.oppervlakte} m²` : 'Onbekend',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 9h18M9 3v18" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Gebruiksdoel',
      value: Array.isArray(data.gebruiksdoel) ? data.gebruiksdoel.join(', ') : data.gebruiksdoel || 'Onbekend',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Status',
      value: data.status || 'Onbekend',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="22,4 12,14.01 9,11.01" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="card">
      <div className="card__header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10M9 6h.01M15 6h.01M9 10h.01M15 10h.01" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3 className="card__title">Gebouwinformatie</h3>
      </div>
      <div className="card__body">
        <div className="building-grid">
          {fields.map((f) => (
            <div key={f.label} className="building-grid__item">
              <div className="building-grid__icon">{f.icon}</div>
              <div className="building-grid__info">
                <span className="building-grid__label">{f.label}</span>
                <span className="building-grid__value">{f.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BuildingInfo;
