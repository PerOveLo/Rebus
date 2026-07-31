# Operasjon Skylleviga – Den store øyprøven

Digital rebus for hagefest. Alt kjører i nettleseren – ingen server, ingen innlogging.

## Kom i gang

1. Legg satellittkartet i `public/skylleviga-kart.jpg` (appen fungerer også uten, med placeholder).
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
2. Gå til **Settings → Pages** i GitHub-repoet og sett **Source** til **GitHub Actions** (én gang).
3. Workflowen `.github/workflows/deploy.yml` bygger og publiserer automatisk ved hver push til `main`.

## Endre innhold

Alt innhold (historie, poster, spørsmål, poeng, kartposisjoner, koder, lagnavn) ligger i:

```
src/config/gameConfig.ts
```

- Kartposisjoner: prosent fra venstre/topp i kartbildet.
- Finalekode: `defaultFinalCode` (standard 2515) – kan også endres av spillleder i appen.
- Spilllederkode: `defaultLeaderPin` (standard 2026).

## GPS-kart og egen rebus (denne branchen)

- **Spillleder → Kart → 🛰️ GPS-kart**: søk opp adressen (f.eks. «Skylleviga 46, Kristiansand»),
  trykk «Plasser postene rundt sentrum» og dra postene dit de skal på ekte satellittkart.
  Lagene kan slå på GPS (valgfritt) og se sin egen posisjon – alt forblir lokalt på telefonen.
- **Spillleder → ✨ Tilpass**: plott inn egne navn og steder, så skrives hele historien og alle
  postene om («Sjursteg» blir «[ditt navn]steg»). Tilpasningen følger med i laglenkene.
- Kartfliser (Esri/OpenStreetMap) og adressesøk (Nominatim) er gratis og trenger ingen nøkler.
  Flisene caches for dårlig dekning; bildekart-modusen fungerer helt uten nett.

## Slik spilles det

1. Spillleder åpner appen → «Jeg er spillleder» → legger inn deltakere og fordeler lag.
2. Hvert lag skanner sin QR-kode og spiller på én telefon.
3. Etter finalen viser laget en resultat-QR som spillleder skanner inn i resultatlisten.
4. «Kun denne telefonen»-modus finnes for testing eller små grupper.
