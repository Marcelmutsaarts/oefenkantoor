// Inhoud van het oefenkantoor: de afdelingen (rollen uit het raamwerk Leerverrijking), de klanten en het gespreksscript.

window.AFDELINGEN = [
  {
    id: 'administratie', naam: 'Administratie', rol: 'Simulator', uitgewerkt: true,
    titel: 'De klant die niet betaalt',
    student: 'Belt een vaste klant over drie openstaande facturen en zoekt samen met hem naar een betaalafspraak.',
    ai: 'Speelt de klant. Reageert op wat de student zegt en hoe het klinkt, en bespreekt het gesprek daarna na.',
    waarom: 'Simulaties hebben een groot effect op complexe vaardigheden (g = 0,85; Chernikova e.a., 2020). Een nabespreking verbetert prestaties gemiddeld met d = 0,67 (Tannenbaum & Cerasoli, 2013).',
    voorbeeld: [
      ['ai', 'Mijn oven is kapot en jullie bellen over een factuurtje?'],
      ['student', 'Dat is flink balen. Begrijp ik goed dat het nu krap is, maar dat het straks weer loopt?'],
      ['ai', 'Precies. Met de decemberdrukte draai ik weer goed.'],
    ],
  },
  {
    id: 'hr', naam: 'HR en juridisch', rol: 'Socratische gesprekspartner',
    titel: 'Het verzuimdilemma',
    student: 'Adviseert een leidinggevende over een medewerker die zich voor de derde keer op maandag ziek meldt.',
    ai: 'Geeft geen antwoord, maar vraagt door: wat weet je zeker, wat neem je aan, en wat zegt de wet?',
    waarom: 'Dit dwingt de student de eigen redenering en aannames te onderzoeken. Socratische chatbots verhogen de betrokkenheid; een hogere leeropbrengst is nog niet aangetoond (Blasco & Charisi, 2024).',
    voorbeeld: [
      ['student', 'Ik zou een officiële waarschuwing sturen. Dit is een patroon.'],
      ['ai', 'Wat weet je zeker, en wat neem je aan over de reden van het verzuim?'],
      ['student', 'Eigenlijk weet ik alleen de data.'],
      ['ai', 'Wie mag er in Nederland naar de medische reden vragen?'],
    ],
  },
  {
    id: 'marketing', naam: 'Marketing', rol: 'Mentor',
    titel: 'De post voor de nieuwe winkel',
    student: 'Schrijft een Instagram-post over de opening van de afhaalwinkel van de groothandel.',
    ai: 'Geeft feedback op criteria: doelgroep, boodschap en oproep. Hooguit twee verbeterpunten, en herschrijft niets zelf.',
    waarom: 'In een gerandomiseerde studie verbeterde AI-feedback de herziening van een tekst (d = 0,19) en de motivatie (d = 0,36), vergeleken met herzien zonder feedback (Meyer e.a., 2024).',
    voorbeeld: [
      ['ai', 'Je doelgroep is duidelijk: bakkers uit de regio. Twee punten: je oproep staat pas in de laatste zin, en "superleuk" zegt weinig.'],
      ['ai', 'Welke van de twee pak je eerst aan, en hoe?'],
    ],
  },
  {
    id: 'secretariaat', naam: 'Secretariaat', rol: 'Procesbegeleider',
    titel: 'Het personeelsuitje',
    student: 'Organiseert een personeelsuitje voor veertig collega\'s, van begroting tot uitnodiging.',
    ai: 'Bewaakt de stappen en tussenproducten. Neemt geen beslissingen over: de student kiest en werkt uit.',
    waarom: 'Ondersteuning bij plannen en bijsturen verbetert prestaties (Zheng, 2016). Belangrijk is dat AI het denkwerk niet overneemt.',
    voorbeeld: [
      ['ai', 'Stap 2 van 5: de begroting. Je hebt € 2.400 voor veertig mensen.'],
      ['ai', 'Welke drie kostenposten verwacht je, en welke is het grootst?'],
    ],
  },
  {
    id: 'inwerkplek', naam: 'Inwerkplek', rol: 'Tutor en AI-leerling',
    titel: 'Leg de btw uit aan de nieuwe stagiair',
    student: 'Legt de btw-aangifte uit aan een AI die een beginnende stagiair speelt, en krijgt hulp als hij zelf vastloopt.',
    ai: 'Speelt een beginner die doorvraagt op sprongen in de uitleg. Als tutor geeft AI een hint in plaats van het antwoord.',
    waarom: 'Uitleggen aan een ander is een sterke manier om zelf te leren. Een AI-tutor liet in een gerandomiseerde studie meer leren zien dan een actieve les, in minder tijd (Kestin e.a., 2025).',
    voorbeeld: [
      ['ai', 'Maar waarom betaal ik btw als ik het toch weer terugkrijg?'],
      ['student', 'Jij betaalt het niet echt. De klant betaalt het, en jij draagt het af.'],
      ['ai', 'O. En wie stuurt het dan naar de Belastingdienst, en wanneer?'],
    ],
  },
  {
    id: 'kantine', naam: 'Kantine', rol: 'Coach',
    titel: 'Hoe ging je stagedag?',
    student: 'Kijkt terug op een spannend moment van de dag en kiest een eigen aanpak voor de volgende keer.',
    ai: 'Stelt vragen over hoe de student leert. Geeft geen advies vooraf en laat de keuze bij de student.',
    waarom: 'Training in zelfregulatie verbetert prestaties (Dignath & Büttner, 2008). AI-onderzoek naar deze rol ontbreekt nog; de coach werkt naast de menselijke begeleider.',
    voorbeeld: [
      ['ai', 'Je zei dat het debiteurengesprek spannend was. Wat gebeurde er precies toen je ging bellen?'],
      ['student', 'Ik had geen idee wat ik moest zeggen als hij boos werd.'],
      ['ai', 'Wat zou je de volgende keer vooraf willen klaarzetten?'],
    ],
  },
];

window.KLANTEN = {
  erik1: {
    id: 'erik1', stem: 'erik', gezicht: 'erik', naam: 'Erik van Dam', bedrijf: 'Bakkerij Van Dam, Nijkerk',
    label: 'Krap bij kas, maar redelijk', niveau: 'Niveau 1',
    opener: 'Bakkerij Van Dam, met Erik.',
    feiten: [
      ['Klant sinds', '2016, betaalde altijd op tijd'],
      ['Open', '3 facturen, samen € 4.380'],
      ['Facturen', '18 aug € 1.295 · 1 sep € 1.640 · 15 sep € 1.445'],
      ['Al gedaan', 'Herinnering (15 okt) en aanmaning (5 nov)'],
    ],
    doel: 'Een concrete betaalafspraak, en een klant die blijft.',
    criteria: ['Je luistert en vat samen', 'Je blijft vriendelijk én duidelijk', 'Je eindigt met een concrete afspraak die je bevestigt'],
    start: { relatie: 60, betaalbereid: 30 },
  },
  erik2: {
    id: 'erik2', stem: 'erik', gezicht: 'erik', naam: 'Erik van Dam', bedrijf: 'Bakkerij Van Dam, Nijkerk',
    label: 'Gestrest en kortaf', niveau: 'Niveau 2',
    opener: 'Ja, Van Dam. Kort graag, er staan klanten.',
    feiten: [
      ['Klant sinds', '2016, betaalde altijd op tijd'],
      ['Open', '3 facturen, samen € 4.380'],
      ['Facturen', '18 aug € 1.295 · 1 sep € 1.640 · 15 sep € 1.445'],
      ['Al gedaan', 'Herinnering (15 okt) en aanmaning (5 nov)'],
    ],
    doel: 'Een concrete betaalafspraak, en een klant die blijft.',
    criteria: ['Je luistert en vat samen', 'Je blijft vriendelijk én duidelijk', 'Je eindigt met een concrete afspraak die je bevestigt'],
    start: { relatie: 45, betaalbereid: 20 },
  },
  jansen: {
    id: 'jansen', stem: 'jansen', gezicht: 'jansen', naam: 'Marja Jansen', bedrijf: 'Lunchroom ’t Hoekje, Barneveld',
    label: 'Betwist de factuur', niveau: 'Niveau 3',
    opener: 'Lunchroom ’t Hoekje, goedemiddag.',
    feiten: [
      ['Klant sinds', '2019'],
      ['Open', 'Factuur F-26-0388 van 12 september, € 1.245'],
      ['Op de factuur', '40 kg speltmeel € 935 · 10 kg roomboter € 310'],
      ['Al gedaan', 'Herinnering en aanmaning, geen reactie'],
      ['In het systeem', 'Geen klacht geregistreerd'],
    ],
    doel: 'Duidelijkheid over de klacht, en betaling van wat niet betwist wordt.',
    criteria: ['Je luistert en vraagt door naar de klacht', 'Je belooft niets wat buiten jouw bevoegdheid valt', 'Je maakt een concrete afspraak over het onbetwiste deel en over wanneer je terugbelt'],
    start: { relatie: 50, betaalbereid: 25 },
  },
};

// Het voorgescripte gesprek met Erik. dR en dB zijn de veranderingen van de meters relatie en betaalbereid.
window.SCRIPT = {
  start: { relatie: 60, betaalbereid: 30 },
  opener: { tekst: 'Bakkerij Van Dam, met Erik.', emotie: 'neutraal' },
  knopen: {
    n1: {
      vraag: 'Hoe begin je het gesprek?',
      opties: [
        { tekst: 'Goedemiddag meneer Van Dam, u spreekt met Sam van de debiteurenadministratie van Veluwe Groothandel. Komt het even uit? Het duurt een paar minuten.', dR: 6, dB: 0, tag: 'voorstellen',
          reactie: { tekst: 'Een paar minuten dan, ik sta midden in de bakkerij. Waar gaat het over?', emotie: 'neutraal' }, next: 'n2' },
        { tekst: 'Hallo, ik bel over uw facturen. Die zijn al lang niet betaald.', dR: -8, dB: 2, tag: 'deurinhuis',
          reactie: { tekst: 'Goedemiddag eerst eens. Ja, dat weet ik ook wel.', emotie: 'geirriteerd' }, next: 'n2' },
        { tekst: 'Hoi Erik, met Sam van Veluwe! Alles goed daar in de bakkerij?', dR: 2, dB: -2, tag: 'amicaal',
          reactie: { tekst: 'Druk, druk. Maar je belt vast niet om te vragen hoe het met me gaat.', emotie: 'nadenkend' }, next: 'n2' },
      ],
    },
    n2: {
      vraag: 'Hoe breng je het onderwerp?',
      opties: [
        { tekst: 'Ik bel over drie facturen van samen € 4.380. De oudste is van augustus, en u heeft een herinnering en een aanmaning gehad. Klopt het dat ze nog openstaan?', dR: 4, dB: 8, tag: 'feiten',
          reactie: { tekst: 'Ja, dat klopt, ik heb die brieven gezien. Drie weken geleden is mijn oven kapotgegaan. Zesduizend euro reparatie, en drie dagen geen brood.', emotie: 'nadenkend' }, next: 'n3' },
        { tekst: 'U zit ruim over de betaaltermijn van dertig dagen. Wanneer kunnen we het geld verwachten?', dR: -6, dB: 4, tag: 'drukzetten',
          reactie: { tekst: 'Wanneer? Als ik het heb! Mijn oven is drie weken geleden kapotgegaan. Weet je wat dat kost?', emotie: 'geirriteerd' }, next: 'n3' },
        { tekst: 'Er staan nog wat facturen open. Dat is vast een vergissing?', dR: 2, dB: -6, tag: 'vaag',
          reactie: { tekst: 'Een vergissing... nee. Mijn oven is kapotgegaan, zesduizend euro. Ik heb nu gewoon even geen ruimte.', emotie: 'nadenkend' }, next: 'n3' },
      ],
    },
    n3: {
      vraag: 'Hoe reageer je op zijn verhaal?',
      opties: [
        { tekst: 'Dat is flink balen, drie dagen zonder brood. Begrijp ik goed dat het nu even krap is, maar dat het straks weer gaat lopen?', dR: 12, dB: 10, tag: 'luisteren',
          reactie: { tekst: 'Precies. Met de decemberdrukte draai ik weer goed. Maar nu is het krap.', emotie: 'opgelucht' }, next: 'n4' },
        { tekst: 'Dat is vervelend, maar wij hebben ook afspraken. De facturen moeten gewoon betaald worden.', dR: -10, dB: 2, tag: 'drukzetten',
          reactie: { tekst: 'Afspraken. Ik ben al tien jaar klant en ik heb nog nooit te laat betaald.', emotie: 'boos' }, next: 'n4' },
        { tekst: 'Ach, wat vervelend. Weet u wat, dan laten we het nog even rusten.', dR: 8, dB: -12, tag: 'opgeven',
          reactie: { tekst: 'Nou, dat is fijn om te horen. Ik bel wel als het weer gaat.', emotie: 'opgelucht' }, next: 'n4' },
      ],
    },
    n4: {
      vraag: 'Hoe kom je tot een oplossing?',
      opties: [
        { tekst: 'Zullen we een betalingsregeling maken? Bijvoorbeeld nu € 1.500, en de rest in twee delen: op 15 december en op 15 januari.', dR: 6, dB: 14, tag: 'concreet',
          reactie: { tekst: 'Vijftienhonderd nu... dat is pittig. Kan het eerste deel eind deze week, als de omzet van zaterdag binnen is?', emotie: 'nadenkend' }, next: 'n5a' },
        { tekst: 'Als we vóór vrijdag niets ontvangen, moeten we het uit handen geven aan een incassobureau.', dR: -16, dB: 6, tag: 'drukzetten',
          reactie: { tekst: 'Dreigen met incasso? Na tien jaar? Dan haal ik mijn meel wel ergens anders.', emotie: 'boos' }, next: 'n5b' },
        { tekst: 'Wat zou voor u haalbaar zijn, als we het in delen doen?', dR: 8, dB: 8, tag: 'openvraag',
          reactie: { tekst: 'Als ik eerlijk ben: duizend euro nu, en de rest na de kerst.', emotie: 'nadenkend' }, next: 'n5c' },
      ],
    },
    n5a: {
      vraag: 'Erik vraagt om een paar dagen uitstel. Wat zeg je?',
      opties: [
        { tekst: 'Dat kan. Dan noteer ik: € 1.500 uiterlijk vrijdag 27 november, en twee keer € 1.440, op 15 december en 15 januari. Klopt dat?', dR: 6, dB: 14, tag: 'concreet', afspraak: true,
          reactie: { tekst: 'Ja, dat klopt. Zo doen we het.', emotie: 'tevreden' }, next: 'n6' },
        { tekst: 'Prima, betaalt u maar wanneer het uitkomt.', dR: 4, dB: -10, tag: 'vaag',
          reactie: { tekst: 'Fijn. Ik zie wel wanneer het lukt.', emotie: 'neutraal' }, next: 'n6' },
        { tekst: 'Nee, het moet morgen al binnen zijn, anders gaat het niet.', dR: -6, dB: 4, tag: 'streng',
          reactie: { tekst: 'Morgen? Dan heb je niet goed geluisterd.', emotie: 'geirriteerd' }, next: 'n6' },
      ],
    },
    n5b: {
      vraag: 'Erik is boos. Wat doe je?',
      opties: [
        { tekst: 'Sorry, zo bedoelde ik het niet. U bent al tien jaar een goede klant. Ik wil juist samen een oplossing vinden. Wat zou voor u haalbaar zijn?', dR: 14, dB: 10, tag: 'herstel',
          reactie: { tekst: 'Hm. Oké. Duizend euro nu, en de rest na de kerst. Dat kan ik wel.', emotie: 'nadenkend' }, next: 'n5c' },
        { tekst: 'Dat is uw keuze, maar de facturen blijven gewoon staan.', dR: -6, dB: 2, tag: 'koel',
          reactie: { tekst: 'Dat weet ik ook wel. Stuur het maar op, ik zie het wel.', emotie: 'boos' }, next: 'n6' },
        { tekst: 'Dan zet ik het vandaag nog door naar het incassobureau.', dR: -14, dB: 4, tag: 'drukzetten',
          reactie: { tekst: 'Doe maar. Dan zijn we klaar met elkaar.', emotie: 'boos' }, next: 'n6' },
      ],
    },
    n5c: {
      vraag: 'Erik stelt € 1.000 nu voor, de rest na de kerst. Wat zeg je?',
      opties: [
        { tekst: 'Duizend nu is een goed begin. Kunnen we de rest in twee delen doen, half december en half januari? Dan is alles in januari rond.', dR: 6, dB: 16, tag: 'concreet', afspraak: true,
          reactie: { tekst: 'Half december en half januari... ja, dat moet lukken. Dan doen we het zo.', emotie: 'tevreden' }, next: 'n6' },
        { tekst: 'Prima, na de kerst is goed. Betaalt u dan maar alles in één keer.', dR: 4, dB: -8, tag: 'opgeven',
          reactie: { tekst: 'Mooi zo. Dan hebben we dat geregeld.', emotie: 'opgelucht' }, next: 'n6' },
        { tekst: 'Na de kerst is te laat. Dan moet ik het doorzetten naar incasso.', dR: -10, dB: 6, tag: 'drukzetten',
          reactie: { tekst: 'Ik doe een eerlijk voorstel en dan dit? Daar word ik niet blij van.', emotie: 'boos' }, next: 'n6' },
      ],
    },
    n6: {
      vraag: 'Hoe rond je af?',
      opties: [
        { tekst: 'Dan zet ik het in het systeem en stuur ik u vandaag een e-mail met wat we hebben afgesproken. En sterkte met de oven!', dR: 8, dB: 8, tag: 'bevestigen', bevestigd: true,
          reactie: { warm: { tekst: 'Doe dat. En bedankt dat je even meedacht.', emotie: 'tevreden' }, koel: { tekst: 'Is goed. Stuur maar.', emotie: 'neutraal' } }, next: null },
        { tekst: 'Mooi. Dan hoor ik het wel van u.', dR: 0, dB: -6, tag: 'geenbevestiging',
          reactie: { warm: { tekst: 'Ja, prima. Doei.', emotie: 'neutraal' }, koel: { tekst: 'Ja. Doei.', emotie: 'geirriteerd' } }, next: null },
        { tekst: 'Dan zet ik het in het systeem. Bij de volgende vertraging gaat het wel direct naar incasso.', dR: -10, dB: 2, tag: 'drukzetten',
          reactie: { warm: { tekst: 'Duidelijk. Fijne dag nog.', emotie: 'geirriteerd' }, koel: { tekst: 'Duidelijk. Fijne dag nog.', emotie: 'boos' } }, next: null },
      ],
    },
  },
  ophangen: { tekst: 'Weet je wat, ik bel zelf wel met je leidinggevende.', emotie: 'boos' },
};

// Wat de nabespreking zegt over elke keuze. Positieve en negatieve kenmerken van het gesprek.
window.TAGS = {
  voorstellen: { goed: true, tekst: 'Je stelde je netjes voor en vroeg of het uitkwam. Zo begint een lastig gesprek op gelijke voet.' },
  feiten: { goed: true, tekst: 'Je noemde de feiten (bedrag, facturen, herinnering) en checkte ze. Dan is er geen discussie over wat er openstaat.' },
  luisteren: { goed: true, tekst: 'Je vatte samen wat Erik zei en checkte het. Hij voelde zich gehoord en ging meedenken.' },
  openvraag: { goed: true, tekst: 'Je liet Erik zelf een voorstel doen. Wie meedenkt, houdt zich vaker aan de afspraak.' },
  concreet: { goed: true, tekst: 'Je maakte de afspraak concreet, met bedragen en datums.' },
  herstel: { goed: true, tekst: 'Je herstelde na een misser, met excuses en een open vraag. Dat redde het gesprek.' },
  bevestigen: { goed: true, tekst: 'Je bevestigde de afspraak schriftelijk. Zo staat het zwart op wit.' },
  deurinhuis: { goed: false, tekst: 'Je viel met de deur in huis. Begin met jezelf voorstellen en vraag of het uitkomt.' },
  amicaal: { goed: false, tekst: 'Je begon te amicaal. Een zakelijk gesprek over geld vraagt om "u" en een duidelijke reden.' },
  drukzetten: { goed: false, tekst: 'Je zette druk of dreigde met incasso. Bij een klant die al tien jaar netjes betaalt, werkt dat averechts.' },
  vaag: { goed: false, tekst: 'Je bleef vaag. Zonder bedrag, datum of afspraak weet de klant niet waar hij aan toe is.' },
  opgeven: { goed: false, tekst: 'Je liet je doel los. Begrip tonen kan prima samen met een duidelijke afspraak.' },
  geenbevestiging: { goed: false, tekst: 'Je sloot af zonder de afspraak te bevestigen. Leg het altijd vast, bijvoorbeeld in een e-mail.' },
  streng: { goed: false, tekst: 'Je hield star vast aan je eigen voorstel. Een kleine verschuiving maakt een afspraak juist haalbaar.' },
  koel: { goed: false, tekst: 'Je reageerde koel op Eriks boosheid. Erken eerst zijn frustratie.' },
};
