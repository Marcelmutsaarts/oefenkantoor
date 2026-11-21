# Het oefenkantoor

Een demonstratie van AI voor Docenten voor de Docentendag Business Services 2026. Het laat zien wat AI kan betekenen voor het leren van mbo-studenten Business Services.

Het 3D-kantoor van Veluwe Groothandel (een verzonnen bedrijf) heeft zes afdelingen. Elke afdeling laat één rol van AI zien uit het raamwerk Leerverrijking:

| Afdeling | Rol van AI |
|---|---|
| Administratie | Simulator (uitgewerkt) |
| HR en juridisch | Socratische gesprekspartner |
| Marketing | Mentor |
| Secretariaat | Procesbegeleider |
| Inwerkplek | Tutor en AI-leerling |
| Kantine | Coach |

## De administratie

De student belt een klant met openstaande facturen. Er zijn twee vormen:

- **Met de zaal:** een vooraf geschreven gesprek. De zaal kiest A, B of C, en de klant reageert met stem, gezicht en twee meters (relatie en bereid om te betalen). Daarna volgt een nabespreking met een grafiek, wat werkte, één verbeterpunt en de succescriteria.
- **Live:** de student praat zelf (push-to-talk). Een taalmodel hoort de opname, speelt de klant en bespreekt het gesprek daarna na. Er zijn drie klanten van oplopende moeilijkheid.

## Techniek

Statische HTML met three.js r147 (jsDelivr), zonder build-stap. Het live gesprek draait via twee Vercel-functies:

- `api/klant.js`: de klant en de nabespreking, via OpenRouter (standaard `google/gemini-3.8-flash`, reserve `google/gemini-2.5-flash`).
- `api/stem.js`: de stem, via OpenRouter tekst-naar-spraak (standaard `microsoft/mai-voice-2.1-flash`, stemmen `nl-NL-Sander` en `nl-NL-Harper`).

### Omgevingsvariabelen in Vercel

| Naam | Verplicht | Waarde |
|---|---|---|
| `OPENROUTER_API_KEY` | ja | je OpenRouter-sleutel |
| `KLANT_MODEL` | nee | ander taalmodel, bijvoorbeeld `openai/...` |
| `STEM_MODEL` | nee | ander stemmodel |

Zonder sleutel werkt het gesprek met de zaal gewoon; de klant spreekt dan met de stem van de browser.

## Privacy

In het live gesprek gaan de opname en de tekst naar OpenRouter en het gekozen model. Gebruik geen echte namen of klantgegevens. De app slaat niets op.
