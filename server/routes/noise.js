import { Router } from 'express';

const router = Router();

const RIVM_WFS = 'https://data.rivm.nl/geo/alo/wfs';
const FETCH_TIMEOUT = 12000;

router.get('/', async (req, res) => {
  const { buurtcode } = req.query;

  if (!buurtcode) {
    return res.status(400).json({ error: 'Parameter "buurtcode" is verplicht' });
  }

  console.log(`[Geluid] Fetching noise data for buurt ${buurtcode}`);

  try {
    const [wegData, slaapData] = await Promise.allSettled([
      fetchRivmLayer('rivm_20251201_geluidhinder_bu_weg_2024', buurtcode),
      fetchRivmLayer('rivm_20251201_slaapverst_bu_weg_2024', buurtcode),
    ]);

    const weg = wegData.status === 'fulfilled' ? wegData.value : null;
    const slaap = slaapData.status === 'fulfilled' ? slaapData.value : null;

    if (!weg) {
      console.log('[Geluid] No RIVM data found, trying older dataset');
      const fallbackWeg = await fetchRivmLayer('rivm_20230201_geluidhinder_bu_gt50_2020', buurtcode);
      if (!fallbackWeg) {
        console.log('[Geluid] No data at all for this buurt');
        return res.json({ source: 'unavailable', buurtcode, message: 'Geen geluiddata beschikbaar voor deze buurt' });
      }
    }

    const props = weg || {};

    const result = {
      source: 'rivm',
      buurtcode,
      buurtnaam: props.buurtnaam || null,
      jaar: props.jaar || 2024,
      wegverkeer: {
        geluidhinder: props.b_gel_weg ?? null,
        label: noiseLabel(props.b_gel_weg),
        beschrijving: `${props.b_gel_weg ?? '?'}% van de bewoners ervaart geluidhinder door wegverkeer`,
      },
      trein: {
        geluidhinder: props.b_gel_trei ?? null,
        label: noiseLabel(props.b_gel_trei),
      },
      vliegtuig: {
        geluidhinder: props.b_gel_vv ?? null,
        label: noiseLabel(props.b_gel_vv),
      },
      windturbine: {
        geluidhinder: props.b_gel_wtn ?? null,
        label: noiseLabel(props.b_gel_wtn),
      },
      buren: {
        geluidhinder: props.b_gel_bu ?? null,
        label: noiseLabel(props.b_gel_bu),
      },
      totaal: {
        geluidhinderLt50: props.b_gel_lt50 ?? null,
        geluidhinderGt50: props.b_gel_gt50 ?? null,
      },
      slaapverstoring: {
        wegverkeer: props.b_sv_weg ?? slaap?.b_sv_weg ?? null,
        trein: props.b_sv_trein ?? slaap?.b_sv_trein ?? null,
        vliegtuig: props.b_sv_vv ?? slaap?.b_sv_vv ?? null,
        buren: props.b_sv_bu ?? slaap?.b_sv_bu ?? null,
      },
      tevredenheid: {
        woning: props.b_tevr_won ?? null,
        woonomgeving: props.b_tevr_wo ?? null,
        groen: props.b_tevr_gr ?? null,
      },
      verkeersveiligheid: {
        onveiligBinnen: props.b_verk_bi ?? null,
        onveiligBuiten: props.b_verk_bu ?? null,
      },
    };

    console.log(`[Geluid] Wegverkeer: ${result.wegverkeer.geluidhinder}%, trein: ${result.trein.geluidhinder}%, vliegtuig: ${result.vliegtuig.geluidhinder}%`);
    res.json(result);
  } catch (err) {
    console.error('[Geluid] Error:', err.message);
    res.status(500).json({ error: 'Kon geluiddata niet ophalen' });
  }
});

async function fetchRivmLayer(layerName, buurtcode) {
  const url = `${RIVM_WFS}?service=WFS&version=2.0.0&request=GetFeature&typeName=alo:${layerName}&outputFormat=application/json&CQL_FILTER=buurtcode='${buurtcode}'`;
  console.log(`[RIVM] GET ${layerName} for ${buurtcode}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[RIVM] HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    const feature = data.features?.[0];
    return feature?.properties || null;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') console.error(`[RIVM] ${layerName} timeout`);
    else console.error(`[RIVM] ${layerName} error:`, err.message);
    return null;
  }
}

function noiseLabel(pct) {
  if (pct == null) return 'Onbekend';
  if (pct <= 3) return 'Zeer rustig';
  if (pct <= 6) return 'Rustig';
  if (pct <= 10) return 'Gemiddeld';
  if (pct <= 15) return 'Matig luid';
  if (pct <= 25) return 'Luid';
  return 'Zeer luid';
}

export default router;
