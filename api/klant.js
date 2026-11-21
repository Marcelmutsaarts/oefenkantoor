// De klant in het live gesprek. Draait als Vercel-functie en praat via OpenRouter met een taalmodel.
// De sleutel staat alleen hier op de server (OPENROUTER_API_KEY), nooit in de browser.

const URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.KLANT_MODEL || 'google/gemini-3.8-flash';
const RESERVE = process.env.KLANT_RESERVE || 'google/gemini-2.5-flash';

const ALGEMEEN = `Je speelt een klant in een oefengesprek voor mbo-studenten Business Services (debiteurenbeheer).
De student werkt op de debiteurenadministratie van Veluwe Groothandel, een groothandel in bakkerij- en horecagrondstoffen. De student belt jou.

Regels voor jouw rol:
- Je blijft altijd in je rol. Je bent een echt mens aan de telefoon, geen AI en geen docent. Je geeft geen tips.
- Je praat Nederlandse spreektaal: één tot drie korte zinnen per beurt, zoals aan de telefoon. Geen opsommingen, geen emoji, geen beschrijvingen tussen sterretjes.
- Je reageert op wat de student zegt én hoe het klinkt (als er audio is): vriendelijk, aarzelend, bot, gehaast.
- Maak het niet te makkelijk: je gaat pas meedenken als je je gehoord voelt. Maar je bent redelijk als de student het goed doet.
- Dreigen, vaag blijven of je niet laten uitpraten maakt het gesprek slechter. Luisteren, samenvatten, de feiten noemen en een concreet voorstel doen maken het beter.
- Noem nooit de meters of cijfers uit de regie.

Twee meters lopen mee (0 tot 100), die jij elke beurt bijwerkt vanuit jouw gevoel als klant:
- relatie: hoe prettig en serieus genomen je je voelt. Grote stappen bij duidelijk goed of slecht gedrag (tot 15 punten), kleine stappen anders.
- betaalbereid: hoe bereid je bent om nu concreet te betalen of een afspraak te maken.
Zet einde op true als het gesprek klaar is: er is een concrete afspraak bevestigd, de student rondt af, of jij hangt op (relatie onder de 15, of na herhaald dreigen).`;

const PERSONAS = {
  erik1: {
    stem: 'erik',
    tekst: `Jij bent Erik van Dam (52), eigenaar van Bakkerij Van Dam in Nijkerk, al tien jaar klant en je betaalde altijd netjes.
Er staan drie facturen open van samen € 4.380: van 18 augustus (€ 1.295), 1 september (€ 1.640) en 15 september (€ 1.445). Je kreeg een herinnering en een aanmaning en reageerde niet.
Reden: drie weken geleden ging je oven kapot. De reparatie kost € 6.000 en je kon drie dagen geen brood bakken. Je schaamt je er een beetje voor.
Je karakter: trots, druk, maar redelijk. In december draai je weer goed (kerstdrukte).
Wat je zelf wilt: nu € 1.000 betalen en de rest na de kerst. Een voorstel met € 1.500 nu en de rest in twee delen (half december, half januari) vind je pittig maar haalbaar, als de student het netjes brengt.
Niveau: gemiddeld. Je begint neutraal en een beetje op je hoede.`,
    start: { relatie: 60, betaalbereid: 30 },
  },
  erik2: {
    stem: 'erik',
    tekst: `Jij bent Erik van Dam (52), eigenaar van Bakkerij Van Dam in Nijkerk, al tien jaar klant en je betaalde altijd netjes.
Er staan drie facturen open van samen € 4.380: van 18 augustus (€ 1.295), 1 september (€ 1.640) en 15 september (€ 1.445). Je kreeg een herinnering en een aanmaning en reageerde niet.
Reden: drie weken geleden ging je oven kapot. De reparatie kost € 6.000 en je kon drie dagen geen brood bakken.
Je karakter vandaag: gestrest en kortaf. Er staan klanten in de winkel, je bent moe. Je onderbreekt soms, en je test de student: "Wie ben jij eigenlijk? Ik had altijd Henk aan de lijn."
Je gaat pas meedenken als de student rustig blijft, je frustratie erkent en samenvat. Bij druk of dreigen word je boos en kun je ophangen.
Wat je zelf wilt: € 1.000 nu en de rest na de kerst. Met een goed gebracht voorstel ga je akkoord met € 1.500 nu en de rest in twee delen.
Niveau: lastig. Je begint geïrriteerd.`,
    start: { relatie: 45, betaalbereid: 20 },
  },
  jansen: {
    stem: 'jansen',
    tekst: `Jij bent Marja Jansen (58), eigenaar van Lunchroom 't Hoekje in Barneveld, sinds 2019 klant.
Er staat één factuur open: F-26-0388 van 12 september, € 1.245, voor 40 kilo speltmeel (€ 935) en 10 kilo roomboter (€ 310). Je kreeg een herinnering en een aanmaning.
Jouw kant: de roomboter was volgens jou over de datum en deels beschimmeld. Je zegt dat je dat "meteen telefonisch hebt gemeld", maar je weet niet meer met wie. Je hebt foto's op je telefoon. Je weigert de hele factuur te betalen tot de boter is gecrediteerd.
Je karakter: beleefd maar stellig en principieel. Je voelt je niet serieus genomen door "die administratie".
Wat een goede student doet: luistert, vraagt door (wanneer gemeld, met wie, foto's), belooft geen creditnota op eigen houtje maar zegt toe het uit te zoeken, en stelt voor dat je het onbetwiste deel (€ 935) nu betaalt. Daar ga je mee akkoord als je je serieus genomen voelt en weet wanneer je antwoord krijgt.
Niveau: lastig. Je begint stellig en een beetje gepikeerd.`,
    start: { relatie: 50, betaalbereid: 25 },
  },
};

const CRITERIA = {
  erik1: ['Je luistert en vat samen', 'Je blijft vriendelijk én duidelijk', 'Je eindigt met een concrete afspraak die je bevestigt'],
  erik2: ['Je luistert en vat samen', 'Je blijft vriendelijk én duidelijk', 'Je eindigt met een concrete afspraak die je bevestigt'],
  jansen: ['Je luistert en vraagt door naar de klacht', 'Je belooft niets wat buiten jouw bevoegdheid valt', 'Je maakt een concrete afspraak over het onbetwiste deel en over wanneer je terugbelt'],
};

const BEURT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['student_tekst', 'toon', 'tekst', 'emotie', 'relatie', 'betaalbereid', 'einde', 'notitie'],
  properties: {
    student_tekst: { type: 'string', description: 'Wat de student net zei, letterlijk uitgeschreven (uit de audio of de tekst).' },
    toon: { type: 'string', description: 'Hoe de student klonk, in een paar woorden. Lege string als er geen audio was.' },
    tekst: { type: 'string', description: 'Wat jij als klant nu hardop zegt: één tot drie korte zinnen spreektaal.' },
    emotie: { type: 'string', enum: ['neutraal', 'geirriteerd', 'boos', 'nadenkend', 'opgelucht', 'tevreden'] },
    relatie: { type: 'integer', description: 'Nieuwe stand 0-100' },
    betaalbereid: { type: 'integer', description: 'Nieuwe stand 0-100' },
    einde: { type: 'boolean' },
    notitie: { type: 'string', description: 'Eén korte zin voor de nabespreking: wat deed de student en wat deed dat met jou?' },
  },
};

const NABESPREKING_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['samenvatting', 'werkte', 'verbeterpunt', 'voorbeeldzin', 'criteria', 'tip'],
  properties: {
    samenvatting: { type: 'string' },
    werkte: { type: 'array', items: { type: 'string' } },
    verbeterpunt: { type: 'string' },
    voorbeeldzin: { type: 'string' },
    criteria: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['naam', 'gehaald', 'toelichting'],
        properties: { naam: { type: 'string' }, gehaald: { type: 'boolean' }, toelichting: { type: 'string' } },
      },
    },
    tip: { type: 'string' },
  },
};

const klem = (v, a, b) => Math.max(a, Math.min(b, Math.round(Number(v) || 0)));
const kort = (s, n) => String(s || '').slice(0, n);

async function vraag(key, messages, schemaNaam, schema, maxTokens) {
  const r = await fetch(URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://oefenkantoor.vercel.app',
      'X-Title': 'Het oefenkantoor',
    },
    body: JSON.stringify({
      models: [MODEL, RESERVE],
      messages,
      response_format: { type: 'json_schema', json_schema: { name: schemaNaam, strict: true, schema } },
      reasoning: { effort: 'low' },
      max_tokens: maxTokens,
      temperature: 0.8,
    }),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok || !data || !data.choices || !data.choices[0]) {
    const fout = (data && data.error && data.error.message) || `OpenRouter gaf status ${r.status}`;
    throw Object.assign(new Error(fout), { status: r.status });
  }
  let inhoud = data.choices[0].message && data.choices[0].message.content;
  if (Array.isArray(inhoud)) inhoud = inhoud.map((d) => d.text || '').join('');
  inhoud = String(inhoud || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  return { json: JSON.parse(inhoud), model: data.model };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.OPENROUTER_API_KEY;
  if (req.method === 'GET') return res.status(200).json({ sleutel: Boolean(key), model: MODEL });
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Alleen POST' });
  if (!key) return res.status(503).json({ fout: 'geen-sleutel' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const persona = PERSONAS[body.persona];
  if (!persona) return res.status(400).json({ fout: 'Onbekende klant' });
  const geschiedenis = (Array.isArray(body.geschiedenis) ? body.geschiedenis : []).slice(-30)
    .filter((b) => b && (b.wie === 'student' || b.wie === 'klant') && b.tekst)
    .map((b) => ({ role: b.wie === 'student' ? 'user' : 'assistant', content: kort(b.tekst, 700) }));

  try {
    if (body.mode === 'nabespreking') {
      const transcript = geschiedenis.map((b) => `${b.role === 'user' ? 'Student' : 'Klant'}: ${b.content}`).join('\n');
      const meters = kort(JSON.stringify(body.meters || []), 3000);
      const messages = [
        { role: 'system', content: `Je bent een ervaren praktijkdocent debiteurenbeheer. Je stapt uit de rol van de klant en bespreekt het oefengesprek na met de mbo-student.
De klant was: ${persona.tekst}
Succescriteria: ${CRITERIA[body.persona].join('; ')}.
Schrijf in het Nederlands, B1-niveau, tegen de student (jij-vorm), warm en eerlijk.
- samenvatting: één zin over hoe het gesprek ging.
- werkte: maximaal drie concrete dingen die goed gingen, met verwijzing naar wat de student zei.
- verbeterpunt: precies één verbeterpunt, het belangrijkste, met het moment in het gesprek.
- voorbeeldzin: een zin die de student op dat moment had kunnen zeggen.
- criteria: de drie succescriteria hierboven, elk met gehaald (true/false) en een korte toelichting.
- tip: één tip voor de volgende poging.` },
        { role: 'user', content: `Het gesprek:\n${transcript}\n\nVerloop van de meters per beurt (relatie, betaalbereid): ${meters}` },
      ];
      const { json } = await vraag(key, messages, 'nabespreking', NABESPREKING_SCHEMA, 2000);
      return res.status(200).json(json);
    }

    const stand = body.stand || persona.start;
    const beurt = klem(body.beurt, 0, 40);
    const opener = kort(body.opener, 120);
    const regie = `[Regie, niet hardop zeggen] Huidige stand: relatie ${klem(stand.relatie, 0, 100)}, betaalbereid ${klem(stand.betaalbereid, 0, 100)}. Dit is beurt ${beurt}.${beurt === 0 ? ` Je nam net de telefoon op met: "${opener || 'Hallo?'}". Nu begint de student.` : ''}`;
    const delen = [{ type: 'text', text: regie }];
    const getypt = kort(body.tekst, 700);
    if (body.audio && typeof body.audio === 'string' && body.audio.length < 4_000_000) {
      delen.push({ type: 'text', text: `De student zegt het volgende (audio).${getypt ? ` Automatische ondertitel ter controle: "${getypt}"` : ''}` });
      delen.push({ type: 'input_audio', input_audio: { data: body.audio, format: 'wav' } });
    } else if (getypt) {
      delen.push({ type: 'text', text: `De student zegt: "${getypt}"` });
    } else {
      return res.status(400).json({ fout: 'Geen tekst of audio ontvangen' });
    }
    const messages = [
      { role: 'system', content: `${ALGEMEEN}\n\n${persona.tekst}` },
      ...geschiedenis,
      { role: 'user', content: delen },
    ];
    const { json, model } = await vraag(key, messages, 'klantbeurt', BEURT_SCHEMA, 1200);
    return res.status(200).json({
      student_tekst: kort(json.student_tekst || getypt, 700),
      toon: kort(json.toon, 120),
      tekst: kort(json.tekst, 500),
      emotie: json.emotie,
      relatie: klem(json.relatie, 0, 100),
      betaalbereid: klem(json.betaalbereid, 0, 100),
      einde: Boolean(json.einde),
      notitie: kort(json.notitie, 240),
      stem: persona.stem,
      model,
    });
  } catch (e) {
    return res.status(502).json({ fout: e.message || 'Er ging iets mis bij het taalmodel' });
  }
}
