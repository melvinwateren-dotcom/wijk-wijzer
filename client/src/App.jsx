import { useState } from 'react';
import AddressSearch from './components/AddressSearch.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';

function App() {
  const [address, setAddress] = useState(null);
  const [screen, setScreen] = useState('search');
  const [activeTab, setActiveTab] = useState('home');

  const handleAddressSelect = (addr) => {
    setAddress(addr);
    setScreen('results');
    setActiveTab('home');
  };

  const handleBack = () => {
    setAddress(null);
    setScreen('search');
  };

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar__inner">
          {screen === 'results' && (
            <button className="topbar__back" onClick={handleBack} aria-label="Terug">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div className="topbar__logo">
            <svg className="topbar__logo-icon" width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#2563eb"/>
              <text x="16" y="22" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="700" fill="white" textAnchor="middle">W</text>
            </svg>
            <span className="topbar__logo-text">WijkWijzer</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={`main main--${screen}`}>
        {screen === 'search' && (
          <AddressSearch onSelect={handleAddressSelect} />
        )}
        {screen === 'results' && address && (
          <ResultsDashboard address={address} />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="tabbar">
        <button
          className={`tabbar__item ${activeTab === 'home' ? 'tabbar__item--active' : ''}`}
          onClick={() => {
            setActiveTab('home');
            if (screen !== 'search' && !address) setScreen('search');
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Home</span>
        </button>
        <button
          className={`tabbar__item ${activeTab === 'rapport' ? 'tabbar__item--active' : ''}`}
          onClick={() => setActiveTab('rapport')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round"/>
            <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round"/>
            <polyline points="10,9 9,9 8,9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Rapport</span>
        </button>
        <button
          className={`tabbar__item ${activeTab === 'opgeslagen' ? 'tabbar__item--active' : ''}`}
          onClick={() => setActiveTab('opgeslagen')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Opgeslagen</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
