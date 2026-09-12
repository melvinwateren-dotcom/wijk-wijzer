#!/usr/bin/env python3
"""Render een ingevuld certificaat-HTML naar PDF (A4 liggend) met WeasyPrint.

Reproduceert de Chrome-print zo getrouw mogelijk zonder browser:
- genereert de QR-code zelf (WeasyPrint draait geen JavaScript);
- tekent de schuin afgesneden zijbalk als inline-SVG (WeasyPrint ondersteunt
  geen CSS `clip-path`);
- verwijdert externe verwijzingen (Google Fonts / QR-CDN), de echte fonts komen
  lokaal uit fontconfig (zie setup-fonts.sh).

Gebruik:  python3 render-pdf.py <invoer.html> [uitvoer.pdf]
"""
import sys, re, base64, glob, html as _html, qrcode
from pathlib import Path
from weasyprint import HTML

# Schuine zijbalk (zelfde maten als in alle templates: 65mm breed, onderhoek 84%).
SIDEBAR_SVG = (
    '<svg style="position:absolute;top:0;left:0;z-index:0;" width="65mm" height="200mm" '
    'viewBox="0 0 65 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">'
    '<defs><linearGradient id="sg" x1="0" y1="0" x2="0.18" y2="1">'
    '<stop offset="0.55" stop-color="#0B1A3E"/><stop offset="1" stop-color="#122150"/>'
    '</linearGradient>'
    '<pattern id="dots" width="7" height="7" patternUnits="userSpaceOnUse">'
    '<circle cx="1" cy="1" r="0.5" fill="#ffffff" fill-opacity="0.06"/></pattern></defs>'
    '<polygon points="0,0 65,0 54.6,200 0,200" fill="url(#sg)"/>'
    '<polygon points="0,0 65,0 54.6,200 0,200" fill="url(#dots)"/></svg>'
)


def vertical_text_svg(raw: str) -> str:
    """Verticale zijbalk-tekst als SVG (WeasyPrint negeert CSS `writing-mode`).

    Tekent de tekst van onder naar boven, gecentreerd — zoals in het origineel.
    """
    txt = _html.unescape(raw).upper()
    fs, ls = 1.76, 0.8  # mm: ~5pt lettergrootte, ~3px letter-spacing
    try:
        from PIL import ImageFont
        font_path = next(iter(glob.glob('/usr/share/fonts/**/Montserrat*.ttf', recursive=True)))
        length = ImageFont.truetype(font_path, 100).getlength(txt) * (fs / 100)
    except Exception:
        length = len(txt) * fs * 0.62          # ruwe schatting als fallback
    length += (len(txt) - 1) * ls
    h, w = length + 6, 6
    esc = _html.escape(txt)
    return (f'<svg width="{w}mm" height="{h:.1f}mm" viewBox="0 0 {w} {h:.1f}" '
            f'xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible;">'
            f'<text transform="translate({w/2},{h/2}) rotate(-90)" text-anchor="middle" '
            f'dominant-baseline="central" font-family="Montserrat" font-size="{fs}" '
            f'font-weight="600" letter-spacing="{ls}" '
            f'fill="rgba(255,255,255,0.25)">{esc}</text></svg>')


def qr_data_uri(text: str) -> str:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=1, border=2)
    qr.add_data(text)
    qr.make(fit=True)
    m = qr.get_matrix()
    n = len(m)
    rects = "".join(
        f'<rect x="{x}" y="{y}" width="1" height="1"/>'
        for y, row in enumerate(m) for x, v in enumerate(row) if v
    )
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" '
           f'shape-rendering="crispEdges"><rect width="{n}" height="{n}" fill="#fff"/>'
           f'<g fill="#0B1A3E">{rects}</g></svg>')
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()


def render(in_path: str, out_path: str) -> None:
    html = Path(in_path).read_text(encoding="utf-8")

    # QR verwijst naar de verificatiepagina met het certificaatnummer als ?code=
    # (zelfde formaat als de officieel uitgegeven certificaten).
    cm = re.search(r'class="cert-nr">[^<]*<strong>([^<]+)</strong>', html)
    if cm:
        qr_url = "https://bhvklaar.nl/verificatie?code=" + cm.group(1).strip()
    else:
        m = re.search(r'new QRCode\(.*?text\s*:\s*"([^"]+)"', html, flags=re.S)
        qr_url = m.group(1) if m else "https://bhvklaar.nl/"
    html = html.replace('<div class="qr-box" id="qrcode"></div>',
                        f'<div class="qr-box"><img src="{qr_data_uri(qr_url)}"></div>')

    # Schuine zijbalk i.p.v. clip-path-divs.
    html = html.replace('<div class="bg-sidebar"></div><div class="bg-sidebar-dots"></div>',
                        SIDEBAR_SVG)

    # Verticale zijbalk-tekst als SVG (writing-mode wordt niet ondersteund).
    html = re.sub(r'<div class="vertical-text">(.*?)</div>',
                  lambda m: vertical_text_svg(m.group(1)), html)

    # Externe netwerk-afhankelijkheden weg.
    html = re.sub(r'<link[^>]*fonts\.googleapis[^>]*>', '', html)
    html = re.sub(r'<script[^>]*qrcode\.min\.js[^>]*></script>', '', html)
    html = re.sub(r'<script>new QRCode.*?</script>', '', html, flags=re.S)

    HTML(string=html, base_url=str(Path(in_path).parent)).write_pdf(out_path)
    print(f"PDF geschreven: {out_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Gebruik: python3 render-pdf.py <invoer.html> [uitvoer.pdf]")
    src = sys.argv[1]
    dst = sys.argv[2] if len(sys.argv) > 2 else str(Path(src).with_suffix(".pdf"))
    render(src, dst)
