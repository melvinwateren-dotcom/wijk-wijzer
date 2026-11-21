#!/usr/bin/env bash
# Installeert de lettertypes (Montserrat + Playfair Display) en de Python-tools
# die render-pdf.py nodig heeft. Draai dit eenmalig per (verse) omgeving.
#
# De containeromgeving is efemeer: na een reset moet dit opnieuw draaien.
set -euo pipefail

echo ">> Python-pakketten (WeasyPrint + qrcode + pillow)"
# python3 -m pip: 'pip3' hoort in deze containers soms bij een andere Python-versie.
# Eigen Pillow forceren: de systeem-Pillow is voor een andere Python gebouwd.
python3 -m pip install --quiet --disable-pip-version-check weasyprint qrcode pymupdf
python3 -m pip install --quiet --disable-pip-version-check --ignore-installed pillow

echo ">> Lettertypes ophalen via npm (bevatten .ttf-bestanden)"
TMP="$(mktemp -d)"
( cd "$TMP" && npm install --silent --no-audit --no-fund \
    @expo-google-fonts/montserrat @expo-google-fonts/playfair-display )

echo ">> Lettertypes registreren in fontconfig"
DEST=/usr/share/fonts/truetype/bhv
mkdir -p "$DEST"
find "$TMP/node_modules/@expo-google-fonts" -iname '*.ttf' -exec cp {} "$DEST/" \;
fc-cache -f "$DEST" >/dev/null
rm -rf "$TMP"

echo ">> Klaar. Geregistreerde families:"
fc-list | grep -iE 'bhv/' | grep -oiE '(Montserrat|Playfair Display)[^:]*' | sort -u | head
echo ">> Genereer nu een PDF met:  python3 render-pdf.py <certificaat>.html"
