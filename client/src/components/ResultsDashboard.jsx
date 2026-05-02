import { useState, useEffect } from 'react';
import BuildingInfo from './BuildingInfo.jsx';
import RiskScores from './RiskScores.jsx';
import NeighborhoodStats from './NeighborhoodStats.jsx';
import NoiseInfo from './NoiseInfo.jsx';
import CrimeInfo from './CrimeInfo.jsx';

function ResultsDashboard({ address }) {
  const [building, setBuilding] = useState(null);
  const [risks, setRisks] = useState(null);
  const [neighborhood, setNeighborhood] = useState(null);
  const [noise, setNoise] = useState(null);
  const [crime, setCrime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setErrors({});

    const fetchAll = async () => {
      const results = await Promise.allSettled([
        fetch(`/api/building?lat=${address.lat}&lon=${address.lon}&postcode=${encodeURIComponent(address.postcode || '')}&huisnummer=${encodeURIComponent(address.huisnummer || '')}&huisletter=${encodeURIComponent(address.huisletter || '')}&toevoeging=${encodeURIComponent(address.toevoeging || '')}`).then((r) => r.json()),
        fetch(`/api/neighborhood?postcode=${encodeURIComponent(address.postcode || '')}`).then((r) => r.json()),
        fetch(`/api/risks?lat=${address.lat}&lon=${address.lon}&postcode=${encodeURIComponent(address.postcode || '')}`).then((r) => r.json()),
        address.buurtcode
          ? fetch(`/api/noise?buurtcode=${encodeURIComponent(address.buurtcode)}`).then((r) => r.json())
          : Promise.resolve(null),
        address.buurtcode
          ? fetch(`/api/crime?buurtcode=${encodeURIComponent(address.buurtcode)}`).then((r) => r.json())
          : Promise.resolve(null),
      ]);

      const newErrors = {};

      if (results[0].status === 'fulfilled') {
        setBuilding(results[0].value);
      } else {
        newErrors.building = true;
      }

      if (results[1].status === 'fulfilled') {
        setNeighborhood(results[1].value);
      } else {
        newErrors.neighborhood = true;
      }

      if (results[2].status === 'fulfilled') {
        setRisks(results[2].value);
      } else {
        newErrors.risks = true;
      }

      if (results[3].status === 'fulfilled') {
        setNoise(results[3].value);
      } else {
        newErrors.noise = true;
      }

      if (results[4].status === 'fulfilled') {
        setCrime(results[4].value);
      } else {
        newErrors.crime = true;
      }

      setErrors(newErrors);
      setLoading(false);
    };

    fetchAll();
  }, [address]);

  return (
    <div className="results">
      {/* Address header */}
      <div className="results__header">
        <div className="results__address-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="results__address-text">
          <h2 className="results__address-main">{address.weergavenaam}</h2>
          {address.postcode && (
            <p className="results__address-sub">
              {address.postcode}{address.woonplaats ? `, ${address.woonplaats}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="results__content">
        {loading ? (
          <div className="results__loading">
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </div>
        ) : (
          <>
            {building && !errors.building && (
              <BuildingInfo data={building} />
            )}
            {errors.building && (
              <div className="card card--error">
                <p>Gebouwinformatie kon niet worden geladen.</p>
              </div>
            )}

            {risks && !errors.risks && (
              <RiskScores data={risks} />
            )}
            {errors.risks && (
              <div className="card card--error">
                <p>Risicoscores konden niet worden geladen.</p>
              </div>
            )}

            {crime && !errors.crime && (
              <CrimeInfo data={crime} />
            )}

            {noise && !errors.noise && (
              <NoiseInfo data={noise} />
            )}

            {neighborhood && !errors.neighborhood && (
              <NeighborhoodStats data={neighborhood} />
            )}
            {errors.neighborhood && (
              <div className="card card--error">
                <p>Buurtstatistieken konden niet worden geladen.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ResultsDashboard;
