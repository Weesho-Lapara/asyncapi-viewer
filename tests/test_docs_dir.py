"""The bare extension against a docs directory (hosts without plugin hooks: Zensical, MkDocs 2.0)."""

from __future__ import annotations

import re

import markdown
import pytest

from asyncapi_viewer import assets, fallback
from asyncapi_viewer.extension import AsyncAPIViewerExtension
from tests.conftest import MINIMAL_SCHEMA


def render(text: str, warnings_list=None, **config) -> str:
    if warnings_list is not None:
        config["warn"] = warnings_list.append
    return markdown.markdown(text, extensions=[AsyncAPIViewerExtension(**config)])


def inner(out: str, index: int = 0) -> str:
    return re.findall(r"<asyncapi-viewer [^>]*>(.*?)</asyncapi-viewer>", out, re.S)[index]


def make_docs(tmp_path):
    docs = tmp_path / "docs"
    (docs / "api").mkdir(parents=True)
    (docs / "api" / "events.json").write_text(MINIMAL_SCHEMA)
    (docs / "shared.json").write_text(MINIMAL_SCHEMA)
    (docs / "a").mkdir()
    (docs / "b").mkdir()
    (docs / "a" / "dup.json").write_text(MINIMAL_SCHEMA)
    (docs / "b" / "dup.json").write_text(MINIMAL_SCHEMA)
    return docs


def test_resolve_in_docs_exact_absolute_suffix_ambiguous_and_missing(tmp_path):
    docs = make_docs(tmp_path)
    assert fallback.resolve_in_docs("api/events.json", docs) == (str(docs / "api" / "events.json"), None)
    assert fallback.resolve_in_docs("/api/events.json", docs) == (str(docs / "api" / "events.json"), None)
    # A page-relative path from a nested page: the unique suffix match wins.
    assert fallback.resolve_in_docs("events.json", docs) == (str(docs / "api" / "events.json"), None)
    assert fallback.resolve_in_docs("shared.json?x=1#f", docs) == (str(docs / "shared.json"), None)
    path, reason = fallback.resolve_in_docs("dup.json", docs)
    assert path is None and "matches 2 files" in reason
    path, reason = fallback.resolve_in_docs("nope.json", docs)
    assert path is None and "was not found" in reason
    assert fallback.resolve_in_docs("/nope.json", docs) == (None, "'/nope.json' is not under " + str(docs))
    assert fallback.resolve_in_docs("https://example.com/x.json", docs) == (None, None)


def test_auto_detected_docs_dir_indexes_documents_and_warns_on_missing_ones(tmp_path, warnings_list):
    make_docs(tmp_path)  # tests run from tmp_path, so ./docs is auto-detected
    out = render(
        '<asyncapi-viewer src="events.json"/>\n\n<asyncapi-viewer src="nope.json"/>\n\n<asyncapi-viewer src="dup.json"/>\n\n<asyncapi-viewer src="https://x.test/a.json"/>',
        warnings_list,
        viewer_js="v.js",
        viewer_theme="t.css",
    )
    assert inner(out, 0).startswith("<ul data-asyncapi-fallback")
    assert inner(out, 1) == "" and inner(out, 2) == "" and inner(out, 3) == ""
    assert any("'nope.json' was not found under docs" in w for w in warnings_list)
    assert any("'dup.json' matches 2 files" in w for w in warnings_list)
    assert len(warnings_list) == 2


def test_explicit_docs_dir_and_disabling_it(tmp_path, warnings_list):
    docs = make_docs(tmp_path)
    site = tmp_path / "elsewhere"
    site.mkdir()
    (site / "spec.json").write_text(MINIMAL_SCHEMA)
    out = render('<asyncapi-viewer src="spec.json"/>', warnings_list, docs_dir=str(site), viewer_js="v.js", viewer_theme="t.css")
    assert inner(out).startswith("<ul data-asyncapi-fallback") and warnings_list == []
    # docs_dir='' falls back to the working directory and never warns.
    out = render('<asyncapi-viewer src="api/events.json"/>', warnings_list, docs_dir="", viewer_js="v.js", viewer_theme="t.css")
    assert inner(out) == "" and warnings_list == []
    assert docs.exists()


def test_a_custom_file_resolver_bypasses_the_docs_dir_lookup(tmp_path, warnings_list):
    make_docs(tmp_path)
    out = render('<asyncapi-viewer src="anything"/>', warnings_list, file_resolver=lambda src: str(tmp_path / "docs" / "shared.json"), viewer_js="v.js", viewer_theme="t.css")
    assert inner(out).startswith("<ul data-asyncapi-fallback") and warnings_list == []


def test_with_a_docs_dir_the_viewer_is_published_under_it_and_linked_docs_relative(tmp_path, warnings_list):
    if not assets.packaged():
        pytest.skip("viewer not packaged (build it and run scripts/sync_viewer.py)")
    make_docs(tmp_path)
    out = render('<asyncapi-viewer src="shared.json"/>', warnings_list)
    published = tmp_path / "docs" / "assets" / "asyncapi-viewer"
    for name in assets.VIEWER_FILES:
        assert (published / name).read_bytes() == assets.static_path(name).read_bytes()
    assert f'<script type="module" src="assets/asyncapi-viewer/asyncapi-viewer.js" integrity="{assets.integrity("asyncapi-viewer.js")}" crossorigin="anonymous"></script>' in out
    assert f'<link rel="stylesheet" href="assets/asyncapi-viewer/asyncapi-theme.css" integrity="{assets.integrity("asyncapi-theme.css")}" crossorigin="anonymous">' in out
    assert "cdn.jsdelivr.net" not in out and warnings_list == []
    # A second build leaves identical files untouched.
    before = {name: (published / name).stat().st_mtime_ns for name in assets.VIEWER_FILES}
    render('<asyncapi-viewer src="shared.json"/>')
    assert {name: (published / name).stat().st_mtime_ns for name in assets.VIEWER_FILES} == before
    # assets_dir moves the copy; an explicit viewer_js stops the publishing of the script.
    out = render('<asyncapi-viewer src="shared.json"/>', assets_dir="static/viewer/")
    assert (tmp_path / "docs" / "static" / "viewer" / "asyncapi-viewer.js").exists()
    assert 'src="static/viewer/asyncapi-viewer.js"' in out
    out = render('<asyncapi-viewer src="shared.json"/>', viewer_js="https://cdn.example/v.js", viewer_js_integrity="", viewer_theme="t.css", viewer_theme_integrity="")
    assert '<script type="module" src="https://cdn.example/v.js"></script>' in out


def test_without_a_docs_dir_the_bare_extension_still_defaults_to_the_cdn(tmp_path):
    if not assets.packaged():
        pytest.skip("viewer not packaged")
    out = render('<asyncapi-viewer src="a.json"/>')
    assert "cdn.jsdelivr.net/npm/asyncapi-viewer@" in out
    assert not (tmp_path / "docs").exists()
