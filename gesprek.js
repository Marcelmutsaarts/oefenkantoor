// Het gesprek: briefing, het telefoongesprek (met de zaal of live), het gezicht van de klant, de stem en de nabespreking.
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
  const klem = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function toast(t, ms) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('on'), ms || 3800); }

  // ---------- overlays ----------
  const open = (id) => { $(id).classList.add('open'); verbergKantoor(); };
  const sluit = (id) => { $(id).classList.remove('open'); verbergKantoor(); };
  function verbergKantoor() {
    const iets = ['#briefing', '#gesprek', '#nabespreking', '#over'].some((id) => $(id).classList.contains('open'));
    document.body.classList.toggle('verborgen', iets || $('#paneel').classList.contains('open'));
    const zwaar = ['#gesprek', '#nabespreking'].some((id) => $(id).classList.contains('open'));
    if (window.Kantoor) window.Kantoor.pauze(zwaar);
  }

  // ---------- paneel per afdeling ----------
  const paneel = $('#paneel');
  function toonPaneel(id) {
    const a = window.AFDELINGEN.find((x) => x.id === id);
    if (!a) { paneel.classList.remove('open'); paneel.setAttribute('aria-hidden', 'true'); verbergKantoor(); return; }
    $('#pAfd').textContent = a.naam; $('#pTitel').textContent = a.titel; $('#pRol').textContent = a.rol;
    $('#pStudent').textContent = a.student; $('#pAi').textContent = a.ai; $('#pWaarom').textContent = a.waarom;
    $('#pVoorbeeld').innerHTML = a.voorbeeld.map(([w, t]) => `<div class="bel ${w}">${esc(t)}</div>`).join('');
    $('#pStart').hidden = !a.uitgewerkt; $('#pNoot').hidden = !!a.uitgewerkt;
    paneel.classList.add('open'); paneel.setAttribute('aria-hidden', 'false'); paneel.scrollTop = 0; verbergKantoor();
  }
  if (window.Kantoor) window.Kantoor.opKies(toonPaneel);
  $('#pSluit').addEventListener('click', () => window.Kantoor ? window.Kantoor.terug() : toonPaneel(null));
  $('#pStart').addEventListener('click', () => openBriefing('script'));
  $('#bOver').addEventListener('click', () => open('#over'));
  $('#oSluit').addEventListener('click', () => sluit('#over'));

  // ---------- is live beschikbaar? ----------
  let live = { gecheckt: false, ok: false };
  async function checkLive() {
    try {
      const r = await fetch('api/klant', { cache: 'no-store' });
      const j = await r.json(); live = { gecheckt: true, ok: !!j.sleutel };
    } catch (e) { live = { gecheckt: true, ok: false }; }
    const el = $('#liveStatus');
    el.textContent = live.ok ? 'Live staat klaar' : 'Live staat nog niet aan (geen sleutel of geen verbinding)';
    el.className = live.ok ? 'ok' : 'nee';
  }
  checkLive();

  // ---------- briefing ----------
  let keuze = { mode: 'script', klant: 'erik1' };
  function openBriefing(mode) {
    keuze.mode = mode || 'script'; if (keuze.mode === 'script') keuze.klant = 'erik1';
    renderBriefing(); open('#briefing'); if (!live.gecheckt || !live.ok) checkLive();
  }
  function renderBriefing() {
    $$('.mode').forEach((b) => b.classList.toggle('on', b.dataset.mode === keuze.mode));
    const kk = $('#klantKeuze'); kk.hidden = keuze.mode !== 'live';
    if (keuze.mode === 'live') {
      kk.innerHTML = Object.values(window.KLANTEN).map((k) => `<button class="kk${k.id === keuze.klant ? ' on' : ''}" data-k="${k.id}"><i>${k.niveau}</i><b>${esc(k.naam)}</b><span>${esc(k.label)}</span></button>`).join('');
      $$('.kk').forEach((b) => b.addEventListener('click', () => { keuze.klant = b.dataset.k; renderBriefing(); }));
    }
    const k = window.KLANTEN[keuze.klant];
    $('#bKlant').textContent = `${k.naam} · ${k.bedrijf}`;
    $('#bFeiten').innerHTML = k.feiten.map(([a, b]) => `<div class="feit"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('');
    $('#bDoel').textContent = k.doel;
    $('#bCriteria').innerHTML = k.criteria.map((c) => `<li>${esc(c)}</li>`).join('');
    $('#bBel').textContent = `Bel ${k.naam.split(' ')[0] === 'Marja' ? 'mevrouw Jansen' : k.naam.split(' ')[0]}`;
  }
  $$('.mode').forEach((b) => b.addEventListener('click', () => { keuze.mode = b.dataset.mode; if (keuze.mode === 'script') keuze.klant = 'erik1'; renderBriefing(); }));
  $('#bTerug').addEventListener('click', () => sluit('#briefing'));
  $('#bBel').addEventListener('click', () => {
    if (keuze.mode === 'live' && !live.ok) { toast('Live staat nog niet aan. Zet de OpenRouter-sleutel in Vercel, of kies "Met de zaal".'); return; }
    ontgrendelAudio(); sluit('#briefing'); startGesprek(keuze.mode, keuze.klant);
  });

  // ---------- het gezicht van de klant ----------
  const GEZICHT = {
    erik: { huid: '#e8b18b', huidD: '#d39672', haar: '#6e5d50', wenk: '#4a3b31', shirt: '#3e6fa8', schort: '#f7f4ee', lip: '#b8695c', pet: true, bril: false, bloem: true, achter: 'bakkerij' },
    jansen: { huid: '#f0c7a6', huidD: '#dba585', haar: '#cdb488', wenk: '#8d7458', shirt: '#2f7d8c', schort: null, lip: '#b54c5a', pet: false, bril: true, bloem: false, achter: 'lunchroom' },
  };
  function achtergrond(soort) {
    if (soort === 'lunchroom') return `
      <rect width="900" height="760" fill="#dbe7dc"/>
      <rect y="0" width="900" height="300" fill="#e7efe5"/>
      <rect x="40" y="70" width="230" height="150" rx="10" fill="#2f3a35"/><text x="155" y="125" fill="#f3f0e6" font-size="30" font-family="Georgia,serif" text-anchor="middle" font-style="italic">Lunch</text>
      <text x="155" y="162" fill="#cfe3d2" font-size="17" font-family="Georgia,serif" text-anchor="middle">soep · tosti · taart</text>
      <rect x="640" y="60" width="210" height="190" rx="8" fill="#f8fbff" stroke="#c9d8cb" stroke-width="8"/><line x1="745" y1="60" x2="745" y2="250" stroke="#c9d8cb" stroke-width="6"/>
      <rect x="610" y="330" width="250" height="180" rx="10" fill="#cfe1e8" opacity=".75"/><rect x="610" y="330" width="250" height="180" rx="10" fill="none" stroke="#9fb7bf" stroke-width="4"/>
      <circle cx="670" cy="420" r="34" fill="#e8b87a"/><circle cx="670" cy="412" r="34" fill="#f3d9b0"/><circle cx="760" cy="430" r="30" fill="#7a4a35"/><rect x="800" y="395" width="44" height="50" rx="6" fill="#f2b8c6"/>
      <rect x="60" y="300" width="150" height="230" rx="12" fill="#444b52"/><rect x="85" y="330" width="100" height="60" rx="6" fill="#2a2e33"/><circle cx="110" cy="430" r="10" fill="#a15df5"/>
      <path d="M150 530 q-30 -90 10 -150 q40 60 10 150z" fill="#6aa57a"/>
      <rect y="640" width="900" height="120" fill="#9a6b4b"/><rect y="630" width="900" height="16" fill="#b9845f"/>`;
    return `
      <defs><pattern id="tegels" width="64" height="44" patternUnits="userSpaceOnUse"><rect width="64" height="44" fill="#f4e8d6"/><rect x="1" y="1" width="62" height="42" fill="none" stroke="#e5d2b6" stroke-width="2"/></pattern></defs>
      <rect width="900" height="760" fill="url(#tegels)"/>
      <rect x="680" y="50" width="190" height="190" rx="6" fill="#dff0fb" stroke="#d6c3a5" stroke-width="10"/><line x1="775" y1="50" x2="775" y2="240" stroke="#d6c3a5" stroke-width="7"/><line x1="680" y1="145" x2="870" y2="145" stroke="#d6c3a5" stroke-width="7"/>
      <line x1="470" y1="0" x2="470" y2="40" stroke="#5b4636" stroke-width="3"/><path d="M420 40 h100 l-15 26 h-70z" fill="#3b2e26"/>
      <g><rect x="34" y="220" width="250" height="330" rx="14" fill="#5c6068"/><rect x="58" y="250" width="200" height="140" rx="10" fill="#26272c"/><rect x="58" y="410" width="200" height="22" rx="6" fill="#43464d"/>
        <circle cx="84" cy="470" r="12" fill="#43464d"/><circle cx="124" cy="470" r="12" fill="#43464d"/>
        <g transform="rotate(-8 160 320)"><rect x="92" y="294" width="140" height="52" rx="6" fill="#d64545"/><text x="162" y="330" fill="#fff" font-size="26" font-weight="800" font-family="sans-serif" text-anchor="middle">STORING</text></g></g>
      <rect x="640" y="300" width="230" height="12" rx="4" fill="#9b6a45"/><rect x="640" y="420" width="230" height="12" rx="4" fill="#9b6a45"/>
      <g fill="#c98a4b"><ellipse cx="680" cy="282" rx="34" ry="20"/><ellipse cx="755" cy="280" rx="38" ry="22"/><ellipse cx="830" cy="284" rx="30" ry="18"/><ellipse cx="690" cy="402" rx="36" ry="20"/><ellipse cx="770" cy="400" rx="34" ry="21"/><ellipse cx="840" cy="404" rx="26" ry="17"/></g>
      <g stroke="#a76a33" stroke-width="3" fill="none" opacity=".7"><path d="M665 278 l10 -8 M680 280 l10 -8 M695 282 l10 -8"/><path d="M740 276 l10 -8 M755 278 l10 -8 M770 280 l10 -8"/><path d="M755 396 l10 -8 M770 398 l10 -8"/></g>
      <rect y="640" width="900" height="120" fill="#8a5a3c"/><rect y="630" width="900" height="16" fill="#a86f4b"/>
      <rect x="690" y="560" width="150" height="80" rx="10" fill="#d9d4cc"/><rect x="705" y="575" width="80" height="30" rx="4" fill="#2b2b30"/>`;
  }
  function portretSVG(wie) {
    const g = GEZICHT[wie];
    return `<svg viewBox="0 0 900 760" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${wie === 'erik' ? 'Erik van Dam in zijn bakkerij' : 'Marja Jansen in haar lunchroom'}">
      ${achtergrond(g.achter)}
      <g id="fLijf">
        <path d="M250 760 C260 610 330 560 470 556 C610 560 680 610 690 760 Z" fill="${g.shirt}"/>
        ${g.schort ? `<path d="M360 760 L372 600 C410 590 530 590 568 600 L580 760 Z" fill="${g.schort}"/><path d="M372 600 L398 556 M568 600 L542 556" stroke="${g.schort}" stroke-width="16"/>
        <ellipse cx="430" cy="680" rx="26" ry="12" fill="#fff" opacity=".7"/>` : `<path d="M400 562 L470 640 L540 562" fill="none" stroke="#e8d9b8" stroke-width="5"/><circle cx="470" cy="642" r="9" fill="#e8c76a"/>`}
        <rect x="430" y="470" width="80" height="100" rx="30" fill="${g.huidD}"/>
      </g>
      <g id="fHoofd">
        <ellipse cx="352" cy="318" rx="20" ry="30" fill="${g.huidD}"/><ellipse cx="588" cy="318" rx="20" ry="30" fill="${g.huidD}"/>
        <ellipse cx="470" cy="300" rx="120" ry="146" fill="${g.huid}"/>
        ${wie === 'erik' ? `<path d="M360 250 C360 160 420 140 470 140 C540 140 586 170 582 250 C566 200 520 190 470 192 C420 192 378 205 360 250Z" fill="${g.haar}"/>
          <ellipse cx="470" cy="392" rx="96" ry="54" fill="#8d6e5c" opacity=".16"/>` :
          `<path d="M340 330 C320 190 390 128 470 128 C560 128 624 190 600 330 C596 280 580 230 552 208 C520 230 440 236 384 214 C360 240 346 280 340 330Z" fill="${g.haar}"/>
          <path d="M340 330 C336 380 344 410 360 430 L366 330Z M600 330 C604 380 596 410 580 430 L574 330Z" fill="${g.haar}"/>`}
        ${g.pet ? `<path d="M372 196 C380 138 560 138 568 196 C560 212 380 212 372 196Z" fill="#fbfaf6"/><path d="M372 196 C430 214 510 214 568 196" stroke="#e4dfd2" stroke-width="5" fill="none"/>` : ''}
        <ellipse id="fWangL" cx="400" cy="360" rx="30" ry="18" fill="#e9826f" opacity="0"/><ellipse id="fWangR" cx="540" cy="360" rx="30" ry="18" fill="#e9826f" opacity="0"/>
        ${g.bloem ? '<ellipse cx="545" cy="372" rx="16" ry="8" fill="#fff" opacity=".55" transform="rotate(-20 545 372)"/>' : ''}
        <g id="fOgen">
          <g id="fOogL"><ellipse cx="420" cy="300" rx="20" ry="14" fill="#fff"/><circle id="fPupL" cx="420" cy="301" r="9" fill="#3a2c24"/><circle cx="423" cy="297" r="3" fill="#fff"/></g>
          <g id="fOogR"><ellipse cx="520" cy="300" rx="20" ry="14" fill="#fff"/><circle id="fPupR" cx="520" cy="301" r="9" fill="#3a2c24"/><circle cx="523" cy="297" r="3" fill="#fff"/></g>
        </g>
        <path id="fWenkL" d="M392 268 Q420 258 446 266" stroke="${g.wenk}" stroke-width="${wie === 'erik' ? 11 : 7}" stroke-linecap="round" fill="none"/>
        <path id="fWenkR" d="M494 266 Q520 258 548 268" stroke="${g.wenk}" stroke-width="${wie === 'erik' ? 11 : 7}" stroke-linecap="round" fill="none"/>
        ${g.bril ? `<g fill="none" stroke="#7b5a3c" stroke-width="5"><circle cx="420" cy="301" r="32"/><circle cx="520" cy="301" r="32"/><path d="M452 298 Q470 288 488 298"/><path d="M388 296 L356 288 M552 296 L584 288"/></g>` : ''}
        <path d="M470 300 C462 330 456 352 462 362 C468 368 478 368 484 362" stroke="${g.huidD}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path id="fMond" d="M420 400 Q470 405 520 400 Q470 410 420 400Z" fill="#6e2a2a" stroke="${g.lip}" stroke-width="7" stroke-linejoin="round"/>
      </g>
      <g id="fHand">
        <rect x="292" y="250" width="58" height="118" rx="14" fill="#1f1d24" transform="rotate(-14 320 310)"/>
        <ellipse cx="318" cy="352" rx="38" ry="46" fill="${g.huid}"/>
        <path d="M290 330 q30 -14 60 0" stroke="${g.huidD}" stroke-width="4" fill="none"/>
      </g>
    </svg>`;
  }
  const EMO = {
    neutraal: { bh: 0, ba: 0, smile: 0.08, w: 1, open: 0, blush: 0, oog: 1, kx: 0, ky: 0 },
    geirriteerd: { bh: 6, ba: -10, smile: -0.4, w: 0.88, open: 0, blush: 0.12, oog: 0.78, kx: 0, ky: 0 },
    boos: { bh: 10, ba: -18, smile: -0.65, w: 0.95, open: 0.18, blush: 0.55, oog: 0.9, kx: 0, ky: 0 },
    nadenkend: { bh: -4, ba: 6, smile: -0.08, w: 0.82, open: 0, blush: 0, oog: 0.92, kx: 7, ky: -6 },
    opgelucht: { bh: -6, ba: 9, smile: 0.38, w: 1.05, open: 0.05, blush: 0.1, oog: 1, kx: 0, ky: 0 },
    tevreden: { bh: -3, ba: 2, smile: 0.75, w: 1.1, open: 0.04, blush: 0.18, oog: 0.72, kx: 0, ky: 0 },
  };
  const gezicht = { wie: 'erik', emo: 'neutraal', cur: Object.assign({}, EMO.neutraal), mond: 0, spreekt: false, knipper: 0, volgendKnipper: 2, t: 0 };
  function zetEmotie(e) { gezicht.emo = EMO[e] ? e : 'neutraal'; }
  function tekenGezicht(dt) {
    const svg = $('#portret svg'); if (!svg) return;
    gezicht.t += dt; const d = EMO[gezicht.emo], c = gezicht.cur, k = Math.min(1, dt * 5);
    for (const key in d) c[key] += (d[key] - c[key]) * k;
    // mond: emotie plus spreken (volume van de stem)
    let doelOpen = c.open;
    if (gezicht.spreekt) doelOpen = c.open + 0.15 + stemVolume() * 0.95;
    gezicht.mond += (doelOpen - gezicht.mond) * Math.min(1, dt * 18);
    const cx = 470, cy = 402, hw = 50 * c.w, hoek = -c.smile * 16;
    const boven = cy - 4 - c.smile * 4 + gezicht.mond * 4, onder = cy + 6 + c.smile * 16 + gezicht.mond * 46;
    $('#fMond').setAttribute('d', `M${cx - hw} ${cy + hoek} Q${cx} ${boven} ${cx + hw} ${cy + hoek} Q${cx} ${onder} ${cx - hw} ${cy + hoek}Z`);
    const yb = 266 + c.bh, bin = -c.ba;
    $('#fWenkL').setAttribute('d', `M392 ${yb + 3 - bin * 0.2} Q420 ${yb - 8} 446 ${yb + bin}`);
    $('#fWenkR').setAttribute('d', `M494 ${yb + bin} Q520 ${yb - 8} 548 ${yb + 3 - bin * 0.2}`);
    $('#fWangL').setAttribute('opacity', c.blush.toFixed(2)); $('#fWangR').setAttribute('opacity', c.blush.toFixed(2));
    // knipperen en kijken
    gezicht.volgendKnipper -= dt; if (gezicht.volgendKnipper <= 0) { gezicht.knipper = 0.14; gezicht.volgendKnipper = 2.5 + Math.random() * 3.5; }
    gezicht.knipper = Math.max(0, gezicht.knipper - dt);
    const oog = (gezicht.knipper > 0 ? 0.08 : c.oog);
    [['#fOogL', 420], ['#fOogR', 520]].forEach(([s, ox]) => $(s).setAttribute('transform', `translate(${ox} 300) scale(1 ${oog.toFixed(3)}) translate(${-ox} -300)`));
    const kx = c.kx + Math.sin(gezicht.t * 0.7) * 1.5, ky = c.ky;
    $('#fPupL').setAttribute('cx', 420 + kx); $('#fPupL').setAttribute('cy', 301 + ky); $('#fPupR').setAttribute('cx', 520 + kx); $('#fPupR').setAttribute('cy', 301 + ky);
    const kant = Math.sin(gezicht.t * 0.6) * 1.4 + (gezicht.emo === 'nadenkend' ? 3 : 0);
    $('#fHoofd').setAttribute('transform', `rotate(${kant.toFixed(2)} 470 420)`);
    $('#fLijf').setAttribute('transform', `translate(0 ${(Math.sin(gezicht.t * 1.3) * 2).toFixed(2)})`);
    $('#fHand').setAttribute('transform', `rotate(${kant.toFixed(2)} 470 420)`);
  }

  // ---------- de stem ----------
  const audio = $('#stemAudio');
  let actx = null, analyser = null, buf = null;
  function ontgrendelAudio() {
    try {
      if (!actx) { actx = new (window.AudioContext || window.webkitAudioContext)(); const src = actx.createMediaElementSource(audio); analyser = actx.createAnalyser(); analyser.fftSize = 512; buf = new Uint8Array(analyser.fftSize); src.connect(analyser); analyser.connect(actx.destination); }
      if (actx.state === 'suspended') actx.resume();
    } catch (e) { /* lip-sync valt dan terug op een eenvoudige beweging */ }
    try { speechSynthesis.getVoices(); } catch (e) {}
  }
  let nepVolume = false;
  function stemVolume() {
    if (nepVolume) return 0.35 + 0.35 * Math.abs(Math.sin(gezicht.t * 13)) * (0.6 + 0.4 * Math.sin(gezicht.t * 3.1));
    if (!analyser || audio.paused) return 0;
    analyser.getByteTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; s += v * v; }
    return klem(Math.sqrt(s / buf.length) * 5.5, 0, 1);
  }
  const Stem = { aan: true, api: null, cache: new Map() };
  function haalStem(tekst, wie, emotie) {
    const sleutel = `${wie}|${emotie}|${tekst}`;
    if (Stem.cache.has(sleutel)) return Stem.cache.get(sleutel);
    const p = fetch('api/stem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tekst, wie, emotie }) })
      .then((r) => { if (!r.ok) throw new Error('stem ' + r.status); return r.blob(); })
      .then((b) => { Stem.api = true; return URL.createObjectURL(b); })
      .catch((e) => { Stem.api = false; Stem.cache.delete(sleutel); throw e; });
    Stem.cache.set(sleutel, p); return p;
  }
  function voorlaad(tekst, wie, emotie) { if (Stem.aan && Stem.api !== false && live.ok) haalStem(tekst, wie, emotie).catch(() => {}); }
  function browserStem(tekst, wie) {
    return new Promise((klaar) => {
      if (!('speechSynthesis' in window)) return klaar();
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(tekst); u.lang = 'nl-NL'; u.rate = 1.02;
        const vs = speechSynthesis.getVoices().filter((v) => /^nl/i.test(v.lang));
        const man = /maarten|frank|arnaud|guus|colin|man|male/i, vrouw = /fenna|colette|ellen|laura|vrouw|female/i;
        u.voice = vs.find((v) => (wie === 'jansen' ? vrouw : man).test(v.name) && /natural|online/i.test(v.name)) || vs.find((v) => (wie === 'jansen' ? vrouw : man).test(v.name)) || vs.find((v) => /natural|online/i.test(v.name)) || vs[0] || null;
        nepVolume = true; u.onend = u.onerror = () => { nepVolume = false; klaar(); };
        speechSynthesis.speak(u);
        setTimeout(() => { if (nepVolume) { nepVolume = false; klaar(); } }, 4000 + tekst.length * 90);
      } catch (e) { nepVolume = false; klaar(); }
    });
  }
  async function spreek(tekst, wie, emotie) {
    zetEmotie(emotie); toonOndertitel(tekst, wie);
    gezicht.spreekt = true;
    try {
      if (!Stem.aan) { nepVolume = true; await wacht(Math.max(1300, tekst.length * 48)); nepVolume = false; return; }
      if (live.ok && Stem.api !== false) {
        try {
          const url = await Promise.race([haalStem(tekst, wie, emotie), wacht(9000).then(() => { throw new Error('te traag'); })]);
          audio.src = url; ontgrendelAudio(); await audio.play();
          await new Promise((r) => { audio.onended = r; audio.onerror = r; setTimeout(r, 30000); });
          return;
        } catch (e) { /* door naar de browserstem */ }
      }
      await browserStem(tekst, wie);
    } finally { gezicht.spreekt = false; nepVolume = false; }
  }
  function stopStem() { try { audio.pause(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} gezicht.spreekt = false; nepVolume = false; }
  $('#gStem').addEventListener('click', () => {
    Stem.aan = !Stem.aan; const b = $('#gStem'); b.textContent = Stem.aan ? 'Stem: aan' : 'Stem: uit'; b.classList.toggle('on', Stem.aan); b.setAttribute('aria-pressed', Stem.aan);
    if (!Stem.aan) stopStem();
  });
  function toonOndertitel(tekst, wie) {
    const el = $('#gZegt'); el.innerHTML = `<span class="wie">${wie === 'jansen' ? 'Marja Jansen' : 'Erik van Dam'}</span>${esc(tekst)}`; el.classList.add('on');
  }

  // ---------- meters ----------
  const M = { relatie: 0, betaalbereid: 0, reeks: [] };
  function zetMeters(r, b, metDelta) {
    const dR = r - M.relatie, dB = b - M.betaalbereid; M.relatie = r; M.betaalbereid = b;
    [['#mRel', r, dR], ['#mBet', b, dB]].forEach(([id, v, d]) => {
      $(id + ' b').textContent = Math.round(v); $(id + ' .m-bar span').style.width = v + '%';
      const de = $(id + ' .delta'); de.className = 'delta';
      if (metDelta && Math.round(d) !== 0) { de.textContent = (d > 0 ? '+' : '−') + Math.abs(Math.round(d)); de.classList.add(d > 0 ? 'plus' : 'min'); }
    });
    tekenSpark();
  }
  function tekenSpark() {
    const r = M.reeks; if (r.length < 2) { $('#mSpark').innerHTML = ''; return; }
    const x = (i) => (i / Math.max(1, r.length - 1)) * 296 + 2, y = (v) => 44 - (v / 100) * 40;
    const lijn = (k) => r.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(' ');
    $('#mSpark').innerHTML = `<path d="${lijn('relatie')}" fill="none" stroke="#119a77" stroke-width="2.5"/><path d="${lijn('betaalbereid')}" fill="none" stroke="#d9891a" stroke-width="2.5"/>`;
  }

  // ---------- het gesprek ----------
  const G = { mode: 'script', klant: null, knoop: null, pad: [], afspraak: false, bevestigd: false, opgehangen: false, bezig: false, klaar: false, start: 0, geschiedenis: [], notities: [] };
  let timerId = null;
  function startGesprek(mode, klantId) {
    const k = window.KLANTEN[klantId];
    Object.assign(G, { mode, klant: k, knoop: null, pad: [], afspraak: false, bevestigd: false, opgehangen: false, bezig: false, klaar: false, start: performance.now(), geschiedenis: [], notities: [] });
    $('#portret').innerHTML = portretSVG(k.gezicht); gezicht.wie = k.gezicht; gezicht.cur = Object.assign({}, EMO.neutraal); zetEmotie('neutraal');
    $('#gWie').textContent = `In gesprek met ${k.naam}`; $('#gBedrijf').textContent = k.bedrijf;
    $('#gModus').textContent = mode === 'live' ? 'Live · AI' : 'Met de zaal';
    $('#gKaartPaneel').innerHTML = `<h4>${esc(k.naam)}</h4>` + k.feiten.map(([a, b]) => `<div class="feit"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join(''); $('#gKaartPaneel').hidden = true; $('#gKaart').classList.remove('on');
    $('#gZegt').classList.remove('on'); $('#gJij').hidden = true; $('#gVraag').textContent = ''; $('#gOpties').innerHTML = '';
    $('#gLive').hidden = mode !== 'live'; $('#gCaption').textContent = 'Houd de knop vast (of de spatiebalk) en praat. Laat los als je klaar bent.'; $('#gCaption').classList.add('leeg'); $('#gInput').value = '';
    M.relatie = 0; M.betaalbereid = 0; M.reeks = [{ relatie: k.start.relatie, betaalbereid: k.start.betaalbereid, label: 'start' }]; zetMeters(k.start.relatie, k.start.betaalbereid, false);
    open('#gesprek');
    clearInterval(timerId); timerId = setInterval(() => { const s = Math.floor((performance.now() - G.start) / 1000); $('#gTijd').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 500);
    startLus();
    (async () => {
      await wacht(700);
      const opener = mode === 'script' ? window.SCRIPT.opener : { tekst: k.opener, emotie: k.id === 'erik2' ? 'geirriteerd' : 'neutraal' };
      if (mode === 'script') voorlaadKnoop('n1');
      await spreek(opener.tekst, k.stem, opener.emotie);
      if (mode === 'script') toonKnoop('n1'); else { $('#gCaption').textContent = 'Jij bent aan de beurt. Houd de knop vast en praat.'; }
    })();
  }
  function stopGesprek() { clearInterval(timerId); stopStem(); stopOpname(true); G.klaar = true; }
  $('#gTerug').addEventListener('click', () => { stopGesprek(); sluit('#gesprek'); });
  $('#gKaart').addEventListener('click', () => { const p = $('#gKaartPaneel'); p.hidden = !p.hidden; $('#gKaart').classList.toggle('on', !p.hidden); });

  // met de zaal: het script
  function voorlaadKnoop(id) {
    const kn = window.SCRIPT.knopen[id]; if (!kn) return;
    kn.opties.forEach((o) => { const r = o.reactie.warm ? [o.reactie.warm, o.reactie.koel] : [o.reactie]; r.forEach((x) => voorlaad(x.tekst, 'erik', x.emotie)); });
  }
  function toonKnoop(id) {
    const kn = window.SCRIPT.knopen[id]; G.knoop = id;
    $('#gVraag').textContent = kn.vraag;
    $('#gOpties').className = 'opties';
    $('#gOpties').innerHTML = kn.opties.map((o, i) => `<button class="optie" data-i="${i}"><span class="letter">${'ABC'[i]}</span><span>${esc(o.tekst)}</span></button>`).join('');
    $$('#gOpties .optie').forEach((b) => b.addEventListener('click', () => kiesOptie(+b.dataset.i)));
    voorlaadKnoop(id);
  }
  async function kiesOptie(i) {
    if (G.bezig || G.klaar || !G.knoop) return;
    G.bezig = true;
    const kn = window.SCRIPT.knopen[G.knoop], o = kn.opties[i];
    $('#gOpties').classList.add('wacht');
    $$('#gOpties .optie').forEach((b, j) => b.classList.add(j === i ? 'gekozen' : 'weg'));
    $('#gJij').hidden = false; $('#gJij').innerHTML = `<span>Jij</span><p>${esc(o.tekst)}</p>`;
    await wacht(650);
    const r = klem(M.relatie + o.dR, 0, 100), b = klem(M.betaalbereid + o.dB, 0, 100);
    if (o.afspraak) G.afspraak = true; if (o.bevestigd) G.bevestigd = true;
    const reactie = o.reactie.warm ? (r >= 55 ? o.reactie.warm : o.reactie.koel) : o.reactie;
    G.pad.push({ knoop: G.knoop, i, tag: o.tag, dR: o.dR, dB: o.dB, tekst: o.tekst, reactie: reactie.tekst });
    M.reeks.push({ relatie: r, betaalbereid: b, label: o.tag, dR: o.dR, dB: o.dB });
    zetMeters(r, b, true);
    await spreek(reactie.tekst, 'erik', reactie.emotie);
    if (r <= 20) {
      G.opgehangen = true; await wacht(300);
      await spreek(window.SCRIPT.ophangen.tekst, 'erik', window.SCRIPT.ophangen.emotie);
      return eindeGesprek('Erik heeft opgehangen.');
    }
    G.bezig = false;
    if (o.next) toonKnoop(o.next); else eindeGesprek('Het gesprek is afgerond.');
  }
  async function eindeGesprek(tekst) {
    G.klaar = true; clearInterval(timerId);
    $('#gVraag').textContent = tekst; $('#gOpties').className = 'opties';
    $('#gOpties').innerHTML = '<button class="cta" id="gNaarNb">Naar de nabespreking</button>';
    $('#gNaarNb').addEventListener('click', () => G.mode === 'live' ? nabesprekingLive() : nabesprekingScript());
    if (G.mode === 'live') $('#gLive').hidden = true;
  }

  // ---------- live: opnemen, luisteren, antwoorden ----------
  let opname = null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  async function startOpname() {
    if (G.mode !== 'live' || G.bezig || G.klaar || opname) return;
    stopStem();
    const ondertitel = $('#gCaption'); ondertitel.classList.remove('leeg'); ondertitel.textContent = 'Ik luister…';
    const o = { chunks: [], tekst: '', klaar: null };
    opname = o;
    try {
      if (!G.stream) G.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (opname !== o) return;
      o.rec = new MediaRecorder(G.stream); o.rec.ondataavailable = (e) => e.data && e.data.size && o.chunks.push(e.data);
      o.klaar = new Promise((r) => { o.rec.onstop = r; }); o.rec.start();
    } catch (e) { opname = null; toast('De microfoon werkt niet in deze browser. Typ wat je zegt.'); ondertitel.textContent = 'Typ wat je zegt in het veld hieronder.'; return; }
    $('#gMic').classList.add('op'); $('#gMic').textContent = 'Laat los om te versturen';
    if (SR) {
      try {
        const sr = new SR(); sr.lang = 'nl-NL'; sr.interimResults = true; sr.continuous = true;
        sr.onresult = (ev) => { let t = ''; for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript; o.tekst = t; ondertitel.textContent = t || 'Ik luister…'; };
        sr.onerror = () => {}; sr.start(); o.sr = sr;
      } catch (e) {}
    }
  }
  async function stopOpname(afbreken) {
    const o = opname; if (!o) return; opname = null;
    $('#gMic').classList.remove('op'); $('#gMic').textContent = 'Houd vast en praat';
    try { o.sr && o.sr.stop(); } catch (e) {}
    try { if (o.rec && o.rec.state !== 'inactive') o.rec.stop(); } catch (e) {}
    if (afbreken || !o.rec) return;
    await o.klaar; await wacht(150);
    let audioB64 = null;
    try { const blob = new Blob(o.chunks, { type: o.rec.mimeType || 'audio/webm' }); if (blob.size > 2000) audioB64 = await naarWav(blob); } catch (e) { audioB64 = null; }
    if (!audioB64 && !o.tekst) { $('#gCaption').textContent = 'Ik hoorde niets. Houd de knop iets langer vast.'; return; }
    stuurBeurt({ audio: audioB64, tekst: o.tekst });
  }
  async function naarWav(blob) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const ab = await ctx.decodeAudioData(await blob.arrayBuffer()); ctx.close && ctx.close();
    const sr = 16000, lengte = Math.ceil(ab.duration * sr);
    const off = new OfflineAudioContext(1, lengte, sr); const s = off.createBufferSource(); s.buffer = ab; s.connect(off.destination); s.start();
    const data = (await off.startRendering()).getChannelData(0);
    const wav = new DataView(new ArrayBuffer(44 + data.length * 2));
    const str = (o, t) => { for (let i = 0; i < t.length; i++) wav.setUint8(o + i, t.charCodeAt(i)); };
    str(0, 'RIFF'); wav.setUint32(4, 36 + data.length * 2, true); str(8, 'WAVE'); str(12, 'fmt '); wav.setUint32(16, 16, true); wav.setUint16(20, 1, true); wav.setUint16(22, 1, true);
    wav.setUint32(24, sr, true); wav.setUint32(28, sr * 2, true); wav.setUint16(32, 2, true); wav.setUint16(34, 16, true); str(36, 'data'); wav.setUint32(40, data.length * 2, true);
    for (let i = 0; i < data.length; i++) wav.setInt16(44 + i * 2, klem(data[i], -1, 1) * 0x7fff, true);
    const bytes = new Uint8Array(wav.buffer); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  async function stuurBeurt({ audio: audioB64, tekst }) {
    if (G.bezig || G.klaar) return;
    G.bezig = true; const mic = $('#gMic'); mic.classList.add('denkt'); mic.textContent = 'Erik denkt na…';
    if (G.klant.id === 'jansen') mic.textContent = 'Mevrouw Jansen denkt na…';
    $('#gJij').hidden = false; $('#gJij').innerHTML = `<span>Jij</span><p>${esc(tekst || '…')}</p>`;
    try {
      const r = await fetch('api/klant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        mode: 'beurt', persona: G.klant.id, geschiedenis: G.geschiedenis, stand: { relatie: M.relatie, betaalbereid: M.betaalbereid },
        beurt: G.geschiedenis.filter((x) => x.wie === 'student').length, audio: audioB64, tekst, opener: G.klant.opener }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.fout === 'geen-sleutel' ? 'De sleutel ontbreekt in Vercel.' : (j.fout || 'Het taalmodel gaf geen antwoord.'));
      const studentTekst = j.student_tekst || tekst || '';
      $('#gJij').innerHTML = `<span>Jij</span><p>${esc(studentTekst)}</p>${j.toon ? `<i class="toon">Erik hoorde: ${esc(j.toon)}</i>` : ''}`;
      if (G.klant.id === 'jansen' && j.toon) $('#gJij .toon').textContent = `Mevrouw Jansen hoorde: ${j.toon}`;
      G.geschiedenis.push({ wie: 'student', tekst: studentTekst }, { wie: 'klant', tekst: j.tekst });
      G.notities.push(j.notitie || '');
      M.reeks.push({ relatie: j.relatie, betaalbereid: j.betaalbereid, label: j.notitie || '', dR: j.relatie - M.relatie, dB: j.betaalbereid - M.betaalbereid });
      zetMeters(j.relatie, j.betaalbereid, true);
      $('#gCaption').textContent = 'Houd de knop vast en praat verder.'; $('#gCaption').classList.add('leeg');
      await spreek(j.tekst, G.klant.stem, j.emotie);
      if (j.einde) { G.bezig = false; return eindeGesprek('Het gesprek is afgelopen.'); }
    } catch (e) {
      toast('Live lukt nu niet: ' + e.message + ' Je kunt het opnieuw proberen of terug naar het script.', 6000);
      $('#gCaption').textContent = 'Dat lukte niet. Probeer het nog eens, of typ je zin.';
    } finally { G.bezig = false; mic.classList.remove('denkt'); mic.textContent = 'Houd vast en praat'; }
  }
  const mic = $('#gMic');
  mic.addEventListener('pointerdown', (e) => { e.preventDefault(); ontgrendelAudio(); startOpname(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => mic.addEventListener(ev, () => { if (opname) stopOpname(false); }));
  $('#gTyp').addEventListener('submit', (e) => { e.preventDefault(); const t = $('#gInput').value.trim(); if (!t) return; $('#gInput').value = ''; ontgrendelAudio(); stuurBeurt({ audio: null, tekst: t }); });
  $('#gAfronden').addEventListener('click', () => { if (G.geschiedenis.length < 2) { toast('Voer eerst een stukje gesprek, dan valt er iets na te bespreken.'); return; } stopGesprek(); nabesprekingLive(); });

  // ---------- nabespreking ----------
  function tekenGrafiek(reeks) {
    const W = 640, H = 280, l = 44, r = 18, t = 22, b = 40, n = Math.max(1, reeks.length - 1);
    const x = (i) => l + (i / n) * (W - l - r), y = (v) => t + (1 - v / 100) * (H - t - b);
    let s = '';
    [0, 25, 50, 75, 100].forEach((v) => { s += `<line x1="${l}" x2="${W - r}" y1="${y(v)}" y2="${y(v)}" stroke="#eee8f6"/><text x="${l - 8}" y="${y(v) + 4}" font-size="11" fill="#8a8299" text-anchor="end">${v}</text>`; });
    reeks.forEach((p, i) => { s += `<text x="${x(i)}" y="${H - 16}" font-size="11" fill="#8a8299" text-anchor="middle">${i === 0 ? 'start' : i}</text>`; });
    // kantelmomenten: grootste stap omhoog en omlaag
    let max = null, min = null;
    reeks.forEach((p, i) => { if (!i) return; const d = (p.dR || 0) + (p.dB || 0) * 0.6; if (!max || d > max.d) max = { i, d }; if (!min || d < min.d) min = { i, d }; });
    [[max, '#119a77', 1], [min, '#d64545', -1]].forEach(([m, kleur, teken]) => {
      if (!m || m.d * teken < 6) return; const p = reeks[m.i];
      s += `<rect x="${x(m.i) - 16}" y="${t - 6}" width="32" height="${H - t - b + 10}" rx="10" fill="${kleur}" opacity=".08"/>`;
      const naam = labelVoor(p.label), px = x(m.i);
      const anker = px > W * 0.72 ? 'end' : px < W * 0.28 ? 'start' : 'middle', tx = anker === 'end' ? px + 14 : anker === 'start' ? px - 14 : px;
      s += `<text x="${tx}" y="${t + 4}" font-size="11.5" font-weight="700" fill="${kleur}" text-anchor="${anker}">${esc(naam)}</text>`;
    });
    const pad = (k) => reeks.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(' ');
    s += `<path d="${pad('relatie')}" fill="none" stroke="#119a77" stroke-width="3.5" stroke-linejoin="round"/>`;
    s += `<path d="${pad('betaalbereid')}" fill="none" stroke="#d9891a" stroke-width="3.5" stroke-linejoin="round"/>`;
    reeks.forEach((p, i) => { s += `<circle cx="${x(i)}" cy="${y(p.relatie)}" r="4.5" fill="#119a77"/><circle cx="${x(i)}" cy="${y(p.betaalbereid)}" r="4.5" fill="#d9891a"/>`; });
    $('#nbChart').innerHTML = s;
  }
  const KORT = { voorstellen: 'netjes voorstellen', feiten: 'feiten noemen', luisteren: 'samenvatten', openvraag: 'open vraag', concreet: 'concreet voorstel', herstel: 'herstellen', bevestigen: 'bevestigen', deurinhuis: 'deur in huis', amicaal: 'te amicaal', drukzetten: 'druk zetten', vaag: 'vaag blijven', opgeven: 'doel loslaten', geenbevestiging: 'niet bevestigd', streng: 'te star', koel: 'koel reageren' };
  function labelVoor(l) { if (!l) return ''; if (KORT[l]) return KORT[l]; return l.length > 34 ? l.slice(0, 32) + '…' : l; }

  function nabesprekingScript() {
    const pad = G.pad, tags = pad.map((p) => p.tag), T = window.TAGS;
    const R = M.relatie;
    let titel, klasse, samen;
    if (G.opgehangen) { titel = 'Erik hing op'; klasse = 'slecht'; samen = 'De druk liep zo op dat Erik het gesprek beëindigde. Er is geen afspraak, en de klant overweegt over te stappen.'; }
    else if (G.afspraak && G.bevestigd && R >= 70) { titel = 'Afspraak gemaakt, en Erik blijft klant'; klasse = 'goed'; samen = 'Je kreeg een concrete betaalafspraak, en Erik voelde zich serieus genomen.'; }
    else if (G.afspraak) { titel = 'Afspraak gemaakt, maar het kostte iets'; klasse = 'half'; samen = R < 70 ? 'Er is een afspraak, maar de relatie met Erik heeft een deuk opgelopen.' : 'Er is een afspraak, maar je hebt hem niet bevestigd.'; }
    else if (R >= 60) { titel = 'Prettig gesprek, maar geen harde afspraak'; klasse = 'half'; samen = 'Erik voelde zich gehoord, maar er ligt geen concrete afspraak met bedragen en datums.'; }
    else { titel = 'Geen afspraak, en een geïrriteerde klant'; klasse = 'slecht'; samen = 'Er is geen afspraak gemaakt, en Erik is er niet blijer op geworden.'; }
    const goed = [...new Set(tags.filter((t) => T[t] && T[t].goed))].slice(0, 3).map((t) => T[t].tekst);
    const fout = pad.filter((p) => T[p.tag] && !T[p.tag].goed).sort((a, b) => (a.dR + a.dB * 0.5) - (b.dR + b.dB * 0.5))[0];
    let beter = 'Je maakte geen grote fouten. Probeer het nu live, met een lastiger klant.', alt = '';
    if (fout) {
      const kn = window.SCRIPT.knopen[fout.knoop]; const best = kn.opties.slice().sort((a, b) => (b.dR + b.dB) - (a.dR + a.dB))[0];
      beter = T[fout.tag].tekst;
      alt = `<b>Je zei</b>${esc(fout.tekst)}<br><br><b>Probeer</b>${esc(best.tekst)}`;
    }
    const crit = [
      ['Je luistert en vat samen', tags.includes('luisteren') || tags.includes('herstel')],
      ['Je blijft vriendelijk én duidelijk', !tags.some((t) => ['drukzetten', 'koel', 'vaag', 'opgeven', 'streng'].includes(t))],
      ['Je eindigt met een concrete afspraak die je bevestigt', G.afspraak && G.bevestigd],
    ].map(([n, ja]) => ({ naam: n, gehaald: ja, toelichting: '' }));
    toonNabespreking({ titel, klasse, samen, goed, beter, alt, crit, doorAi: false });
  }
  async function nabesprekingLive() {
    sluit('#gesprek');
    toonNabespreking({ titel: 'De nabespreking wordt gemaakt…', klasse: 'half', samen: 'De AI stapt uit de rol en leest het gesprek terug.', goed: [], beter: '', alt: '', crit: [], doorAi: true, laden: true });
    try {
      const r = await fetch('api/klant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'nabespreking', persona: G.klant.id, geschiedenis: G.geschiedenis, meters: M.reeks.map((p) => [p.relatie, p.betaalbereid]) }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.fout || 'Geen nabespreking ontvangen');
      const gehaald = (j.criteria || []).filter((c) => c.gehaald).length;
      toonNabespreking({ titel: gehaald === 3 ? 'Sterk gesprek' : gehaald === 2 ? 'Goed op weg' : 'Hier valt nog veel te leren', klasse: gehaald === 3 ? 'goed' : gehaald === 2 ? 'half' : 'slecht', samen: j.samenvatting, goed: j.werkte || [], beter: j.verbeterpunt, alt: j.voorbeeldzin ? `<b>Probeer bijvoorbeeld</b>${esc(j.voorbeeldzin)}` : '', crit: j.criteria || [], tip: j.tip, doorAi: true });
    } catch (e) {
      toonNabespreking({ titel: 'De nabespreking lukte niet', klasse: 'slecht', samen: 'Het taalmodel gaf geen antwoord: ' + e.message, goed: [], beter: '', alt: '', crit: [], doorAi: true });
    }
  }
  function toonNabespreking(d) {
    $('#nbTitel').innerHTML = esc(d.titel) + (d.doorAi && !d.laden ? '<span class="door-ai">door AI</span>' : '');
    $('#nbSamen').textContent = d.samen || '';
    const u = $('#nbUitkomst'); u.className = 'uitkomst ' + d.klasse; u.textContent = d.klasse === 'goed' ? 'Doel gehaald' : d.klasse === 'half' ? 'Deels gehaald' : 'Doel niet gehaald';
    u.hidden = !!d.laden;
    tekenGrafiek(M.reeks);
    $('#nbGoed').innerHTML = (d.goed.length ? d.goed : (d.laden ? ['…'] : ['Nog niets dat echt hielp. Kijk naar het verbeterpunt.'])).map((t) => `<li>${esc(t)}</li>`).join('');
    $('#nbBeter').textContent = d.beter || (d.laden ? '…' : ''); $('#nbAlt').innerHTML = d.alt || (d.tip ? `<b>Tip voor de volgende poging</b>${esc(d.tip)}` : ''); $('#nbAlt').hidden = !d.alt && !d.tip;
    $('#nbCrit').innerHTML = d.crit.map((c) => `<li class="${c.gehaald ? 'ja' : ''}">${esc(c.naam)}${c.toelichting ? `<small>${esc(c.toelichting)}</small>` : ''}</li>`).join('');
    $('#nbLive').hidden = G.mode === 'live';
    $('#nbOpnieuw').textContent = G.mode === 'live' ? 'Nog een gesprek' : 'Nieuwe poging';
    sluit('#gesprek'); open('#nabespreking');
  }
  $('#nbKantoor').addEventListener('click', () => { sluit('#nabespreking'); stopLus(); });
  $('#nbOpnieuw').addEventListener('click', () => { sluit('#nabespreking'); if (G.mode === 'live') openBriefing('live'); else { ontgrendelAudio(); startGesprek('script', 'erik1'); } });
  $('#nbLive').addEventListener('click', () => { sluit('#nabespreking'); openBriefing('live'); });

  // ---------- toetsen ----------
  addEventListener('keydown', (e) => {
    const inVeld = /INPUT|TEXTAREA/.test(e.target.tagName);
    if (e.key === 'Escape') {
      if ($('#over').classList.contains('open')) sluit('#over');
      else if ($('#nabespreking').classList.contains('open')) { sluit('#nabespreking'); stopLus(); }
      else if ($('#gesprek').classList.contains('open')) { stopGesprek(); sluit('#gesprek'); }
      else if ($('#briefing').classList.contains('open')) sluit('#briefing');
      else if ($('#paneel').classList.contains('open') && window.Kantoor) window.Kantoor.terug();
      return;
    }
    if (inVeld || !$('#gesprek').classList.contains('open')) return;
    if (G.mode === 'script') {
      const i = { a: 0, b: 1, c: 2, 1: 0, 2: 1, 3: 2 }[e.key.toLowerCase()];
      if (i !== undefined && $$('#gOpties .optie').length) { e.preventDefault(); kiesOptie(i); }
    } else if (e.code === 'Space' && !e.repeat) { e.preventDefault(); ontgrendelAudio(); startOpname(); }
  });
  addEventListener('keyup', (e) => { if (e.code === 'Space' && opname && G.mode === 'live') { e.preventDefault(); stopOpname(false); } });

  // ---------- animatielus voor het gezicht ----------
  let lusAan = false, vorige = 0;
  function lus(nu) { if (!lusAan) return; requestAnimationFrame(lus); const dt = Math.min(0.05, (nu - vorige) / 1000 || 0.016); vorige = nu; tekenGezicht(dt); }
  function startLus() { if (lusAan) return; lusAan = true; vorige = performance.now(); requestAnimationFrame(lus); }
  function stopLus() { lusAan = false; }

  // testhaak
  window.__gesprek = { G, M, Stem, step: (n, d) => { for (let i = 0; i < n; i++) tekenGezicht(d || 1 / 60); }, startGesprek, kiesOptie, openBriefing, nabesprekingScript, toonNabespreking, zetEmotie, live: () => live };
})();
