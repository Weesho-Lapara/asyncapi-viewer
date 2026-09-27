"""``python -m asyncapi_viewer copy-assets``: the viewer files for hosts without plugin hooks."""

from __future__ import annotations

import subprocess
import sys

import pytest

from asyncapi_viewer import __main__ as cli
from asyncapi_viewer import assets


def test_copy_assets_writes_the_files_and_prints_their_hashes(tmp_path, capsys):
    if not assets.packaged():
        pytest.skip("viewer not packaged")
    assert cli.main(["copy-assets", str(tmp_path / "v")]) == 0
    out = capsys.readouterr().out
    for name in assets.VIEWER_FILES:
        assert (tmp_path / "v" / name).read_bytes() == assets.static_path(name).read_bytes()
        assert f"{name}  {assets.integrity(name)}" in out


def test_module_entry_point_and_version():
    result = subprocess.run([sys.executable, "-m", "asyncapi_viewer", "--version"], capture_output=True, text=True)
    assert result.returncode == 0 and "asyncapi-viewer" in result.stdout
    result = subprocess.run([sys.executable, "-m", "asyncapi_viewer"], capture_output=True, text=True)
    assert result.returncode == 2 and "copy-assets" in result.stderr
