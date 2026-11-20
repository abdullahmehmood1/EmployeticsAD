#!/usr/bin/env bash
# Package the Remotion project cleanly for Google Colab upload (excluding node_modules, out, .git).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_ZIP="${ROOT_DIR}/employetics_ad_colab.zip"

cd "${ROOT_DIR}"
rm -f "${OUT_ZIP}"

if command -v zip >/dev/null 2>&1; then
  zip -r "${OUT_ZIP}" \
    package.json \
    package-lock.json \
    tsconfig.json \
    remotion.config.ts \
    src \
    public \
    scripts \
    audio \
    -x "*/.DS_Store" "*/__pycache__/*" "*.pyc" "public/audio/*.mp3" "public/audio/vo/*.mp3"
else
  python3 - <<'PY'
import os, zipfile
from pathlib import Path

root = Path.cwd()
out_zip = root / "employetics_ad_colab.zip"
targets = [
    "package.json", "package-lock.json", "tsconfig.json", "remotion.config.ts",
    "src", "public", "scripts", "audio"
]
skip_parts = {"__pycache__", ".git", "node_modules", "out"}

with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for item in targets:
        p = root / item
        if not p.exists():
            continue
        if p.is_file():
            zf.write(p, p.relative_to(root))
        else:
            for f in p.rglob("*"):
                if f.is_file() and not any(part in skip_parts for part in f.parts):
                    if f.name == ".DS_Store" or f.suffix == ".pyc":
                        continue
                    zf.write(f, f.relative_to(root))
print(f"Created Colab bundle: {out_zip}")
PY
fi

echo "Created Colab bundle: ${OUT_ZIP}"
