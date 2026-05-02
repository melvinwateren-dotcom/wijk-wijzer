import { Router } from 'express';

const router = Router();

const BAG_WFS = 'https://service.pdok.nl/lv/bag/wfs/v2_0';
const FETCH_TIMEOUT = 10000;

function wgs84ToRd(lat, lon) {
  const dLat = 0.36 * (lat - 52.15517440);
  const dLon = 0.36 * (lon - 5.38720621);

  const x = 155000
    + 190094.945 * dLon
    - 11832.228 * dLat * dLon
    - 144.221 * dLon * dLat * dLat
    - 32.391 * dLon * dLon * dLon;

  const y = 463000
    + 309056.544 * dLat
    + 3638.893 * dLon * dLon
    + 73.077 * dLat * dLat
    - 157.984 * dLat * dLon * dLon
    + 59.788 * dLat * dLat * dLat;

  return { x: Math.round(x), y: Math.round(y) };
}

router.get('/', async (req, res) => {
  const { lat, lon, postcode, huisnummer, huisletter, toevoeging } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat en lon zijn verplicht' });
  }

  console.log(`[Building] Lookup: ${postcode} ${huisnummer}${huisletter || ''}${toevoeging ? '-' + toevoeging : ''} (${lat}, ${lon})`);

  try {
    const rd = wgs84ToRd(parseFloat(lat), parseFloat(lon));
    const buffer = 50;
    const bbox = `${rd.x - buffer},${rd.y - buffer},${rd.x + buffer},${rd.y + buffer}`;

    const url = `${BAG_WFS}?service=WFS&version=2.0.0&request=GetFeature&typeName=bag:verblijfsobject&count=200&outputFormat=application/json&BBOX=${bbox}`;
    console.log(`[Building] WFS BBOX query: ${bbox}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[Building] WFS HTTP ${response.status}`);
      return res.status(502).json({ error: 'BAG WFS niet beschikbaar' });
    }

    const data = await response.json();
    const features = data.features || [];
    console.log(`[Building] WFS returned ${features.length} features`);

    const match = findMatch(features, postcode, huisnummer, huisletter, toevoeging);

    if (match) {
      const p = match.properties;
      console.log(`[Building] Matched: ${p.openbare_ruimte} ${p.huisnummer}, bouwjaar=${p.bouwjaar}, opp=${p.oppervlakte}`);
      return res.json({
        verblijfsobjectId: p.identificatie,
        oppervlakte: p.oppervlakte,
        status: p.status,
        gebruiksdoel: p.gebruiksdoel ? p.gebruiksdoel.split(',').map(s => s.trim()) : ['woonfunctie'],
        bouwjaar: p.bouwjaar,
        pandStatus: p.pandstatus,
      });
    }

    console.log('[Building] No exact match in WFS results');
    return res.status(404).json({ error: 'Geen gebouwgegevens gevonden' });
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[Building] WFS timeout');
    } else {
      console.error('[Building] Error:', err.message);
    }
    return res.status(502).json({ error: 'Kon gebouwgegevens niet ophalen' });
  }
});

function findMatch(features, postcode, huisnummer, huisletter, toevoeging) {
  const hn = huisnummer ? parseInt(huisnummer, 10) : null;
  const pc = postcode ? postcode.replace(/\s/g, '').toUpperCase() : null;
  const hl = huisletter || '';
  const tv = toevoeging || '';

  for (const f of features) {
    const p = f.properties;
    const fpc = (p.postcode || '').replace(/\s/g, '').toUpperCase();
    const fhl = p.huisletter || '';
    const ftv = p.toevoeging || '';

    if (pc && fpc === pc && p.huisnummer === hn && fhl === hl && ftv === tv) {
      return f;
    }
  }

  for (const f of features) {
    const p = f.properties;
    const fpc = (p.postcode || '').replace(/\s/g, '').toUpperCase();

    if (pc && fpc === pc && p.huisnummer === hn) {
      return f;
    }
  }

  return features[0] || null;
}

export default router;
