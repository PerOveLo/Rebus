# Familierebus – Skylleviga, bursdager og egne rebuser

Digital rebus for fester. Alt kjører i nettleseren – ingen server, ingen innlogging.

Appen inneholder flere rebuser, og spillleder velger hvilken som brukes under
**Spillleder → 🎪 Rebus**:

- **🏡 Skylleviga Hagefest** – «Den store øyprøven», 15 poster rundt Skylleviga.
- **🎂 Lydias bursdagsrebus** – «Den store familierebusen», 11 poster INNE i huset,
  med plantegningen som kart, familiequiz, «Hvem sa det?», sant/tull, hurtigrunde
  og tilfeldige familiehendelser på skjermen.
- **🪄 Egen generert rebus** – lag en helt ny rebus for din gjeng (se under).

Forsiden, kartet, lagnavnene og premietitlene følger automatisk den valgte rebusen.

## Kom i gang

1. Kartbilder ligger i `public/` (`skylleviga-kart.jpg`, `lydia-kart.jpg`). Appen
   fungerer også uten, med placeholder – og spillleder kan laste opp eget kartbilde i appen.
2. Kjør:
   ```bash
   npm install
   npm run dev
   ```
3. Bygg for produksjon:
   ```bash
   npm run build
   ```

## Publisering på GitHub Pages

1. Push til `main`-branchen.
2. Workflowen `.github/workflows/deploy.yml` bygger og publiserer automatisk ved hver push til `main`.

## Endre innhold

Alt innhold (historie, poster, spørsmål, poeng, kartposisjoner, koder, lagnavn) ligger i:

```
src/config/gameConfig.ts    ← Skylleviga-rebusen
src/config/lydiaConfig.ts   ← Lydias bursdagsrebus
```

- Kartposisjoner: prosent fra venstre/topp i kartbildet.
- Finalekode: `defaultFinalCode` (Skylleviga 2515, Lydia 0606) – kan endres av spillleder i appen.
- Spilllederkode: fire siffer, kan endres i appen under ⚙️ Oppsett.

Nye innebygde rebuser registreres i `src/config/rebuses.ts`.

## GPS-kart og eget kartbilde

- **Spillleder → Kart → 🛰️ GPS-kart**: søk opp adressen, panorer dit festen er, trykk
  «Plasser postene her i utsnittet» og dra postene på plass på ekte satellittkart.
  Lagene kan slå på GPS (valgfritt) og se sin egen posisjon – alt forblir lokalt på telefonen.
- **Spillleder → Kart → Bildekart**: prosentkoordinater på et bilde (satellittfoto,
  plantegning, tegning …). Last opp ditt eget kartbilde rett i appen.
- Kartfliser (Esri/OpenStreetMap) og adressesøk (Nominatim) er gratis og trenger ingen nøkler.
  Flisene caches for dårlig dekning; bildekart-modusen fungerer helt uten nett.

## 🪄 Lag din egen rebus (for andre fester)

De innebygde rebusene ligger fast. Under **Spillleder → 🎪 Rebus** kan du i tillegg lage en
helt egen rebus for en annen gjeng:

1. Svar på noen morsomme spørsmål om gjengen, stedet, maten og den interne vitsen.
2. **Med Anthropic API-nøkkel**: Claude skriver skreddersydde spørsmål, historie, lagoppgaver
   og voksenbonuser fra svarene (og søker på nettet etter lokale fakta). Nøkkelen lagres kun i
   nettleseren, og kallet går direkte fra telefonen til Anthropic.
3. **Uten nøkkel**: en innebygd mal-generator lager en enklere, fullt spillbar versjon.
4. Trykk «Bruk denne rebusen» – nye laglenker får da den egne rebusen. Plasser postene på
   GPS-kartet under 🗺️ Kart.

## Slik spilles det

1. Spillleder åpner appen → «Jeg er spillleder» → velger rebus, legger inn deltakere og fordeler lag.
2. Hvert lag skanner sin QR-kode og spiller på én telefon. QR-en kan lastes ned/kopieres som
   bilde og deles i f.eks. Messenger. Flere telefoner kan følge samme lag via
   «👥 Flere telefoner på laget?».
3. Etter finalen viser laget en resultat-QR som spillleder skanner inn i resultatlisten
   (med premieutdeling og TV-presentasjonsmodus).
4. «Kun denne telefonen»-modus finnes for testing eller små grupper – med eget rebusvalg.
