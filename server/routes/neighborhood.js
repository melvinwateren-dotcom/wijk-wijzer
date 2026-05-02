import { Router } from 'express';

const router = Router();

const FETCH_TIMEOUT = 12000;

/**
 * GET /api/neighborhood?postcode=1234AB
 * Fetches CBS neighborhood (buurt) statistics.
 * Tries the real CBS OData API first, falls back to realistic mock data.
 */
router.get('/', async (req, res) => {
  const { postcode } = req.query;

  if (!postcode) {
    return res.status(400).json({ error: 'Parameter "postcode" is verplicht' });
  }

  const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
  console.log(`[CBS] Fetching neighborhood data for postcode ${cleanPostcode}`);

  try {
    // Try real CBS API first
    const cbsData = await fetchCbsData(cleanPostcode);

    if (cbsData) {
      console.log('[CBS] Returning real CBS data');
      return res.json(cbsData);
    }

    // Fallback: generate realistic data based on postcode area
    console.log('[CBS] CBS API unavailable or no data, using calculated fallback');
    const fallbackData = generateFallbackData(cleanPostcode);
    res.json(fallbackData);
  } catch (err) {
    console.error('[CBS] Error:', err.message);
    // Even on error, return fallback data so the frontend works
    const fallbackData = generateFallbackData(cleanPostcode);
    res.json(fallbackData);
  }
});

/**
 * Try to fetch data from CBS Wijken en Buurten via OData.
 * The CBS dataset 85039NED contains neighborhood-level statistics.
 */
async function fetchCbsData(postcode) {
  // CBS uses a "KerncijfersWijkenEnBuurten" dataset.
  // The postcode area (first 4 digits) can be matched against "Codering" fields.
  // The full CBS OData v4 API for the latest year:
  const pc4 = postcode.slice(0, 4);

  // Try the CBS OData v4 endpoint for Kerncijfers wijken en buurten 2023
  const url = `https://datasets.cbs.nl/odata/v1/CBS/85039NED/Observations?$filter=contains(RegioS,'${pc4}')&$top=50`;
  console.log(`[CBS] GET ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[CBS] HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    const observations = data.value || [];

    if (observations.length === 0) {
      console.log('[CBS] No observations found for postcode area');
      return null;
    }

    // Parse CBS observations into structured data
    const parsed = parseCbsObservations(observations);
    return {
      source: 'cbs',
      postcode,
      postcodeGebied: pc4,
      ...parsed,
    };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.error('[CBS] Request timed out');
    } else {
      console.error('[CBS] Fetch error:', err.message);
    }
    return null;
  }
}

/**
 * Parse CBS OData observations into a usable format.
 * CBS data comes as flat observation records with Measure codes.
 */
function parseCbsObservations(observations) {
  const stats = {};

  for (const obs of observations) {
    const measure = obs.Measure || '';
    const value = obs.Value ?? obs.StringValue ?? null;

    // Map known measure codes to readable names
    if (measure.includes('BevolkingAantal') || measure.includes('AantalInwoners')) {
      stats.aantalInwoners = typeof value === 'number' ? value : parseInt(value) || null;
    }
    if (measure.includes('GemiddeldInkomen')) {
      stats.gemiddeldInkomen = typeof value === 'number' ? value : parseFloat(value) || null;
    }
    if (measure.includes('WOZ') || measure.includes('GemiddeldeWoningwaarde')) {
      stats.gemiddeldeWoningwaarde = typeof value === 'number' ? value : parseInt(value) || null;
    }
  }

  return {
    bpiTotaal: stats.aantalInwoners ?? null,
    gemiddeldInkomen: stats.gemiddeldInkomen ?? null,
    gemiddeldeWoningwaarde: stats.gemiddeldeWoningwaarde ?? null,
    afstandHuisarts: null,
    afstandSupermarkt: null,
    afstandSchool: null,
  };
}

/**
 * Generate realistic fallback data based on the postcode area.
 * Uses the 4-digit postcode to seed variation so the same postcode
 * always returns consistent results.
 */
function generateFallbackData(postcode) {
  const pc4 = parseInt(postcode.slice(0, 4), 10) || 1000;

  // Use postcode as a seed for deterministic "random" values
  const seed = pc4;
  const seededRandom = (min, max) => {
    const x = Math.sin(seed * 9301 + 49297) % 233280;
    const rnd = (x - Math.floor(x));
    return min + rnd * (max - min);
  };

  // Major city postcodes have higher density and prices
  const isMajorCity = (pc4 >= 1000 && pc4 <= 1109) || // Amsterdam
    (pc4 >= 2500 && pc4 <= 2599) || // Den Haag
    (pc4 >= 3000 && pc4 <= 3099) || // Rotterdam
    (pc4 >= 3500 && pc4 <= 3599);   // Utrecht

  const cityMultiplier = isMajorCity ? 1.4 : 1.0;

  // Determine region characteristics
  const isRandstad = pc4 >= 1000 && pc4 <= 3600;
  const regionMultiplier = isRandstad ? 1.2 : 1.0;

  const aantalInwoners = Math.round(seededRandom(2500, 12000) * regionMultiplier);
  const gemiddeldInkomen = Math.round(seededRandom(24000, 52000) * cityMultiplier / 100) * 100;
  const gemiddeldeWoningwaarde = Math.round(seededRandom(180000, 520000) * cityMultiplier / 1000) * 1000;

  return {
    source: 'fallback',
    postcode,
    postcodeGebied: postcode.slice(0, 4),
    bpiTotaal: aantalInwoners,
    gemiddeldInkomen,
    gemiddeldeWoningwaarde,
    afstandHuisarts: +(seededRandom(0.3, 2.8)).toFixed(1),
    afstandSupermarkt: +(seededRandom(0.2, 1.9)).toFixed(1),
    afstandSchool: +(seededRandom(0.3, 2.2)).toFixed(1),
    demografisch: {
      percentageJongeren: Math.round(seededRandom(15, 30)),
      percentageOuderen: Math.round(seededRandom(10, 28)),
      percentageEenpersoonshuishoudens: Math.round(seededRandom(25, 55) * cityMultiplier / 1.4),
    },
    woningen: {
      percentageKoopwoningen: Math.round(seededRandom(35, 75)),
      percentageHuurwoningen: null, // calculated by frontend
      dichtheid: Math.round(seededRandom(1200, 6500) * regionMultiplier),
    },
  };
}

export default router;
