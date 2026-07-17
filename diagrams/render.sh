#!/usr/bin/env bash
# Render all Mermaid diagram sources to SVG in public/diagrams/.
# Diagrams are editable: change the .mmd source and re-run this script.
set -euo pipefail
cd "$(dirname "$0")/.."
for f in diagrams/d*.mmd; do
  out="public/diagrams/$(basename "${f%.mmd}").svg"
  echo "render $f -> $out"
  npx mmdc -p diagrams/puppeteer-config.json -c diagrams/mermaid-theme.json \
    -i "$f" -o "$out" -b transparent
done
