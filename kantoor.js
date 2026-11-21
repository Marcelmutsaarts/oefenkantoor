// Het 3D-kantoor van Veluwe Groothandel: zes afdelingen, elk met een student en een AI-collega.
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  if (!window.THREE) { $('#loader div').textContent = 'De 3D-bibliotheek kon niet laden. Controleer de internetverbinding.'; return; }

  const canvas = $('#scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const OVERZICHT = { pos: new THREE.Vector3(16.2, 22.5, 25.5), doel: new THREE.Vector3(-1.6, -0.8, -0.6) };
  camera.position.copy(OVERZICHT.pos);
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.copy(OVERZICHT.doel);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.minDistance = 9; controls.maxDistance = 80;
  controls.minPolarAngle = 0.45; controls.maxPolarAngle = 1.2;
  controls.minAzimuthAngle = -0.5; controls.maxAzimuthAngle = 1.45;
  controls.update();

  // licht
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9b8ec, 0.62));
  const zon = new THREE.DirectionalLight(0xfff1df, 1.35);
  zon.position.set(-8, 16, 10); zon.castShadow = true;
  zon.shadow.mapSize.set(2048, 2048);
  Object.assign(zon.shadow.camera, { left: -13, right: 13, top: 11, bottom: -11, near: 1, far: 50 });
  zon.shadow.bias = -0.0004; zon.shadow.radius = 4;
  scene.add(zon);
  const tegen = new THREE.DirectionalLight(0xd9c8ff, 0.35); tegen.position.set(12, 8, -10); scene.add(tegen);

  // hulpjes
  const mat = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75, metalness: 0 }, o || {}));
  function blok(w, h, d, m, x, y, z, ouder) {
    const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; (ouder || scene).add(me); return me;
  }
  function cil(rt, rb, h, m, x, y, z, ouder, seg) {
    const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), m);
    me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; (ouder || scene).add(me); return me;
  }
  function bol(r, m, x, y, z, ouder) {
    const me = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), m);
    me.position.set(x, y, z); me.castShadow = true; (ouder || scene).add(me); return me;
  }
  function tex(w, h, teken) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; teken(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  }

  // de sokkel en vloer
  const W = 20.4, D = 13.8;
  blok(W + 0.5, 0.7, D + 0.5, mat(0xffffff, { roughness: 0.6 }), 0, -0.36, 0);
  blok(W + 0.52, 0.12, D + 0.52, mat(0xa15df5, { roughness: 0.5 }), 0, -0.62, 0);
  const hout = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#d9c3a0'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) {
      const y = i * 32; g.fillStyle = i % 2 ? '#d3bb96' : '#dec9a8'; g.fillRect(0, y, w, 31);
      g.fillStyle = 'rgba(120,90,50,.10)'; g.fillRect(0, y + 31, w, 1);
      const off = (i * 137) % 256; g.fillRect(off, y, 1, 31); g.fillRect((off + 256) % w, y, 1, 31);
    }
  });
  hout.wrapS = hout.wrapT = THREE.RepeatWrapping; hout.repeat.set(4, 3);
  const vloer = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(0xffffff, { map: hout, roughness: 0.85 }));
  vloer.rotation.x = -Math.PI / 2; vloer.position.y = 0.002; vloer.receiveShadow = true; scene.add(vloer);

  // wanden: achter en links, met ramen
  const muurMat = mat(0xfbf9fd, { roughness: 0.9 });
  blok(W, 2.9, 0.22, muurMat, 0, 1.45, -D / 2 - 0.11);
  blok(0.22, 2.9, D, muurMat, -W / 2 - 0.11, 1.45, 0);
  const raamMat = mat(0xcfe6f7, { emissive: 0xbfdcf5, emissiveIntensity: 0.35, roughness: 0.2 });
  [-7.6, -5.2, -1.2, 1.2, 5.2, 7.6].forEach((x) => blok(1.7, 1.25, 0.04, raamMat, x, 1.75, -D / 2 + 0.01));
  [-4.6, -2, 2, 4.6].forEach((z) => blok(0.04, 1.25, 1.7, raamMat, -W / 2 + 0.01, 1.75, z));
  const plinten = mat(0xe8e0f3);
  blok(W, 0.12, 0.05, plinten, 0, 0.06, -D / 2 + 0.03); blok(0.05, 0.12, D, plinten, -W / 2 + 0.03, 0.06, 0);
  // bedrijfsnaam op de achterwand
  const bord = tex(1024, 160, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2b2140'; g.font = '800 72px "Plus Jakarta Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('VELUWE GROOTHANDEL', w / 2, h / 2 + 4);
  });
  const bordMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 0.84), new THREE.MeshBasicMaterial({ map: bord, transparent: true }));
  bordMesh.position.set(0, 2.55, -D / 2 + 0.02); scene.add(bordMesh);

  // glazen tussenwanden
  const glas = new THREE.MeshStandardMaterial({ color: 0xd9c6ff, transparent: true, opacity: 0.28, roughness: 0.1, metalness: 0.1 });
  const lijst = mat(0xffffff, { roughness: 0.5 });
  function tussenwand(x1, z1, x2, z2) {
    const lx = Math.abs(x2 - x1), lz = Math.abs(z2 - z1), cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    const g = blok(lx || 0.05, 1.05, lz || 0.05, glas, cx, 0.6, cz); g.castShadow = false;
    blok((lx || 0) + 0.08, 0.06, (lz || 0) + 0.08, lijst, cx, 1.15, cz);
  }
  const KOL = [-6.8, 0, 6.8], RIJ = [-3.45, 3.45];
  tussenwand(-3.4, -D / 2, -3.4, -0.9); tussenwand(-3.4, 0.9, -3.4, D / 2);
  tussenwand(3.4, -D / 2, 3.4, -0.9); tussenwand(3.4, 0.9, 3.4, D / 2);
  tussenwand(-W / 2, 0, -4.6, 0); tussenwand(-2.2, 0, 2.2, 0); tussenwand(4.6, 0, W / 2, 0);

  // meubels en mensen
  const bureauMat = mat(0xf6f1ea), pootMat = mat(0x3a3450, { roughness: 0.5 }), stoelMat = mat(0x3d3358, { roughness: 0.6 });
  function schermTex(soort) {
    return tex(256, 160, (g, w, h) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#ece4fb'; g.fillRect(0, 0, w, 18);
      if (soort === 'tabel') { for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#f7f4fc' : '#fff'; g.fillRect(8, 26 + i * 18, w - 16, 18); g.fillStyle = '#7b6aa0'; g.fillRect(14, 32 + i * 18, 60, 5); g.fillStyle = i === 2 ? '#d64545' : '#4a5568'; g.fillRect(w - 70, 32 + i * 18, 52, 5); } }
      else if (soort === 'chat') { [[16, 30, 150, '#efe7ff'], [90, 66, 150, '#2b2140'], [16, 104, 170, '#efe7ff']].forEach(([x, y, bw, c]) => { g.fillStyle = c; g.beginPath(); g.roundRect ? g.roundRect(x, y, bw, 28, 8) : g.rect(x, y, bw, 28); g.fill(); }); }
      else if (soort === 'agenda') { for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) { g.fillStyle = (r + k) % 3 ? '#f2edfa' : '#d9c6ff'; g.fillRect(10 + k * 48, 26 + r * 32, 44, 28); } }
      else { g.fillStyle = '#d9c6ff'; g.fillRect(14, 30, 100, 70); g.fillStyle = '#fbe3c3'; g.fillRect(124, 30, 118, 34); g.fillStyle = '#c9f0e2'; g.fillRect(124, 70, 118, 30); g.fillStyle = '#4a5568'; g.fillRect(14, 114, 200, 6); g.fillRect(14, 128, 150, 6); }
    });
  }
  function bureau(ouder, x, z, ry, soort) {
    const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.rotation.y = ry || 0; ouder.add(gr);
    blok(1.75, 0.07, 0.85, bureauMat, 0, 0.76, 0, gr);
    [[-0.8, -0.36], [0.8, -0.36], [-0.8, 0.36], [0.8, 0.36]].forEach(([a, b]) => blok(0.05, 0.74, 0.05, pootMat, a, 0.37, b, gr));
    blok(0.08, 0.26, 0.08, pootMat, 0, 0.92, -0.24, gr);
    const scherm = blok(0.82, 0.5, 0.04, mat(0x22202c), 0, 1.24, -0.26, gr);
    const vlak = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.44), new THREE.MeshBasicMaterial({ map: schermTex(soort) }));
    vlak.position.set(0, 1.24, -0.235); gr.add(vlak);
    blok(0.5, 0.02, 0.16, mat(0xdddde6), 0, 0.8, 0.12, gr);
    return gr;
  }
  function stoel(ouder, x, z, ry) {
    const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.rotation.y = ry || 0; ouder.add(gr);
    blok(0.52, 0.08, 0.5, stoelMat, 0, 0.5, 0, gr); blok(0.52, 0.56, 0.07, stoelMat, 0, 0.82, 0.25, gr);
    cil(0.04, 0.04, 0.44, pootMat, 0, 0.26, 0, gr); cil(0.24, 0.24, 0.03, pootMat, 0, 0.04, 0, gr);
    return gr;
  }
  const HUID = [0xf1c9a5, 0xc68a5e, 0x8d5a3b, 0xe8b48f], SHIRT = [0x2f7d8c, 0xe07a5f, 0x5b6ee1, 0x3d405b, 0x81b29a, 0xf2cc8f], HAAR = [0x2b1d14, 0x6b4a2e, 0xc9a26b, 0x111111];
  const mensen = [];
  function mens(ouder, x, z, ry, i, opts) {
    opts = opts || {};
    const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.rotation.y = ry || 0; ouder.add(gr);
    const huid = mat(HUID[i % 4]), shirt = mat(SHIRT[i % 6]), broek = mat(0x2d2a3a);
    const zit = opts.staan ? 0 : 1;
    const heupY = zit ? 0.58 : 0.95;
    if (zit) { blok(0.34, 0.14, 0.46, broek, 0, heupY, -0.12, gr); blok(0.3, 0.42, 0.13, broek, 0, 0.3, -0.38, gr); }
    else { blok(0.13, 0.9, 0.15, broek, -0.09, 0.45, 0, gr); blok(0.13, 0.9, 0.15, broek, 0.09, 0.45, 0, gr); }
    const romp = new THREE.Group(); romp.position.set(0, heupY + 0.05, 0.02); gr.add(romp);
    cil(0.18, 0.21, 0.6, shirt, 0, 0.3, 0, romp);
    bol(0.19, shirt, 0, 0.58, 0, romp).scale.set(1, 0.5, 0.85);
    const hoofd = new THREE.Group(); hoofd.position.set(0, 0.86, 0); romp.add(hoofd);
    bol(0.17, huid, 0, 0, 0, hoofd);
    const haar = bol(0.175, mat(HAAR[i % 4]), 0, 0.05, 0.03, hoofd); haar.scale.set(1.04, 0.82, 1.04);
    const armL = new THREE.Group(); armL.position.set(-0.22, 0.52, 0); romp.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.22, 0.52, 0); romp.add(armR);
    [armL, armR].forEach((a) => { const m = cil(0.055, 0.05, 0.5, shirt, 0, -0.22, 0, a); m.rotation.x = 0; });
    armL.rotation.x = armR.rotation.x = zit ? 1.05 : 0.2;
    if (opts.headset) {
      const hs = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 8, 24, Math.PI), mat(0x22202c)); hs.position.set(0, 0.04, 0); hs.rotation.z = 0; hoofd.add(hs);
      bol(0.05, mat(0x22202c), -0.18, -0.02, 0, hoofd); const mic = cil(0.01, 0.01, 0.2, mat(0x22202c), -0.13, -0.1, -0.1, hoofd); mic.rotation.x = 1.1;
    }
    const m = { gr, romp, hoofd, armL, armR, fase: Math.random() * 6, zit, y0: romp.position.y };
    mensen.push(m); return m;
  }
  function plant(ouder, x, z, s) {
    s = s || 1; const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.scale.setScalar(s); ouder.add(gr);
    cil(0.2, 0.15, 0.36, mat(0xf3eee6), 0, 0.18, 0, gr);
    const blad = mat(0x5e9e6e, { roughness: 0.8 });
    for (let i = 0; i < 6; i++) { const b = bol(0.2, blad, Math.cos(i) * 0.12, 0.5 + (i % 3) * 0.12, Math.sin(i * 1.7) * 0.12, gr); b.scale.set(0.7, 1.4, 0.7); b.rotation.z = (i - 3) * 0.25; }
    return gr;
  }

  // AI-collega: een zwevende, gloeiende bol met een lijn naar de student
  const haloTex = tex(128, 128, (g, w) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(190,140,255,.9)'); r.addColorStop(0.35, 'rgba(161,93,245,.35)'); r.addColorStop(1, 'rgba(161,93,245,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const orbs = [];
  function aiCollega(ouder, x, y, z, doelWereld) {
    const gr = new THREE.Group(); gr.position.set(x, y, z); ouder.add(gr);
    const kern = bol(0.22, new THREE.MeshStandardMaterial({ color: 0x9b55f2, emissive: 0x8a3ff0, emissiveIntensity: 0.9, roughness: 0.25 }), 0, 0, 0, gr); kern.castShadow = false;
    bol(0.07, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.06, 0.07, 0.14, gr);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xb98aff, transparent: true, depthWrite: false }));
    halo.scale.setScalar(1.25); gr.add(halo);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.018, 8, 48), new THREE.MeshBasicMaterial({ color: 0x7947ba, transparent: true, opacity: 0.85 }));
    ring.rotation.x = Math.PI / 2.4; gr.add(ring);
    const licht = new THREE.PointLight(0xb88cff, 0.55, 3.2); gr.add(licht);
    let lijn = null;
    if (doelWereld) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      lijn = new THREE.Line(g, new THREE.LineDashedMaterial({ color: 0x7947ba, dashSize: 0.1, gapSize: 0.07 }));
      scene.add(lijn);
    }
    const o = { gr, ring, halo, lijn, doel: doelWereld, y0: y, fase: Math.random() * 6 };
    orbs.push(o); return o;
  }

  // de zes afdelingen
  const AFD = window.AFDELINGEN;
  const POS = { hr: [KOL[0], RIJ[0]], marketing: [KOL[1], RIJ[0]], kantine: [KOL[2], RIJ[0]], secretariaat: [KOL[0], RIJ[1]], administratie: [KOL[1], RIJ[1]], inwerkplek: [KOL[2], RIJ[1]] };
  const kamers = {};
  const kleed = mat(0xddd2ee, { roughness: 0.95 });
  AFD.forEach((a, i) => {
    const [cx, cz] = POS[a.id];
    const k = new THREE.Group(); k.position.set(cx, 0, cz); scene.add(k);
    const tapijt = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.2), a.id === 'kantine' ? mat(0xf4eee4) : kleed);
    tapijt.rotation.x = -Math.PI / 2; tapijt.position.y = 0.01; tapijt.receiveShadow = true; k.add(tapijt);
    const gloed = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6.4), new THREE.MeshBasicMaterial({ color: 0xa15df5, transparent: true, opacity: 0, depthWrite: false }));
    gloed.rotation.x = -Math.PI / 2; gloed.position.y = 0.015; k.add(gloed);
    const vang = new THREE.Mesh(new THREE.BoxGeometry(6.6, 3, 6.6), new THREE.MeshBasicMaterial({ visible: false }));
    vang.position.y = 1.5; vang.userData.id = a.id; k.add(vang);
    kamers[a.id] = { groep: k, gloed, vang, cx, cz, data: a, i };
  });
  const toW = (k, x, y, z) => new THREE.Vector3(k.cx + x, y, k.cz + z);

  // administratie: de student met headset, een collega, een kast en de belring
  (function () {
    const k = kamers.administratie, g = k.groep;
    bureau(g, -0.2, -0.6, 0, 'tabel'); stoel(g, -0.2, 0.15, 0); const st = mens(g, -0.2, 0.18, 0, 0, { headset: true });
    bureau(g, 1.95, -1.4, Math.PI / 2, 'tabel'); stoel(g, 2.7, -1.4, Math.PI / 2); mens(g, 2.72, -1.4, Math.PI / 2, 3);
    blok(0.9, 1.3, 0.5, mat(0xd8d0e6), -2.3, 0.65, -1.7, g); blok(0.92, 0.04, 0.52, mat(0xbfb3d6), -2.3, 0.86, -1.7, g); blok(0.92, 0.04, 0.52, mat(0xbfb3d6), -2.3, 0.44, -1.7, g);
    plant(g, -2.4, 1.8, 1.1);
    const belring = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.36, 64), new THREE.MeshBasicMaterial({ color: 0xa15df5, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
    belring.rotation.x = -Math.PI / 2; belring.position.set(-0.2, 0.03, -0.1); g.add(belring); k.belring = belring;
    aiCollega(g, 0.9, 2.35, -0.2, () => toW(k, -0.2, 1.62, 0.18)); k.student = st;
  })();
  // HR en juridisch: overlegtafel en boekenkast
  (function () {
    const k = kamers.hr, g = k.groep;
    cil(0.85, 0.85, 0.06, bureauMat, 0, 0.74, 0, g); cil(0.08, 0.08, 0.72, pootMat, 0, 0.36, 0, g);
    stoel(g, -0.95, 0.4, -Math.PI / 2 - 0.4); mens(g, -0.98, 0.42, -Math.PI / 2 - 0.4, 1);
    stoel(g, 0.95, 0.4, Math.PI / 2 + 0.4); mens(g, 0.98, 0.42, Math.PI / 2 + 0.4, 4);
    const kast = new THREE.Group(); kast.position.set(-1.6, 0, -2.6); g.add(kast);
    blok(1.8, 2, 0.4, mat(0xf3eee6), 0, 1, 0, kast);
    const kleuren = [0x7947ba, 0xe07a5f, 0x2f7d8c, 0xf2cc8f, 0x3d405b, 0x81b29a];
    for (let r = 0; r < 3; r++) for (let b = 0; b < 9; b++) blok(0.14, 0.42 + (b % 3) * 0.05, 0.28, mat(kleuren[(b + r) % 6]), -0.75 + b * 0.18, 0.35 + r * 0.6, 0.08, kast);
    plant(g, 2.1, -2.3, 1.2);
    aiCollega(g, 0, 2.3, -0.6, () => toW(k, -0.98, 1.85, 0.42));
  })();
  // marketing: whiteboard met plakbriefjes
  (function () {
    const k = kamers.marketing, g = k.groep;
    bureau(g, 0.6, 0.4, 0, 'beeld'); stoel(g, 0.6, 1.15, 0); mens(g, 0.6, 1.18, 0, 2);
    const bord = new THREE.Group(); bord.position.set(-1.2, 0, -2.6); g.add(bord);
    blok(2.4, 1.4, 0.06, mat(0xffffff, { roughness: 0.3 }), 0, 1.5, 0, bord);
    blok(0.05, 0.8, 0.05, pootMat, -1, 0.4, 0, bord); blok(0.05, 0.8, 0.05, pootMat, 1, 0.4, 0, bord);
    const pk = [0xffd166, 0xf4a6c6, 0xa0e7e5, 0xc5b3ff, 0xb5e48c];
    for (let i = 0; i < 10; i++) blok(0.26, 0.26, 0.01, mat(pk[i % 5]), -0.9 + (i % 5) * 0.45, 1.75 - Math.floor(i / 5) * 0.4, 0.04, bord);
    plant(g, 2.2, -2.2, 1.1);
    aiCollega(g, 1.7, 2.3, 0.3, () => toW(k, 0.6, 1.62, 1.18));
  })();
  // kantine: ronde tafel, krukken, koffieautomaat
  (function () {
    const k = kamers.kantine, g = k.groep;
    cil(0.7, 0.7, 0.05, bureauMat, -0.3, 0.76, 0.3, g); cil(0.06, 0.06, 0.74, pootMat, -0.3, 0.37, 0.3, g);
    [[0.6, 0.7], [-1.2, 0.8], [-0.3, -0.7]].forEach(([x, z], i) => { cil(0.2, 0.2, 0.05, stoelMat, x, 0.52, z, g); cil(0.03, 0.03, 0.5, pootMat, x, 0.26, z, g); if (i === 0) mens(g, x, z - 0.05, 1.2, 5); });
    const km = new THREE.Group(); km.position.set(1.9, 0, -2.4); g.add(km);
    blok(0.7, 1.6, 0.55, mat(0x2b2140), 0, 0.8, 0, km); blok(0.5, 0.35, 0.02, new THREE.MeshBasicMaterial({ color: 0xa15df5 }), 0, 1.25, 0.29, km);
    blok(1.5, 0.9, 0.55, mat(0xf3eee6), 0.2, 0.45, -0.05, g).position.set(-1.6, 0.45, -2.45);
    plant(g, 2.2, 1.9, 1.3);
    aiCollega(g, 0.6, 2.3, -0.4, () => toW(k, 0.6, 1.88, 0.65));
  })();
  // secretariaat: bureau, agenda aan de wand, printer
  (function () {
    const k = kamers.secretariaat, g = k.groep;
    bureau(g, 0.3, 0.2, 0, 'agenda'); stoel(g, 0.3, 0.95, 0); mens(g, 0.3, 0.98, 0, 4);
    blok(0.8, 0.5, 0.6, mat(0xe9e6ef), -2.2, 0.6, -0.4, g); blok(0.06, 0.6, 0.06, pootMat, -2.2, 0.3, -0.4, g);
    const ag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1), new THREE.MeshBasicMaterial({ map: schermTex('agenda') }));
    ag.position.set(-2.95, 1.6, 0.2); ag.rotation.y = Math.PI / 2; g.add(ag);
    plant(g, 2.1, -2.3, 1.1); plant(g, -2.3, 2.2, 0.9);
    aiCollega(g, 1.4, 2.3, 0.2, () => toW(k, 0.3, 1.62, 0.98));
  })();
  // inwerkplek: twee bureaus naast elkaar; de AI-collega zit als stagiair aan het tweede bureau
  (function () {
    const k = kamers.inwerkplek, g = k.groep;
    bureau(g, -0.95, 0, 0, 'chat'); stoel(g, -0.95, 0.75, 0); mens(g, -0.95, 0.78, -0.35, 1);
    bureau(g, 0.95, 0, 0, 'tabel'); stoel(g, 0.95, 0.75, 0);
    plant(g, 2.2, -2.2, 1.1);
    aiCollega(g, 0.95, 1.45, 0.75, () => toW(k, -0.95, 1.62, 0.78));
  })();

  // labels
  const lagen = $('#labels');
  Object.values(kamers).forEach((k) => {
    const el = document.createElement('div');
    el.className = 'lbl' + (k.data.uitgewerkt ? ' uit' : '');
    el.innerHTML = `<span class="naam">${k.data.naam}</span><span class="rol">${k.data.rol}</span>${k.data.uitgewerkt ? '<span class="badge">volledig uitgewerkt</span>' : ''}`;
    el.addEventListener('click', () => kies(k.data.id));
    el.addEventListener('mouseenter', () => zweef(k.data.id)); el.addEventListener('mouseleave', () => zweef(null));
    lagen.appendChild(el); k.label = el;
  });
  const _v = new THREE.Vector3();
  function plaatsLabels() {
    Object.values(kamers).forEach((k) => {
      _v.set(k.cx, 3.05, k.cz).project(camera);
      if (_v.z > 1) { k.label.style.display = 'none'; return; }
      k.label.style.display = '';
      k.label.style.transform = `translate(${(_v.x * 0.5 + 0.5) * innerWidth}px,${(-_v.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,-100%)`;
    });
  }

  // aanwijzen en kiezen
  const ray = new THREE.Raycaster(), muis = new THREE.Vector2();
  let hover = null, gekozen = null, neer = null;
  function zweef(id) { hover = id; canvas.style.cursor = id ? 'pointer' : ''; Object.values(kamers).forEach((k) => k.label.classList.toggle('on', k.data.id === id || k.data.id === gekozen)); }
  function raak(e) {
    muis.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(muis, camera);
    const h = ray.intersectObjects(Object.values(kamers).map((k) => k.vang), false)[0];
    return h ? h.object.userData.id : null;
  }
  canvas.addEventListener('pointermove', (e) => { if (!neer) zweef(raak(e)); });
  canvas.addEventListener('pointerdown', (e) => { neer = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => { if (!neer) return; const d = Math.hypot(e.clientX - neer[0], e.clientY - neer[1]); neer = null; if (d < 6) { const id = raak(e); if (id) kies(id); else if (gekozen) terug(); } });

  let vlucht = null;
  function vlieg(pos, doel, duur) { vlucht = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: doel.clone(), k: 0, duur: duur || 1.3 }; }
  const luisteraars = [];
  function kies(id) {
    const k = kamers[id]; if (!k) return;
    gekozen = id; zweef(hover);
    const smal = innerWidth < 900;
    const doel = new THREE.Vector3(k.cx + (smal ? 0 : 1.3), 0.7, k.cz + (smal ? 1.2 : 0.2));
    vlieg(doel.clone().add(new THREE.Vector3(5.2, 7.4, 9.2).multiplyScalar(smal ? 1.25 : 1)), doel);
    luisteraars.forEach((f) => f(id));
  }
  // op een staand scherm staat de camera verder weg, zodat het hele kantoor in beeld blijft
  function overzicht() {
    const staand = innerWidth / innerHeight < 1;
    if (!staand) return OVERZICHT;
    const doel = new THREE.Vector3(0.2, -2.2, 1.2);
    return { pos: doel.clone().add(OVERZICHT.pos.clone().sub(OVERZICHT.doel).multiplyScalar(1.6)), doel };
  }
  function terug() { gekozen = null; zweef(null); const o = overzicht(); vlieg(o.pos, o.doel, 1.2); luisteraars.forEach((f) => f(null)); }

  // lus
  let pauze = false, laatste = performance.now(), tijd = 0, eersteFrame = true;
  function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 1 ? 46 : 30; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();
  function frame(dt) {
    tijd += dt;
    if (vlucht) {
      vlucht.k = Math.min(1, vlucht.k + dt / vlucht.duur); const e = vlucht.k < 0.5 ? 4 * vlucht.k ** 3 : 1 - (-2 * vlucht.k + 2) ** 3 / 2;
      camera.position.lerpVectors(vlucht.p0, vlucht.p1, e); controls.target.lerpVectors(vlucht.t0, vlucht.t1, e); if (vlucht.k >= 1) vlucht = null;
    }
    controls.update();
    orbs.forEach((o) => {
      o.gr.position.y = o.y0 + Math.sin(tijd * 1.6 + o.fase) * 0.08; o.ring.rotation.z = tijd * 0.8 + o.fase; o.halo.material.opacity = 0.6 + Math.sin(tijd * 2.2 + o.fase) * 0.25;
      if (o.lijn) { const a = new THREE.Vector3(); o.gr.getWorldPosition(a); const b = o.doel(); o.lijn.geometry.setFromPoints([a, b]); o.lijn.computeLineDistances(); o.lijn.material.dashOffset = -tijd * 0.25; }
    });
    mensen.forEach((m) => { m.hoofd.rotation.y = Math.sin(tijd * 0.5 + m.fase) * 0.18; m.romp.position.y = m.y0 + Math.sin(tijd * 1.4 + m.fase) * 0.008; if (m.zit) { m.armL.rotation.x = 1.05 + Math.sin(tijd * 9 + m.fase) * 0.04; m.armR.rotation.x = 1.05 + Math.cos(tijd * 9.5 + m.fase) * 0.04; } });
    const br = kamers.administratie.belring; const p = (tijd % 1.8) / 1.8; br.scale.setScalar(0.85 + p * 0.45); br.material.opacity = 0.9 * (1 - p);
    Object.values(kamers).forEach((k) => { const doelOp = k.data.id === gekozen ? 0.14 : k.data.id === hover ? 0.08 : 0; k.gloed.material.opacity += (doelOp - k.gloed.material.opacity) * Math.min(1, dt * 8); });
    renderer.render(scene, camera); plaatsLabels();
    if (eersteFrame) { eersteFrame = false; setTimeout(() => $('#loader').classList.add('weg'), 200); }
  }
  function lus(nu) { requestAnimationFrame(lus); const dt = Math.min(0.05, (nu - laatste) / 1000); laatste = nu; if (!pauze) frame(dt); }
  // intro: de camera komt aanvliegen
  { const o = overzicht(); camera.position.copy(o.pos.clone().multiplyScalar(1.25)); controls.target.copy(o.doel); vlieg(o.pos, o.doel, 2.2); }
  requestAnimationFrame(lus);

  window.Kantoor = {
    kies, terug,
    opKies: (f) => luisteraars.push(f),
    pauze: (v) => { pauze = !!v; if (!v) laatste = performance.now(); },
    get gekozen() { return gekozen; },
  };
  // testhaak: requestAnimationFrame loopt niet in een verborgen paneel
  window.__kantoor = { step: (n, d) => { $('#loader').classList.add('weg'); for (let i = 0; i < n; i++) frame(d || 1 / 60); }, kies, terug, camera, controls, scene };
})();
