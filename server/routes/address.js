import { Router } from 'express';

const router = Router();

const PDOK_BASE = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1';
const FETCH_TIMEOUT = 8000;

/**
 * GET /api/address/suggest?q=...
 * Proxies to PDOK Locatieserver suggest endpoint.
 * Returns address suggestions for autocomplete.
 */
router.get('/suggest', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({ response: { docs: [] } });
  }

  const url = `${PDOK_BASE}/suggest?q=${encodeURIComponent(q)}&fq=type:adres&rows=7`;
  console.log(`[PDOK suggest] ${url}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[PDOK suggest] HTTP ${response.status}`);
      return res.status(response.status).json({ error: 'PDOK suggest request failed' });
    }

    const data = await response.json();
    console.log(`[PDOK suggest] ${data.response?.docs?.length ?? 0} results for "${q}"`);

    res.json(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[PDOK suggest] Request timed out');
      return res.status(504).json({ error: 'PDOK suggest timeout' });
    }
    console.error('[PDOK suggest] Error:', err.message);
    res.status(500).json({ error: 'Kon adressuggesties niet ophalen' });
  }
});

/**
 * GET /api/address/lookup?id=...
 * Proxies to PDOK Locatieserver lookup endpoint.
 * Returns full address details including coordinates.
 */
router.get('/lookup', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Parameter "id" is verplicht' });
  }

  const url = `${PDOK_BASE}/lookup?id=${encodeURIComponent(id)}`;
  console.log(`[PDOK lookup] ${url}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[PDOK lookup] HTTP ${response.status}`);
      return res.status(response.status).json({ error: 'PDOK lookup request failed' });
    }

    const data = await response.json();
    const doc = data.response?.docs?.[0];

    if (!doc) {
      return res.status(404).json({ error: 'Adres niet gevonden' });
    }

    // Extract useful fields into a clean response
    const result = {
      weergavenaam: doc.weergavenaam,
      straatnaam: doc.straatnaam,
      huisnummer: doc.huisnummer,
      huisletter: doc.huisletter || null,
      huisnummertoevoeging: doc.huisnummertoevoeging || null,
      postcode: doc.postcode,
      woonplaatsnaam: doc.woonplaatsnaam,
      gemeentenaam: doc.gemeentenaam,
      provincienaam: doc.provincienaam,
      buurtcode: doc.buurtcode || null,
      buurtnaam: doc.buurtnaam || null,
      wijkcode: doc.wijkcode || null,
      gemeentecode: doc.gemeentecode || null,
      nummeraanduiding_id: doc.nummeraanduiding_id,
      adresseerbaarobject_id: doc.adresseerbaarobject_id,
      centroide_ll: doc.centroide_ll,
      centroide_rd: doc.centroide_rd,
      lat: null,
      lon: null,
    };

    // Parse lat/lon from centroide_ll (format: "POINT(lon lat)")
    if (doc.centroide_ll) {
      const match = doc.centroide_ll.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (match) {
        result.lon = parseFloat(match[1]);
        result.lat = parseFloat(match[2]);
      }
    }

    console.log(`[PDOK lookup] Found: ${result.weergavenaam} (${result.lat}, ${result.lon})`);

    res.json(result);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[PDOK lookup] Request timed out');
      return res.status(504).json({ error: 'PDOK lookup timeout' });
    }
    console.error('[PDOK lookup] Error:', err.message);
    res.status(500).json({ error: 'Kon adresgegevens niet ophalen' });
  }
});

export default router;
