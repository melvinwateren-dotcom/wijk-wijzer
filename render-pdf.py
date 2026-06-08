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
import sys, re, base64, qrcode
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

    # QR-URL uit de originele <script>new QRCode(... text:"...")> halen.
    m = re.search(r'new QRCode\([^)]*?text\s*:\s*"([^"]+)"', html, flags=re.S)
    qr_url = m.group(1) if m else "https://bhvklaar.nl/"
    html = html.replace('<div class="qr-box" id="qrcode"></div>',
                        f'<div class="qr-box"><img src="{qr_data_uri(qr_url)}"></div>')

    # Schuine zijbalk i.p.v. clip-path-divs.
    html = html.replace('<div class="bg-sidebar"></div><div class="bg-sidebar-dots"></div>',
                        SIDEBAR_SVG)

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
