"""Command line: ``python -m asyncapi_viewer copy-assets DIR``.

Copies the packaged viewer (module, IIFE, theme) into ``DIR`` and prints the Subresource
Integrity hash of each file. For hosts without plugin hooks (Zensical, plain Python-Markdown)
where the MkDocs plugin cannot publish the files itself: copy them under the docs directory,
then point ``viewer_js`` and ``viewer_theme`` at them and pass the hashes as the integrity
options (or set those to ``''``).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from asyncapi_viewer import __version__, assets


def main(argv: "list[str] | None" = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m asyncapi_viewer", description=__doc__.split("\n\n")[1])
    parser.add_argument("--version", action="version", version=f"asyncapi-viewer {__version__}")
    commands = parser.add_subparsers(dest="command", required=True)
    copy = commands.add_parser("copy-assets", help="copy the packaged viewer files into a directory and print their SRI hashes")
    copy.add_argument("dest", type=Path, help="target directory, for example docs/assets/asyncapi-viewer")
    args = parser.parse_args(argv)
    if args.command == "copy-assets":
        if not assets.packaged():
            print("the viewer is not packaged in this installation (build it and run scripts/sync_viewer.py)", file=sys.stderr)
            return 1
        hashes = assets.copy_assets(args.dest)
        print(f"copied {len(hashes)} files (viewer {assets.viewer_version()}) into {args.dest}")
        for name, sri in hashes.items():
            print(f"  {name}  {sri}")
        return 0
    return 2  # pragma: no cover - argparse rejects unknown commands


if __name__ == "__main__":
    raise SystemExit(main())
