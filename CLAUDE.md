# BHVKlaar.nl - Certificaat Generator

## Wat dit doet
Als iemand je vraagt een certificaat te maken, gebruik dan de HTML-templates in deze map om professionele certificaten te genereren.

## Beschikbare certificaattypes

| Type | Template | Instructeur | Geldigheid |
|------|----------|-------------|------------|
| BHV | template-bhv.html | Ilias El Allati | 1 jaar |
| Weerbaarheid | template-weerbaarheid.html | Ilias El Allati | 1 jaar |
| Medicatie | template-medicatie.html | Wendy Tiemens | 1 jaar |

## Hoe een certificaat te maken

1. **Lees de juiste template** (bijv. `template-bhv.html`)
2. **Vervang alle placeholders:**
   - `NAAM INVULLEN` → volledige naam cursist
   - `DD-MM-JJJJ` (geboortedatum) → geboortedatum cursist
   - `DD-MM-JJJJ` (behaald op) → datum waarop cursist is geslaagd
   - `DD-MM-JJJJ` (geldig tot) → behaald datum + 1 jaar
   - `XXXX-JJJJ-NNNNN` → certificaatnummer (zie nummering hieronder)
3. **Sla op** als `voornaam-achternaam-type.html` (lowercase, streepjes)

> Het op het certificaat getoonde nummer bevat de **suffix** (bijv.
> `BHV-2026-00334-R4M7`), gelijk aan de sleutel in `certificaten-data.json`. De
> suffix is `<eerste letter voornaam><cijfer><eerste letter achternaam><cijfer>`.

## PDF genereren

De certificaten zijn ontworpen voor Chrome-print (Ctrl/Cmd+P → liggend → PDF).
Zonder browser kun je de PDF ook met WeasyPrint maken:

```bash
bash setup-fonts.sh                      # eenmalig per omgeving (fonts + tools)
python3 render-pdf.py voornaam-achternaam-type.html
```

`render-pdf.py` genereert de QR-code, tekent de schuine zijbalk als SVG en sluit
de lokale fonts (Montserrat/Playfair Display) in — zo benadert het de Chrome-print.

## Certificaatnummering

Formaat: `TYPE-JAAR-VOLGNUMMER` (5 cijfers, met voorloopnullen)

**Bron van waarheid:** `certificaten-data.json`. Dit bestand bevat alle uitgegeven
certificaten. Bereken het eerstvolgende nummer altijd uit dit bestand: pak per
`TYPE` het hoogste bestaande volgnummer en tel er 1 bij op. Werk het bestand bij
na elke afgifte (voeg een record toe met sleutel `<certificaatnummer>-<suffix>`).

Eerstvolgende beschikbare nummers (peildatum 08-06-2026, uit `certificaten-data.json`):

| Type | Omschrijving | Eerstvolgende |
|------|--------------|---------------|
| BHV | Bedrijfshulpverlening | `BHV-2026-00383` |
| WB | Weerbaarheid | `WB-2026-00166` |
| MED | Medicatietoediening | `MED-2026-00172` |
| EPI | Epilepsiezorg | `EPI-2026-00252` |
| INS | Diabeteszorg (insuline) | `INS-2026-00046` |
| TIL | Werken met Tilliften | `TIL-2026-00035` |
| WZD | Wet Zorg en Dwang (e-learning) | `WZD-2026-00030` |
| AGR | Agressiehantering | `AGR-2026-00025` |
| HP | Herhaling Voorbehouden Handelingen | `HP-2026-00022` |
| SLIK | Slikscholing | `SLIK-2026-00020` |
| SOND | Sondevoeding | `SOND-2026-00017` |
| VH | 12 Voorbehouden Handelingen | `VH-2026-00016` |
| WOND | Wondzorg (rood/geel/zwart) | `WOND-2026-00028` |
| TRC | Triple-C Methodiek | `TRC-2026-00030` |

> HTML-templates bestaan voor BHV, WB, MED, Voorbehouden Handelingen (VH),
> Epilepsiezorg (EPI), Wondzorg (WOND), Sondevoeding (SOND), Triple-C (TRC) en
> Diabeteszorg/insuline (INS). De overige types staan wel in de nummering, maar
> hebben (nog) geen template.

**Belangrijk:** Houd de nummering bij! Na elk certificaat gaat het volgnummer +1
omhoog. De tabel hierboven is een momentopname — `certificaten-data.json` is leidend.

## Bedrijfsgegevens (staan al in de templates)

- **Bedrijf:** BHVKlaar.nl – Onderdeel van Novasphere
- **Adres:** Ambachtweg 50, 3542 DH Utrecht
- **Tel:** +31 6 85489411
- **Email:** info@bhvklaar.nl
- **Plaats op certificaat:** Utrecht

## QR-code (verificatie)

De QR-code verwijst naar de verificatiepagina met het certificaatnummer (incl.
suffix) als `code`-parameter — hetzelfde formaat als de officieel uitgegeven
certificaten:

```
https://bhvklaar.nl/verificatie?code=<certificaatnummer>
```

Bijvoorbeeld: `https://bhvklaar.nl/verificatie?code=BHV-2026-00335-B3H7`. Zowel de
templates (JS leest het nummer uit het certificaat) als `render-pdf.py` bouwen
deze URL automatisch op uit het ingevulde certificaatnummer.

## Voorbeeld interactie

Gebruiker zegt: "Maak BHV certificaat voor Jan de Vries, geboren 15-03-1990, behaald 10-04-2026"

Jij doet:
1. Lees `template-bhv.html`
2. Vervang:
   - NAAM INVULLEN → Jan de Vries
   - Geboortedatum DD-MM-JJJJ → 15-03-1990
   - Behaald op DD-MM-JJJJ → 10-04-2026
   - Geldig tot DD-MM-JJJJ → 10-04-2027
   - XXXX-JJJJ-NNNNN → BHV-2026-00284
3. Sla op als `jan-de-vries-bhv.html`
4. Geef de gebruiker het bestandspad

## E-mail template (optioneel)

Als de gebruiker vraagt om een e-mail op te stellen:

```
Beste [NAAM],

Hierbij ontvang je jouw [TYPE] certificaat van BHVKlaar.nl.

Certificaatnummer: [NUMMER]
Behaald op: [DATUM]
Geldig tot: [DATUM + 1 JAAR]

Je kunt het certificaat openen in je browser en printen via Ctrl+P (kies liggend/landscape formaat).

Mocht je vragen hebben, neem gerust contact op.

Met vriendelijke groet,
Ilias El Allati
BHVKlaar.nl
+31 6 85489411
info@bhvklaar.nl
```

## Belangrijk

- Certificaten zijn HTML-bestanden, ontworpen voor A4 liggend (landscape) printen
- Gebruik altijd UTF-8 encoding bij het opslaan
- Wijzig NOOIT de CSS, SVG-graphics, of layout — alleen de persoonlijke gegevens invullen
