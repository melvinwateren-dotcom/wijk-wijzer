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

## Certificaatnummering

Formaat: `TYPE-JAAR-VOLGNUMMER` (5 cijfers, met voorloopnullen)

- BHV: `BHV-2026-00284` (volgende beschikbare)
- Weerbaarheid: `WB-2026-00120` (volgende beschikbare)
- Medicatie: `MED-2026-00004` (volgende beschikbare)

**Belangrijk:** Houd de nummering bij! Na elk certificaat gaat het volgnummer +1 omhoog.

## Bedrijfsgegevens (staan al in de templates)

- **Bedrijf:** BHVKlaar.nl – Onderdeel van Novasphere
- **Adres:** Ambachtweg 50, 3542 DH Utrecht
- **Tel:** +31 6 85489411
- **Email:** info@bhvklaar.nl
- **Plaats op certificaat:** Utrecht

## QR-code URLs (staan al in de templates)

- BHV → https://bhvklaar.nl/bhv-opleiding/
- Weerbaarheid → https://bhvklaar.nl/weerbaarheidstraining/
- Medicatie → https://bhvklaar.nl/medicatie-training/

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
