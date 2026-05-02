import { useState, useRef, useEffect, useCallback } from 'react';

function AddressSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/address/suggest?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const docs = data?.response?.docs || [];
      setSuggestions(docs);
      setShowDropdown(docs.length > 0);
      setHighlightIndex(-1);
    } catch {
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSelect = async (suggestion) => {
    setQuery(suggestion.weergavenaam);
    setShowDropdown(false);
    setSuggestions([]);

    try {
      const res = await fetch(`/api/address/lookup?id=${encodeURIComponent(suggestion.id)}`);
      const doc = await res.json();
      if (!doc || doc.error) return;

      onSelect({
        id: doc.nummeraanduiding_id || doc.adresseerbaarobject_id,
        weergavenaam: doc.weergavenaam || suggestion.weergavenaam,
        postcode: doc.postcode,
        woonplaats: doc.woonplaatsnaam,
        straat: doc.straatnaam,
        huisnummer: doc.huisnummer,
        huisletter: doc.huisletter || '',
        toevoeging: doc.huisnummertoevoeging || '',
        nummeraanduiding_id: doc.nummeraanduiding_id || doc.adresseerbaarobject_id,
        buurtcode: doc.buurtcode,
        buurtnaam: doc.buurtnaam,
        gemeentecode: doc.gemeentecode,
        gemeentenaam: doc.gemeentenaam,
        lat: doc.lat,
        lon: doc.lon,
      });
    } catch (err) {
      console.error('Lookup failed:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleExample = () => {
    const exampleQuery = 'Keizersgracht 1, Amsterdam';
    setQuery(exampleQuery);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchSuggestions(exampleQuery);
  };

  return (
    <div className="search">
      <div className="search__hero">
        <h1 className="search__title">Ontdek jouw buurt</h1>
        <p className="search__subtitle">
          Zoek een adres en krijg direct inzicht in veiligheid, leefbaarheid en meer.
        </p>
      </div>

      <div className="search__box">
        <div className="search__input-wrapper">
          <svg className="search__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search__input"
            placeholder="Voer een adres in..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            autoComplete="off"
            aria-label="Zoek een adres"
            aria-expanded={showDropdown}
            role="combobox"
            aria-haspopup="listbox"
          />
          {isLoading && (
            <div className="search__spinner" aria-label="Laden">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#e5e7eb" strokeWidth="2"/>
                <path d="M10 2a8 8 0 018 8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>

        {showDropdown && (
          <ul className="search__dropdown" ref={dropdownRef} role="listbox">
            {suggestions.map((s, i) => (
              <li
                key={s.id}
                className={`search__dropdown-item ${i === highlightIndex ? 'search__dropdown-item--active' : ''}`}
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setHighlightIndex(i)}
                role="option"
                aria-selected={i === highlightIndex}
              >
                <svg className="search__dropdown-pin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="search__dropdown-text">{s.weergavenaam}</span>
                {s.type && <span className="search__dropdown-type">{s.type}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="search__example" onClick={handleExample}>
        Probeer: Keizersgracht 1, Amsterdam
      </button>

      <div className="search__features">
        <div className="search__feature">
          <div className="search__feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Is deze buurt veilig?</h3>
          <p>Bekijk criminaliteitscijfers en veiligheidsscores van je buurt.</p>
        </div>
        <div className="search__feature">
          <div className="search__feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Wat is de WOZ-waarde?</h3>
          <p>Inzicht in woningwaarde en bouwjaar uit het BAG-register.</p>
        </div>
        <div className="search__feature">
          <div className="search__feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Hoe leefbaar is de wijk?</h3>
          <p>Ontdek voorzieningen, inkomen en demografische data van CBS.</p>
        </div>
      </div>

      <div className="search__trust">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="22,4 12,14.01 9,11.01" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Gratis. Geen registratie. Overheidsdata.</span>
      </div>
    </div>
  );
}

export default AddressSearch;
