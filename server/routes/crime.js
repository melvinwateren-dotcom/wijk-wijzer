import { Router } from 'express';

const router = Router();

const DATADERDEN = 'https://dataderden.cbs.nl/ODataFeed/odata/47018NED/TypedDataSet';
const FETCH_TIMEOUT = 12000;

const CRIME_CATS = [
  { key: '0.0.0 ', label: 'Totaal misdrijven' },
  { key: '1.1.1 ', label: 'Woninginbraak' },
  { key: '1.2.3 ', label: 'Fietsendiefstal' },
  { key: '1.2.2 ', label: 'Autodiefstal' },
  { key: '1.2.4 ', label: 'Zakkenrollerij' },
  { key: '1.4.5 ', label: 'Mishandeling' },
  { key: '1.4.4 ', label: 'Bedreiging' },
  { key: '1.4.6 ', label: 'Straatroof' },
  { key: '2.2.1 ', label: 'Vernieling' },
  { key: '2.1.1 ', label: 'Drugs-/drankoverlast' },
  { key: '2.5.2 ', label: 'Winkeldiefstal' },
  { key: '1.6.1 ', label: 'Brand/ontploffing' },
];

router.get('/', async (req, res) => {
  const { buurtcode } = req.query;

  if (!buurtcode) {
    return res.status(400).json({ error: 'buurtcode is verplicht' });
  }

  console.log(`[Crime] Fetching for ${buurtcode}`);

  try {
    const year = new Date().getFullYear();
    const years = [year, year - 1, year - 2];

    const catFilter = CRIME_CATS.map(c => `SoortMisdrijf eq '${c.key}'`).join(' or ');
    const yearFilter = years.map(y => `Perioden eq '${y}JJ00'`).join(' or ');
    const filter = `WijkenEnBuurten eq '${buurtcode}' and (${catFilter}) and (${yearFilter})`;

    const url = `${DATADERDEN}?$format=json&$filter=${encodeURIComponent(filter)}&$select=SoortMisdrijf,Perioden,GeregistreerdeMisdrijven_1`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[Crime] HTTP ${response.status}`);
      return res.status(502).json({ error: 'Criminaliteitsdata niet beschikbaar' });
    }

    const data = await response.json();
    const records = data.value || [];
    console.log(`[Crime] ${records.length} records`);

    if (records.length === 0) {
      return res.json({ buurtcode, jaar: null, categories: [], source: 'unavailable' });
    }

    const map = {};
    for (const c of CRIME_CATS) {
      map[c.key.trim()] = { label: c.label, years: {} };
    }

    for (const r of records) {
      const k = r.SoortMisdrijf.trim();
      const y = parseInt(r.Perioden.substring(0, 4), 10);
      if (map[k]) map[k].years[y] = r.GeregistreerdeMisdrijven_1;
    }

    const latestYear = years.find(y => map['0.0.0']?.years[y] != null) || years[0];

    const categories = CRIME_CATS.map(c => {
      const entry = map[c.key.trim()];
      const count = entry.years[latestYear] ?? null;
      const prevCount = entry.years[latestYear - 1] ?? null;
      let trend = null;
      if (count != null && prevCount != null && prevCount > 0) {
        trend = Math.round(((count - prevCount) / prevCount) * 100);
      }
      return { key: c.key.trim(), label: entry.label, count, prevCount, trend };
    });

    console.log(`[Crime] Totaal ${latestYear}: ${categories[0].count}`);

    res.json({ buurtcode, jaar: latestYear, prevJaar: latestYear - 1, categories });
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[Crime] Timeout');
    } else {
      console.error('[Crime] Error:', err.message);
    }
    res.status(502).json({ error: 'Kon criminaliteitsdata niet ophalen' });
  }
});

export default router;
