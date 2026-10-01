# BHVKlaar.nl — Certificaat Generator

Genereert professionele, printbare certificaten (A4 liggend) voor BHVKlaar.nl op
basis van kant-en-klare HTML-templates.

## Certificaattypes

| Type | Template | Instructeur | Geldigheid |
|------|----------|-------------|------------|
| BHV | `template-bhv.html` | Ilias El Allati | 1 jaar |
| Weerbaarheid | `template-weerbaarheid.html` | Ilias El Allati | 1 jaar |
| Medicatie | `template-medicatie.html` | Wendy Tiemens | 1 jaar |

## Gebruik

1. Kopieer de juiste template.
2. Vervang de placeholders (naam, geboortedatum, datum behaald, geldig tot,
   certificaatnummer). De volledige instructies en nummering staan in
   [`CLAUDE.md`](CLAUDE.md).
3. Sla op als `voornaam-achternaam-type.html` (lowercase, met streepjes).
4. Open in de browser en print via Ctrl/Cmd+P → **liggend (landscape)** → opslaan als PDF.

## Templates aanpassen

Wijzig in de templates **alleen** de persoonlijke gegevens. De CSS, SVG-graphics
en layout blijven ongewijzigd, zodat alle certificaten consistent blijven.
