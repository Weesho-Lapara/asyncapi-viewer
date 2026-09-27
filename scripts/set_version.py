#!/usr/bin/env python3
"""Set the one version number the Python package and the npm package share.

    python scripts/set_version.py 2.0.0      # write both
    python scripts/set_version.py --check    # exit 1 when they differ (CI, publish)

Writes ``__version__`` in src/asyncapi_viewer/__init__.py and ``version`` in viewer/package.json
(and package-lock.json). The release workflow refuses a tag whose version differs from both.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INIT = ROOT / "src" / "asyncapi_viewer" / "__init__.py"
PACKAGE = ROOT / "viewer" / "package.json"
LOCK = ROOT / "viewer" / "package-lock.json"
VERSION_RE = re.compile(r'^__version__ = "([^"]+)"$', re.M)


def python_version() -> str:
    match = VERSION_RE.search(INIT.read_text(encoding="utf-8"))
    if not match:
        raise SystemExit(f"no __version__ in {INIT}")
    return match.group(1)


def npm_version() -> str:
    return json.loads(PACKAGE.read_text(encoding="utf-8"))["version"]


def set_json_version(path: Path, version: str, lock: bool = False) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    data["version"] = version
    if lock:
        data["packages"][""]["version"] = version
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def main(argv: list[str]) -> int:
    if not argv or argv == ["--check"]:
        py, npm = python_version(), npm_version()
        print(f"python {py}, npm {npm}")
        return 0 if py == npm else 1
    version = argv[0]
    if not re.fullmatch(r"\d+\.\d+\.\d+(?:[-.][0-9A-Za-z.]+)?", version):
        raise SystemExit(f"not a version: {version}")
    INIT.write_text(VERSION_RE.sub(f'__version__ = "{version}"', INIT.read_text(encoding="utf-8")), encoding="utf-8")
    set_json_version(PACKAGE, version)
    if LOCK.exists():
        set_json_version(LOCK, version, lock=True)
    print(f"set {version} in {INIT.relative_to(ROOT)}, {PACKAGE.relative_to(ROOT)} and the lock file")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
