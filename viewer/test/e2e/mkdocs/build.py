#!/usr/bin/env python3
"""Build the instant-navigation fixture site (ROADMAP chunk 3.1).

Material for MkDocs with ``navigation.instant`` and the plugin on the new renderer, so
``instant.spec.ts`` can prove that navigating between pages with viewers renders every one
without a full reload. The example documents are copied in from docs/examples/ and the site
lands in ``site/`` (both ignored by git). Requires ``pip install -e ".[docs]"`` from the
repository root and ``python scripts/sync_viewer.py`` after ``npm run build``::

    python viewer/test/e2e/mkdocs/build.py
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]


def main() -> None:
    examples = HERE / "docs" / "examples"
    examples.mkdir(exist_ok=True)
    for name in ("orders-v3.yaml", "accounts-v2.json"):
        shutil.copyfile(ROOT / "docs" / "examples" / name, examples / name)
    subprocess.run([sys.executable, "-m", "mkdocs", "build", "--strict", "-f", str(HERE / "mkdocs.yml")], check=True)
    index = (HERE / "site" / "index.html").read_text(encoding="utf-8")
    if "<asyncapi-viewer " not in index or 'type="module"' not in index:
        raise SystemExit("the built fixture site does not contain the viewer element and its module script")
    print(f"built {HERE.relative_to(ROOT) / 'site'}")


if __name__ == "__main__":
    main()
