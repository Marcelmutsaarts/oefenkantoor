// De stem van de klant: tekst naar spraak via OpenRouter (Nederlandse stemmen van Microsoft MAI-Voice).

const URL = 'https://openrouter.ai/api/v1/audio/speech';
const MODEL = process.env.STEM_MODEL || 'microsoft/mai-voice-2.1-flash';
const SUFFIX = MODEL.includes('2.1-flash') ? 'MAI-Voice-2.1-Flash' : 'MAI-Voice-2.1';
const STEMMEN = {
  erik: process.env.STEM_ERIK || `nl-NL-Sander:${SUFFIX}`,
  jansen: process.env.STEM_JANSEN || `nl-NL-Harper:${SUFFIX}`,
};
const TOON = {
  neutraal: 'Spreek natuurlijk en een beetje gehaast, zoals iemand die aan het werk is.',
  geirriteerd: 'Spreek kortaf en geïrriteerd.',
  boos: 'Spreek boos en verontwaardigd, iets luider.',
  nadenkend: 'Spreek aarzelend en nadenkend, met korte pauzes.',
  opgelucht: 'Spreek opgelucht en wat rustiger.',
  tevreden: 'Spreek vriendelijk en tevreden.',
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Alleen POST' });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return res.status(503).json({ fout: 'geen-sleutel' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const tekst = String(body.tekst || '').trim().slice(0, 450);
  const stem = STEMMEN[body.wie] || STEMMEN.erik;
  if (!tekst) return res.status(400).json({ fout: 'Geen tekst' });

  try {
    const r = await fetch(URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://oefenkantoor.vercel.app',
        'X-Title': 'Het oefenkantoor',
      },
      body: JSON.stringify({
        model: MODEL,
        input: tekst,
        voice: stem,
        response_format: 'mp3',
        instructions: TOON[body.emotie] || TOON.neutraal,
      }),
    });
    if (!r.ok) {
      const fout = await r.text().catch(() => '');
      return res.status(502).json({ fout: `Stem gaf status ${r.status}`, details: fout.slice(0, 300) });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ fout: e.message || 'Stem lukt niet' });
  }
}
